"use client";

import { useState } from "react";
import { 
  FaIdCard, 
  FaWallet, 
  FaXmark, 
  FaEye, 
  FaEyeSlash, 
  FaFile, 
  FaArrowRight, 
  FaCopy, 
  FaCheck,
  FaUserShield,
  FaTrash,
  FaFloppyDisk,
  FaTriangleExclamation,
  FaDownload 
} from "react-icons/fa6";
import { IoKey, IoApps, IoDocumentText } from "react-icons/io5";
import { decryptData, encryptData } from "@/lib/crypto"; 
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client"; 
import { useRouter } from "next/navigation";
import { toast } from "sonner"; 

type VaultItem = {
  id: string;
  type: string;
  name: string;
  ciphertext: string;
  created_at: string;
  share_with_nok?: boolean; 
};

export default function DashboardStatsGrid({ items }: { items: VaultItem[] }) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  // 1. Calculate Counts 
  const counts = {
    card: items.filter((i) => i.type === "card").length,
    crypto: items.filter((i) => i.type === "crypto").length,
    password: items.filter((i) => i.type === "password").length,
    file: items.filter((i) => i.type === "file").length,
    nok: items.filter((i) => i.share_with_nok).length,
    app: 0,
  };

  // 2. State
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  
  // State for Editing
  const [decryptedDetails, setDecryptedDetails] = useState<any | null>(null);
  const [editedDetails, setEditedDetails] = useState<any | null>(null);
  
  const [showSensitive, setShowSensitive] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false); 

  // 3. Filter Items
  const categoryItems = selectedCategory === "nok" 
    ? items.filter((i) => i.share_with_nok)
    : items.filter((i) => i.type === selectedCategory);

  // 4. Handle View (Initialize Edit State)
  const handleViewItem = (item: VaultItem) => {
    try {
      const details = decryptData(item.ciphertext);
      setDecryptedDetails(details);
      setEditedDetails(details); 
      setSelectedItem(item);
      setShowSensitive(false);
    } catch (err) {
      toast.error("Failed to decrypt item.");
    }
  };

  // 5. Handle Delete Request (Opens Modal)
  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("vault_items")
        .delete()
        .eq("id", selectedItem.id);

      if (error) throw error;

      toast.success("Item deleted successfully");
      setIsDeleteModalOpen(false); 
      setSelectedItem(null); 
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete item");
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Handle Save Changes
  const handleSave = async () => {
    if (!selectedItem || !editedDetails) return;

    setIsLoading(true);
    try {
      const newCiphertext = encryptData(editedDetails);

      const { error } = await (supabase.from("vault_items") as any)
        .update({ ciphertext: newCiphertext })
        .eq("id", selectedItem.id);

      if (error) throw error;

      toast.success("Changes saved successfully");
      setDecryptedDetails(editedDetails);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to update item");
    } finally {
      setIsLoading(false);
    }
  };

  // --- 7. HANDLE DOWNLOAD ---
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
      console.error(error);
      toast.error("Failed to download file. It may have been deleted.");
    } finally {
      setIsDownloading(false);
    }
  };

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
  };

  const getIcon = (type: string) => {
    switch(type) {
      case "card": return <FaIdCard />;
      case "crypto": return <FaWallet />;
      case "password": return <IoKey />;
      case "file": return <FaFile />;
      case "nok": return <FaUserShield />;
      default: return <IoApps />;
    }
  };

  const getColorClasses = (type: string | undefined) => {
    switch(type) {
      case "card":
          return {
             bg: "bg-blue-50 dark:bg-blue-900/20",
             text: "text-blue-600 dark:text-blue-400",
             border: "border-blue-100 dark:border-blue-800",
             hoverBorder: "hover:border-blue-300 dark:hover:border-blue-500",
             groupHoverBg: "group-hover:bg-blue-600",
             groupHoverText: "group-hover:text-white",
             modalHeader: "bg-blue-600 text-white",
             modalIconBg: "bg-blue-50 dark:bg-blue-900/30",
             modalIconText: "text-blue-600 dark:text-blue-400",
             badgeBg: "bg-blue-50 dark:bg-blue-900/30",
             badgeText: "text-blue-700 dark:text-blue-300",
             highlight: "bg-blue-600 border-blue-600 text-blue-100"
          };
      case "crypto":
          return {
             bg: "bg-orange-50 dark:bg-orange-900/20",
             text: "text-orange-600 dark:text-orange-400",
             border: "border-orange-100 dark:border-orange-800",
             hoverBorder: "hover:border-orange-300 dark:hover:border-orange-500",
             groupHoverBg: "group-hover:bg-orange-600",
             groupHoverText: "group-hover:text-white",
             modalHeader: "bg-orange-600 text-white",
             modalIconBg: "bg-orange-50 dark:bg-orange-900/30",
             modalIconText: "text-orange-600 dark:text-orange-400",
             badgeBg: "bg-orange-50 dark:bg-orange-900/30",
             badgeText: "text-orange-700 dark:text-orange-300",
             highlight: "bg-orange-600 border-orange-600 text-orange-100"
          };
      case "password":
          return {
             bg: "bg-rose-50 dark:bg-rose-900/20",
             text: "text-rose-600 dark:text-rose-400",
             border: "border-rose-100 dark:border-rose-800",
             hoverBorder: "hover:border-rose-300 dark:hover:border-rose-500",
             groupHoverBg: "group-hover:bg-rose-600",
             groupHoverText: "group-hover:text-white",
             modalHeader: "bg-rose-600 text-white",
             modalIconBg: "bg-rose-50 dark:bg-rose-900/30",
             modalIconText: "text-rose-600 dark:text-rose-400",
             badgeBg: "bg-rose-50 dark:bg-rose-900/30",
             badgeText: "text-rose-700 dark:text-rose-300",
             highlight: "bg-rose-600 border-rose-600 text-rose-100"
          };
      case "nok":
          return {
             bg: "bg-emerald-50 dark:bg-emerald-900/20",
             text: "text-emerald-600 dark:text-emerald-400",
             border: "border-emerald-100 dark:border-emerald-800",
             hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-500",
             groupHoverBg: "group-hover:bg-emerald-600",
             groupHoverText: "group-hover:text-white",
             modalHeader: "bg-emerald-600 text-white",
             modalIconBg: "bg-emerald-50 dark:bg-emerald-900/30",
             modalIconText: "text-emerald-600 dark:text-emerald-400",
             badgeBg: "bg-emerald-50 dark:bg-emerald-900/30",
             badgeText: "text-emerald-700 dark:text-emerald-300",
             highlight: "bg-emerald-600 border-emerald-600 text-emerald-100"
          };
      case "file":
          return {
             bg: "bg-violet-50 dark:bg-violet-900/20",
             text: "text-violet-600 dark:text-violet-400",
             border: "border-violet-100 dark:border-violet-800",
             hoverBorder: "hover:border-violet-300 dark:hover:border-violet-500",
             groupHoverBg: "group-hover:bg-violet-600",
             groupHoverText: "group-hover:text-white",
             modalHeader: "bg-violet-600 text-white",
             modalIconBg: "bg-violet-50 dark:bg-violet-900/30",
             modalIconText: "text-violet-600 dark:text-violet-400",
             badgeBg: "bg-violet-50 dark:bg-violet-900/30",
             badgeText: "text-violet-700 dark:text-violet-300",
             highlight: "bg-violet-600 border-violet-600 text-violet-100"
          };
      default:
         return {
             bg: "bg-blue-50 dark:bg-blue-900/20",
             text: "text-blue-600 dark:text-blue-400",
             border: "border-blue-100 dark:border-blue-800",
             hoverBorder: "hover:border-blue-300 dark:hover:border-blue-500",
             groupHoverBg: "group-hover:bg-blue-600",
             groupHoverText: "group-hover:text-white",
             modalHeader: "bg-blue-600 text-white",
             modalIconBg: "bg-blue-50 dark:bg-blue-900/30",
             modalIconText: "text-blue-600 dark:text-blue-400",
             badgeBg: "bg-blue-50 dark:bg-blue-900/30",
             badgeText: "text-blue-700 dark:text-blue-300",
             highlight: "bg-blue-600 border-blue-600 text-blue-100"
         };
    }
  };

  return (
    <>
      {/* --- GRID OF CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-10">
        <DashboardCard icon={<FaIdCard />} label="Cards" type="card" count={counts.card} onClick={() => setSelectedCategory("card")} colorParams={getColorClasses("card")} />
        <DashboardCard icon={<FaWallet />} label="Wallets" type="crypto" count={counts.crypto} onClick={() => setSelectedCategory("crypto")} colorParams={getColorClasses("crypto")} />
        <DashboardCard icon={<IoKey />} label="Passwords" type="password" count={counts.password} onClick={() => setSelectedCategory("password")} colorParams={getColorClasses("password")} />
        <DashboardCard icon={<FaUserShield />} label="Next of Kin" type="nok" count={counts.nok} onClick={() => setSelectedCategory("nok")} colorParams={getColorClasses("nok")} />
        <DashboardCard icon={<IoDocumentText />} label="Files" type="file" count={counts.file} onClick={() => setSelectedCategory("file")} colorParams={getColorClasses("file")} />
      </div>

      {/* --- MODAL 1: LIST VIEW --- */}
      {selectedCategory && !selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
             {/* Header */}
             <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-4 shrink-0 flex justify-between items-center sticky top-0 z-10">
               <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${selectedCategory ? getColorClasses(selectedCategory).modalHeader : ''}`}>
                    {getIcon(selectedCategory)}
                  </div>
                 <h2 className="text-lg font-bold text-gray-800 dark:text-white capitalize">
                   {selectedCategory === "nok" ? "Next of Kin Assets" : selectedCategory === "crypto" ? "Wallets" : selectedCategory + "s"}
                 </h2>
              </div>
              <button onClick={() => setSelectedCategory(null)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition text-gray-500 dark:text-gray-400">
                <FaXmark />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 bg-gray-50/50 dark:bg-gray-950 flex-1">
              {categoryItems.length === 0 ? (
                <div className="text-center py-12">
                   <p className="text-gray-400 font-medium">No items found</p>
                </div>
              ) : (
                categoryItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleViewItem(item)}
                    className="group w-full p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl flex justify-between items-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md dark:hover:shadow-none transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${getColorClasses(selectedCategory || item.type).modalIconBg} ${getColorClasses(selectedCategory || item.type).modalIconText}`}>
                        {selectedCategory === 'nok' ? getIcon(item.type) : item.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-bold text-gray-700 dark:text-gray-200">{item.name}</span>
                        {selectedCategory === 'nok' && (
                          <span className="text-[10px] text-gray-400 uppercase font-bold">{item.type}</span>
                        )}
                      </div>
                    </div>
                    <FaArrowRight className={`text-gray-300 dark:text-gray-600 ${selectedCategory ? getColorClasses(selectedCategory).text.replace('text-', 'group-hover:text-') : ''} transition-colors`} size={14} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ITEM DETAILS (Editable) --- */}
      {selectedItem && editedDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[110] p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200 relative">
            
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-5 shrink-0 flex justify-between items-start">
              <div className="flex gap-3 items-center">
                 <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none ${getColorClasses(selectedItem.type).modalHeader}`}>
                    {getIcon(selectedItem.type)}
                 </div>
                 <div>
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${getColorClasses(selectedItem.type).badgeBg} ${getColorClasses(selectedItem.type).badgeText}`}>
                        {selectedItem.type}
                        </span>
                        {selectedItem.share_with_nok && (
                            <span className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1">
                                <FaUserShield size={8} /> Next of Kin
                            </span>
                        )}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight mt-1">{selectedItem.name}</h2>
                 </div>
              </div>
              <button onClick={() => setSelectedItem(null)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition text-gray-500 dark:text-gray-400">
                <FaXmark />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              {Object.entries(editedDetails).map(([key, value]: any) => {
                if (key === "storagePath" || key === "fileSize" || key === "fileName") return null;
                const isSecret = key.includes("password") || key.includes("pin") || key.includes("cvv") || key.includes("phrase");

                return (
                  <div key={key}>
                    <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">
                      {key.replace(/_/g, " ")}
                    </label>
                    <div className="relative group">
                      <input
                        type={isSecret ? (showSensitive ? "text" : "password") : "text"}
                        value={value}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className={`w-full bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-900 text-gray-800 dark:text-white font-semibold text-sm rounded-xl px-4 py-3.5 outline-none transition-all border border-transparent focus:ring-4 ${getColorClasses(selectedItem.type).text.replace('text-', 'focus:border-')} focus:ring-blue-500/10`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                          <button onClick={() => handleCopy(value, key)} className={`p-1.5 text-gray-400 dark:text-gray-500 ${getColorClasses(selectedItem.type).text.replace('text-', 'hover:text-')} hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition`} title="Copy">
                            {copiedField === key ? <FaCheck className="text-emerald-500" /> : <FaCopy size={14} />}
                          </button>
                          {isSecret && (
                            <button onClick={() => setShowSensitive(!showSensitive)} className={`p-1.5 text-gray-400 dark:text-gray-500 ${getColorClasses(selectedItem.type).text.replace('text-', 'hover:text-')} hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition`}>
                              {showSensitive ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* --- FILE DOWNLOAD SECTION --- */}
              {selectedItem.type === "file" && (
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center bg-gray-50/50 dark:bg-gray-800/30">
                   <div className="h-14 w-14 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-sm mx-auto mb-3">
                      <FaFile className="text-blue-500 dark:text-blue-400" size={24} />
                   </div>
                   <p className="text-sm font-bold text-gray-800 dark:text-white">{decryptedDetails.fileName}</p>
                   <p className="text-xs text-gray-400 mb-5 font-medium">{(decryptedDetails.fileSize / 1024).toFixed(1)} KB</p>
                   
                   <button 
                     onClick={handleDownload}
                     disabled={isDownloading}
                     className="w-full bg-black dark:bg-gray-700 text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-600 transition shadow-lg shadow-gray-200 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-50"
                   >
                     {isDownloading ? (
                        "Downloading..."
                     ) : (
                        <><FaDownload /> Download File</>
                     )}
                   </button>
                </div>
              )}
            </div>
            
            {/* Footer Buttons */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3">
              <button 
                onClick={handleDeleteClick}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-700 dark:hover:text-red-300 font-bold py-3.5 rounded-xl transition disabled:opacity-50"
              >
                {isLoading ? "Processing..." : <><FaTrash size={14}/> Delete</>}
              </button>

              <button 
                onClick={handleSave}
                disabled={isLoading}
                className="flex-[2] flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition disabled:opacity-50"
              >
                {isLoading ? "Saving..." : <><FaFloppyDisk size={14}/> Save Changes</>}
              </button>
            </div>

            {/* Custom Delete Confirmation Modal */}
            {isDeleteModalOpen && (
              <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="w-full max-w-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-6 text-center animate-in zoom-in-95 duration-200">
                  <div className="h-14 w-14 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaTriangleExclamation size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete this item?</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-6">
                    This action cannot be undone. This item will be permanently removed from your vault.
                  </p>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="flex-1 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={confirmDelete}
                      disabled={isLoading}
                      className="flex-1 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-lg shadow-red-200 dark:shadow-none"
                    >
                      {isLoading ? "Deleting..." : "Yes, Delete"}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}

function DashboardCard({ icon, label, type, count, onClick, highlight, colorParams }: any) {
  // If no colorParams provided, fallback to blue using helper
  const colors = colorParams || {
     bg: "bg-blue-50 dark:bg-blue-900/30",
     text: "text-blue-600 dark:text-blue-400",
     border: "border-blue-100 dark:border-blue-800",
     hoverBorder: "hover:border-blue-300 dark:hover:border-blue-500",
     groupHoverBg: "group-hover:bg-blue-600",
     groupHoverText: "group-hover:text-white"
  };

  return (
    <div
      onClick={onClick}
      className={`group flex flex-row items-center gap-4 p-4 border rounded-2xl shadow-sm dark:shadow-none hover:shadow-lg dark:hover:shadow-none hover:-translate-y-1 transition-all duration-200 cursor-pointer h-full relative overflow-hidden
        ${highlight ? "bg-blue-600 border-blue-600" : `bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${colors.hoverBorder}`}
      `}
    >
      <div className={`flex flex-shrink-0 items-center justify-center h-12 w-12 rounded-full transition-colors duration-200
         ${highlight 
            ? "bg-white/20 text-white border border-white/30" 
            : `${colors.bg} border ${colors.border} ${colors.text} ${colors.groupHoverBg} ${colors.groupHoverText}`
         }
      `}>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="flex flex-col">
        <span className={`font-bold text-sm md:text-base ${highlight ? "text-white" : "text-gray-800 dark:text-gray-100"}`}>{label}</span>
        <span className={`text-xs font-medium ${highlight ? "text-blue-100" : "text-gray-400 dark:text-gray-500"}`}>{count} Items</span>
      </div>
    </div>
  );
}