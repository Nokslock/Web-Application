"use client";

import { useState, useRef, useEffect } from "react";
import {
  FaPlus,
  FaGlobe,
  FaCreditCard,
  FaWallet,
  FaFile,
  FaXmark,
  FaUserShield,
  FaCheck,
  FaCloudArrowUp,
  FaSpinner,
  FaTrash,
  FaLock
} from "react-icons/fa6";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { encryptData } from "@/lib/crypto";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

type VaultType = "password" | "card" | "crypto" | "file";

interface DashboardFabProps {
  vaultId?: string;
  defaultShareWithNok?: boolean; // New prop to inherit vault status
}

export default function DashboardFab({ vaultId, defaultShareWithNok = false }: DashboardFabProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<VaultType>("password");
  const [loading, setLoading] = useState(false);
  const [shareWithNok, setShareWithNok] = useState(defaultShareWithNok);
  const [isLocked, setIsLocked] = useState(false);

  // Reset state when opening (respecting defaults)
  useEffect(() => {
    if (isOpen) {
      setShareWithNok(defaultShareWithNok);
    }
  }, [isOpen, defaultShareWithNok]);

  // --- CHANGED: Added 'pendingFile' to fix the double-add bug ---
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [pendingFile, setPendingFile] = useState<File | null>(null); // Holds file while loading
  const [stagingProgress, setStagingProgress] = useState(0);

  const [name, setName] = useState("");
  const [details, setDetails] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const inputClass = "w-full p-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-sm text-gray-700 dark:text-gray-200 transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 focus:bg-white dark:focus:bg-gray-900 placeholder:text-gray-400 dark:placeholder:text-gray-500";

  // --- 1. HANDLE FILE SELECTION (Start Staging) ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newFile = e.target.files[0];
      
      // Prevent duplicates
      if (stagedFiles.some(f => f.name === newFile.name && f.size === newFile.size)) {
        toast.warning("This file is already staged.");
        return;
      }

      // Start the process by setting the pending file
      setPendingFile(newFile);
      setStagingProgress(0);
    }
  };

  // --- 2. EFFECT: Handle Progress & Completion Safely ---
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (pendingFile) {
      // Start counting up
      interval = setInterval(() => {
        setStagingProgress((prev) => {
          if (prev >= 100) {
            return 100; // Cap at 100
          }
          return prev + 20; // Increase progress
        });
      }, 100);
    }

    return () => clearInterval(interval);
  }, [pendingFile]);

  // --- 3. EFFECT: Watch for 100% Completion ---
  useEffect(() => {
    if (pendingFile && stagingProgress >= 100) {
      // Add to list safely here
      setStagedFiles((prev) => [...prev, pendingFile]);
      
      // Auto-set title if it's the first file
      if (!name && stagedFiles.length === 0) {
        setName(pendingFile.name);
      }

      // Reset for next file
      setPendingFile(null);
      setStagingProgress(0);
      
      // Clear input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [stagingProgress, pendingFile, name, stagedFiles.length]);


  const removeStagedFile = (indexToRemove: number) => {
    setStagedFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // --- 4. HANDLE SUBMIT (Same as before) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authenticated user not found");

      if (activeTab === "file") {
        if (stagedFiles.length === 0) throw new Error("Please select at least one file.");

        for (const file of stagedFiles) {
          const filePath = `${user.id}/${Date.now()}_${file.name}`;
          const { error: uploadError } = await supabase.storage.from("vault-files").upload(filePath, file);
          if (uploadError) throw uploadError;

          const dataToEncrypt = {
            fileName: file.name,
            fileSize: file.size,
            storagePath: filePath,
          };

          const encryptedBlob = encryptData(dataToEncrypt);

          const { error } = await (supabase.from("vault_items") as any).insert({
            user_id: user.id,
            vault_id: vaultId || null, // Add to specific vault if provided
            type: "file",
            name: stagedFiles.length === 1 ? name : file.name,
            ciphertext: encryptedBlob,
            share_with_nok: shareWithNok,
          });
          if (error) throw error;
        }
      } else {
        // ... Normal logic ...
        const encryptedBlob = encryptData(details);
        const { error } = await (supabase.from("vault_items") as any).insert({
          user_id: user.id,
          vault_id: vaultId || null, // Add to specific vault if provided
          type: activeTab,
          name: name,
          ciphertext: encryptedBlob,
          share_with_nok: shareWithNok,
          is_locked: isLocked, // Handle db lock column
        });
        if (error) throw error;
      }

      toast.success(stagedFiles.length > 1 ? `${stagedFiles.length} files saved!` : "Item saved securely!");
      
      setIsOpen(false);
      setName("");
      setDetails({});
      setShareWithNok(false);
      setIsLocked(false);
      setStagedFiles([]);
      router.refresh();
      
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error saving item.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl shadow-blue-500/30 dark:shadow-none flex items-center justify-center z-50"
      >
        <FaPlus size={24} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: 100, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 p-4 shrink-0">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white">Add to Vault</h2>
                  <button onClick={() => setIsOpen(false)} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition text-gray-600 dark:text-gray-300">
                    <FaXmark />
                  </button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  <TabButton active={activeTab === "password"} onClick={() => setActiveTab("password")} icon={<FaGlobe />} label="Login" />
                  <TabButton active={activeTab === "card"} onClick={() => setActiveTab("card")} icon={<FaCreditCard />} label="Card" />
                  <TabButton active={activeTab === "crypto"} onClick={() => setActiveTab("crypto")} icon={<FaWallet />} label="Crypto" />
                  <TabButton active={activeTab === "file"} onClick={() => setActiveTab("file")} icon={<FaFile />} label="File" />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Item Title</label>
                  <input
                    required={stagedFiles.length === 0}
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={activeTab === "file" && stagedFiles.length > 0 ? "Using filenames..." : "e.g. My Secret Item"}
                    disabled={activeTab === "file" && stagedFiles.length > 1}
                    className={`${inputClass} disabled:bg-gray-100 disabled:text-gray-400`}
                  />
                </div>

                {activeTab === "password" && (
                   <>
                     <input name="url" placeholder="Website URL" onChange={handleInputChange} className={inputClass} />
                     <input name="username" placeholder="Username / Email" onChange={handleInputChange} className={inputClass} />
                     <input name="password" type="password" placeholder="Password" onChange={handleInputChange} className={inputClass} />
                   </>
                )}
                {activeTab === "card" && (
                   <>
                     <input name="cardholder" placeholder="Cardholder Name" onChange={handleInputChange} className={inputClass} />
                     <input name="number" placeholder="Card Number" maxLength={19} onChange={handleInputChange} className={inputClass} />
                     <div className="grid grid-cols-2 gap-4">
                       <input name="expiry" placeholder="MM/YY" maxLength={5} onChange={handleInputChange} className={inputClass} />
                       <input name="cvv" placeholder="CVV" maxLength={4} type="password" onChange={handleInputChange} className={inputClass} />
                     </div>
                     <input name="pin" placeholder="Card PIN" type="password" onChange={handleInputChange} className={inputClass} />
                   </>
                )}
                {activeTab === "crypto" && (
                   <>
                     <input name="network" placeholder="Network" onChange={handleInputChange} className={inputClass} />
                     <input name="address" placeholder="Address" onChange={handleInputChange} className={inputClass} />
                     <textarea name="seed_phrase" placeholder="Seed Phrase" onChange={handleInputChange} className={`${inputClass} h-24 pt-3`} />
                   </>
                )}

                {activeTab === "file" && (
                  <>
                    {/* --- LIST OF STAGED FILES --- */}
                    {stagedFiles.length > 0 && (
                        <div className="space-y-2 mb-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                            {stagedFiles.map((file, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="h-8 w-8 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 rounded-lg flex items-center justify-center shrink-0">
                                            <FaFile size={14} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{file.name}</p>
                                            <p className="text-[10px] text-blue-500 font-medium">Ready</p>
                                        </div>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => removeStagedFile(idx)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                                    >
                                        <FaTrash size={12} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* --- UPLOAD AREA (ADD MORE) --- */}
                    {pendingFile ? (
                        <div className="border-2 border-solid border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center relative overflow-hidden">
                             <motion.div 
                                className="absolute bottom-0 left-0 h-1 bg-blue-500"
                                initial={{ width: "0%" }}
                                animate={{ width: `${stagingProgress}%` }}
                                transition={{ ease: "linear" }}
                             />
                             <div className="flex flex-col items-center justify-center gap-1">
                                <p className="text-xs font-bold text-gray-600 dark:text-gray-300">Staging...</p>
                             </div>
                        </div>
                    ) : (
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center relative hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer bg-gray-50 dark:bg-gray-800/50 group">
                            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                            
                            <div className="h-10 w-10 bg-white dark:bg-gray-700 rounded-full shadow-sm flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                                <FaPlus className="text-blue-500" size={16} />
                            </div>
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                {stagedFiles.length > 0 ? "Add another file" : "Tap to upload file"}
                            </p>
                        </div>
                    )}
                  </>
                )}

                {/* LOCK TOGGLE (Card & Wallet Only) */}
                {(activeTab === "card" || activeTab === "crypto") && (
                  <div 
                    onClick={() => setIsLocked(!isLocked)}
                    className={`mt-4 cursor-pointer flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 ${
                      isLocked 
                        ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" 
                        : "bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div className={`mt-0.5 shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      isLocked ? "bg-amber-500 border-amber-500" : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    }`}>
                      {isLocked && <FaCheck size={12} className="text-white" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <FaLock className={`text-sm ${isLocked ? "text-amber-600" : "text-gray-400"}`} />
                        <h4 className={`text-sm font-bold ${isLocked ? "text-amber-800 dark:text-amber-300" : "text-gray-700 dark:text-gray-300"}`}>
                          Lock with Password
                        </h4>
                      </div>
                      <p className={`text-xs mt-0.5 ${isLocked ? "text-amber-600/80 dark:text-amber-400/70" : "text-gray-500"}`}>
                        Require account password to view details.
                      </p>
                    </div>
                  </div>
                )}

                {/* NOK TOGGLE */}
                <div 
                  onClick={() => setShareWithNok(!shareWithNok)}
                  className={`mt-3 cursor-pointer flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 ${
                    shareWithNok 
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" 
                      : "bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className={`mt-0.5 shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    shareWithNok ? "bg-blue-600 border-blue-600" : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  }`}>
                    {shareWithNok && <FaCheck size={12} className="text-white" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <FaUserShield className={`text-sm ${shareWithNok ? "text-blue-600" : "text-gray-400"}`} />
                      <h4 className={`text-sm font-bold ${shareWithNok ? "text-blue-800 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"}`}>
                        Pass to Next of Kin
                      </h4>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  disabled={loading || (activeTab === "file" && stagedFiles.length === 0)}
                  type="submit"
                  className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition mt-4 shadow-lg shadow-blue-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && <FaSpinner className="animate-spin" />}
                  {loading 
                    ? `Uploading ${stagedFiles.length > 1 ? 'Files...' : '...'}` 
                    : `Save ${stagedFiles.length > 0 ? `(${stagedFiles.length})` : ''} Securely`
                  }
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all whitespace-nowrap border ${
        active
          ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200 dark:shadow-none"
          : "bg-white dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </button>
  );
}