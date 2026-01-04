"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { decryptData, encryptData } from "@/lib/crypto";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaXmark, FaUserShield, FaCheck, FaCopy, FaEye, FaEyeSlash, 
  FaFile, FaDownload, FaTrash, FaFloppyDisk, FaTriangleExclamation,
  FaLock, FaUnlock
} from "react-icons/fa6";
import { getIcon, getColorClasses } from "./utils";

interface ItemDetailModalProps {
  item: any;
  onClose: () => void;
}

export default function ItemDetailModal({ item, onClose }: ItemDetailModalProps) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  // State
  const [decryptedDetails, setDecryptedDetails] = useState<any | null>(null);
  const [editedDetails, setEditedDetails] = useState<any | null>(null);
  const [showSensitive, setShowSensitive] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // LOCK STATE
  const [isLocked, setIsLocked] = useState(item.is_locked);
  const [unlockPassword, setUnlockPassword] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);

  // SAVE AUTH STATE
  const [showSaveAuth, setShowSaveAuth] = useState(false);
  const [savePassword, setSavePassword] = useState("");
  const [isSavingAuth, setIsSavingAuth] = useState(false);
  
  // TOGGLE STATE for editing
  const [targetLockState, setTargetLockState] = useState(item.is_locked);

  // Decrypt on mount (ONLY IF NOT LOCKED)
  useEffect(() => {
     if (isLocked) return;

     try {
       const details = decryptData(item.ciphertext);
       setDecryptedDetails(details);
       setEditedDetails(details);
     } catch (err) {
       toast.error("Failed to decrypt item.");
       onClose();
     }
  }, [item, onClose, isLocked]);

  /* --- UNLOCK HANDLER --- */
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockPassword) return;
    
    setIsUnlocking(true);
    try {
      // 1. Get User Email
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("User email not found");

      // 2. Verify Password (re-auth)
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: unlockPassword,
      });

      if (error) {
        throw new Error("Incorrect password");
      }

      // 3. Success -> Unlock
      toast.success("Identity verified");
      setIsLocked(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUnlocking(false);
    }
  };


  // Actions
  const handleInputChange = (key: string, value: string) => {
    setEditedDetails((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000); 
    toast.success("Copied to clipboard");
  };

  // ACTUAL SAVE LOGIC (Extracted)
  const executeSave = async () => {
    setIsLoading(true);
    try {
      const newCiphertext = encryptData(editedDetails);
      const { error } = await (supabase.from("vault_items") as any)
        .update({ 
          ciphertext: newCiphertext,
          is_locked: targetLockState
        })
        .eq("id", item.id);

      if (error) throw error;
      toast.success("Changes saved successfully");
      router.refresh(); 
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to update item");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editedDetails) return;
    
    // IF LOCKED ITEM -> Require Password to Save
    if (item.is_locked) {
      setShowSaveAuth(true);
      return;
    }

    // Otherwise save directly
    executeSave();
  };

  const handleConfirmSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!savePassword) return;

    setIsSavingAuth(true);
    try {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user?.email) throw new Error("User unknown");

       const { error } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: savePassword
       });

       if (error) throw new Error("Incorrect password");

       // Success
       setShowSaveAuth(false);
       await executeSave();
       
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSavingAuth(false);
    }
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("vault_items")
        .delete()
        .eq("id", item.id);

      if (error) throw error;
      toast.success("Item deleted successfully");
      router.refresh();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete item");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!decryptedDetails?.storagePath || !decryptedDetails?.fileName) {
      toast.error("File details missing.");
      return;
    }
    setIsDownloading(true);
    try {
      const { data, error } = await supabase.storage
        .from("vault-files")
        .download(decryptedDetails.storagePath);

      if (error) throw error;
      if (!data) throw new Error("No data received");

      const url = window.URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = decryptedDetails.fileName; 
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Download started");
    } catch (error: any) {
      toast.error("Failed to download file.");
    } finally {
      setIsDownloading(false);
    }
  };

  const colors = getColorClasses(item.type);

  // --- SAVE AUTH OVERLAY (LOCKED ITEM EDIT) ---
  if (showSaveAuth) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={() => setShowSaveAuth(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />
        <motion.div 
           initial={{ scale: 0.9, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="relative z-10 bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center"
        >
          <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 h-20 w-20 rounded-full flex items-center justify-center mb-6 shadow-sm">
             <FaUserShield size={32} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Confirm Save</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
             This is a locked item. Please confirm your password to save changes.
          </p>
          
          <form onSubmit={handleConfirmSave} className="w-full space-y-4">
            <input 
              type="password"
              autoFocus
              value={savePassword}
              onChange={(e) => setSavePassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all text-center font-bold"
            />
            <div className="flex gap-3">
               <button 
                 type="button" 
                 onClick={() => setShowSaveAuth(false)}
                 className="flex-1 py-3.5 rounded-xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-bold text-sm bg-gray-100 dark:bg-gray-800 transition"
               >
                 Cancel
               </button>
               <button 
                 type="submit"
                 disabled={isSavingAuth || !savePassword}
                 className="flex-1 py-3.5 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {isSavingAuth ? "Verifying..." : <><FaCheck /> Confirm</>}
               </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  // --- LOCKED STATE VIEW ---
  if (isLocked) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />
        <motion.div 
           initial={{ scale: 0.9, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="relative z-10 bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center"
        >
          <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 h-20 w-20 rounded-full flex items-center justify-center mb-6 shadow-sm">
             <FaLock size={32} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Item Locked</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            This item is protected. Please enter your account password to verify your identity.
          </p>
          
          <form onSubmit={handleUnlock} className="w-full space-y-4">
            <input 
              type="password"
              autoFocus
              value={unlockPassword}
              onChange={(e) => setUnlockPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all text-center font-bold"
            />
            <div className="flex gap-3">
               <button 
                 type="button" 
                 onClick={onClose}
                 className="flex-1 py-3.5 rounded-xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-bold text-sm bg-gray-100 dark:bg-gray-800 transition"
               >
                 Cancel
               </button>
               <button 
                 type="submit"
                 disabled={isUnlocking || !unlockPassword}
                 className="flex-1 py-3.5 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {isUnlocking ? "Verifying..." : <><FaUnlock /> Unlock</>}
               </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  // Ensure details are loaded before showing normal modal
  if (!editedDetails) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh]"
      >
        
        {/* --- HEADER --- */}
        <div className="relative overflow-hidden p-8 pb-6 shrink-0">
          {/* Background Decorative Gradient */}
          <div className={`absolute top-0 right-0 w-64 h-64 ${colors.bg} blur-3xl rounded-full opacity-50 -translate-y-1/2 translate-x-1/2`}></div>

          <div className="relative z-10 flex justify-between items-start">
             <div className="flex gap-5 items-center">
                <motion.div 
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: "spring" }}
                  className={`h-16 w-16 rounded-2xl flex items-center justify-center text-2xl shadow-xl shadow-gray-200/50 dark:shadow-none ${colors.modalHeader}`}
                >
                   {getIcon(item.type)}
                </motion.div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                     <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${colors.badgeBg} ${colors.badgeText}`}>
                        {item.type}
                     </span>
                     {item.share_with_nok && (
                       <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                         <FaUserShield size={10} /> Family Shared
                       </span>
                     )}
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">{item.name}</h2>
                </div>
             </div>

             <button 
                onClick={onClose}
                className="group p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
             >
               <FaXmark className="group-hover:rotate-90 transition-transform duration-300" />
             </button>
          </div>
        </div>

        {/* --- SCROLLABLE CONTENT --- */}
        <div className="flex-1 overflow-y-auto px-8 py-2 custom-scrollbar space-y-6">
           
           {/* LOCK STATUS TOGGLE */}
           {(item.type === 'card' || item.type === 'crypto') && (
             <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${targetLockState ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}>
                      {targetLockState ? <FaLock size={14} /> : <FaUnlock size={14} />}
                   </div>
                   <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">Password Protection</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{targetLockState ? "Item is locked" : "Item is unlocked"}</p>
                   </div>
                </div>
                <button
                   onClick={() => setTargetLockState(!targetLockState)}
                   className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 border-2 border-transparent shrink-0 cursor-pointer ${targetLockState ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                   <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${targetLockState ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
             </div>
           )}

           {Object.entries(editedDetails).map(([key, value]: any, index) => {
            if (key === "storagePath" || key === "fileSize" || key === "fileName") return null;
            const isSecret = key.includes("password") || key.includes("pin") || key.includes("cvv") || key.includes("phrase");

            return (
              <motion.div 
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (index * 0.05) }}
              >
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1 mb-2 block">
                  {key.replace(/_/g, " ")}
                </label>
                
                <div className="relative group">
                  <input
                    type={isSecret ? (showSensitive ? "text" : "password") : "text"}
                    value={value}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    className={`
                      w-full bg-gray-50 dark:bg-gray-800/50 
                      text-gray-900 dark:text-white font-semibold text-lg
                      px-5 py-4 rounded-xl border-2 border-transparent
                      focus:bg-white dark:focus:bg-gray-900
                      ${colors.text.replace('text-', 'focus:border-')}
                      focus:ring-0 transition-all duration-300
                      placeholder-gray-400 shadow-sm
                    `}
                  />
                  
                  {/* Floating Action Buttons inside Input */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white dark:bg-gray-800 p-1 rounded-lg opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 shadow-sm border border-gray-100 dark:border-gray-700/50">
                      <button 
                        onClick={() => handleCopy(value, key)} 
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-400 hover:text-blue-500 transition-colors"
                        title="Copy"
                      >
                        {copiedField === key ? <FaCheck className="text-emerald-500" size={14} /> : <FaCopy size={14} />}
                      </button>
                      
                      {isSecret && (
                        <>
                          <div className="w-px h-4 bg-gray-200 dark:bg-gray-700"></div>
                          <button 
                            onClick={() => setShowSensitive(!showSensitive)} 
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-400 hover:text-blue-500 transition-colors"
                            title={showSensitive ? "Hide" : "Show"}
                          >
                            {showSensitive ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                          </button>
                        </>
                      )}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* File Dowload Card */}
          {item.type === "file" && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.2 }}
               className="p-6 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-col sm:flex-row items-center gap-5"
             >
                <div className="h-14 w-14 rounded-xl bg-white dark:bg-gray-700 flex items-center justify-center text-blue-500 shadow-sm">
                   <FaFile size={24} />
                </div>
                <div className="flex-1 text-center sm:text-left">
                   <h3 className="font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{decryptedDetails.fileName}</h3>
                   <p className="text-xs text-gray-500 font-medium mt-1">
                      {(decryptedDetails.fileSize / 1024).toFixed(1)} KB • Secure Storage
                   </p>
                </div>
                <button 
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="px-6 py-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-xl font-bold text-gray-700 dark:text-white shadow-sm transition-all flex items-center gap-2"
                >
                  {isDownloading ? "..." : <><FaDownload size={14} /> Download</>}
                </button>
             </motion.div>
          )}

           <div className="h-4"></div> {/* Bottom Spacer */}
        </div>

        {/* --- FOOTER ACTIONS --- */}
        <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-4">
           {isDeleteModalOpen ? (
             <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 flex items-center gap-3 bg-red-50 dark:bg-red-900/10 p-2 rounded-xl"
             >
                <div className="flex-1 text-center text-sm font-bold text-red-600 dark:text-red-400">
                   Are you sure?
                </div>
                <button 
                   onClick={() => setIsDeleteModalOpen(false)}
                   className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-xs font-bold shadow-sm hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button 
                   onClick={confirmDelete}
                   className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-red-700 transition"
                >
                  Yes, Delete
                </button>
             </motion.div>
           ) : (
             <>
                <button 
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="px-5 py-4 rounded-xl border border-red-100 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-95 transition-all outline-none"
                  title="Delete Item"
                >
                   <FaTrash />
                </button>
                <button 
                   onClick={handleSave}
                   disabled={isLoading}
                   className="flex-1 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 text-white dark:text-gray-900 font-bold rounded-xl shadow-lg shadow-gray-200 dark:shadow-none hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                   {isLoading ? "Saving..." : <><FaFloppyDisk /> Save Changes</>}
                </button>
             </>
           )}
        </div>

      </motion.div>
    </div>
  );
}
