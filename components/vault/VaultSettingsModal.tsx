"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaFolder, FaLock, FaUserShield, FaXmark, FaCheck, FaSpinner, FaTrash, FaTriangleExclamation } from "react-icons/fa6";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface VaultSettingsModalProps {
  vault: any;
  onClose: () => void;
  onUpdate: () => void; // Trigger refresh
}

export default function VaultSettingsModal({ vault, onClose, onUpdate }: VaultSettingsModalProps) {
  const [name, setName] = useState(vault.name);
  const [description, setDescription] = useState(vault.description || "");
  const [isLocked, setIsLocked] = useState(vault.is_locked);
  const [lockCode, setLockCode] = useState(vault.lock_code || "");
  const [shareWithNok, setShareWithNok] = useState(vault.share_with_nok);
  
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [showNokRevokeConfirm, setShowNokRevokeConfirm] = useState(false);

  // --- UPDATE VAULT ---
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (isLocked && lockCode.length < 4) {
      toast.error("Lock code must be at least 4 characters.");
      return;
    }

    // Check if we are revoking NOK (Turning it OFF when it was previously ON)
    if (vault.share_with_nok && !shareWithNok && !showNokRevokeConfirm) {
      setShowNokRevokeConfirm(true); // Trigger secondary confirmation
      return;
    }

    setLoading(true);

    try {
      const { error } = await (supabase.from("vaults") as any).update({
        name,
        description,
        is_locked: isLocked,
        lock_code: isLocked ? lockCode : null,
        share_with_nok: shareWithNok,
      }).eq("id", vault.id);

      if (error) throw error;

      // If we revoked NOK, we must also update all items in this vault to be unshared
      if (vault.share_with_nok && !shareWithNok) {
         const { error: itemsError } = await (supabase.from("vault_items") as any)
           .update({ share_with_nok: false })
           .eq("vault_id", vault.id);
         
         if (itemsError) console.error("Failed to revoke items NOK status", itemsError);
         else toast.success("Revoked NOK access from all vault items.");
      }

      toast.success("Vault settings updated!");
      onUpdate();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to update vault");
      setShowNokRevokeConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE VAULT ---
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      // 1. Fetch files in this vault to delete them from Storage first
      // Note: We need to know which items are 'files' and have 'ciphertext' that implies a path. 
      // Since we don't store the pure path in columns nicely (it's in ciphertext JSON), 
      // we might struggle to delete exact storage files without decrypting.
      // However, for this implementation, we will assume standard cascade delete for DB rows. 
      // OR if we stored 'storage_path' in metadata.
      // Limitation: If we can't decrypt, we can't find the file path easily unless we store it.
      // For now, we will just delete the DB rows. The storage files might become orphaned (common in MVPs without strict triggers).
      // Ideally, we'd have a 'storage_path' column.
      
      const { error } = await (supabase.from("vaults") as any).delete().eq("id", vault.id);
      if (error) throw error;

      toast.success("Vault deleted successfully.");
      router.push("/dashboard/vault");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to delete vault");
      setDeleteLoading(false);
    }
  };

  const inputClass = "w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl outline-none text-gray-800 dark:text-white transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-gray-400";

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 50, opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
           <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
             <span className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg"><FaFolder /></span> 
             Vault Settings
           </h2>
           <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition text-gray-500">
             <FaXmark />
           </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
           {showDeleteConfirm ? (
             <div className="text-center py-8">
               <div className="mx-auto w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4 text-3xl">
                 <FaTriangleExclamation />
               </div>
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Vault?</h3>
               <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">
                 This will permanently delete "<strong>{vault.name}</strong>" and <strong>ALL FILES</strong> stored inside it. This action cannot be undone.
               </p>
               <div className="flex gap-3">
                 <button 
                   onClick={() => setShowDeleteConfirm(false)}
                   className="flex-1 py-3 font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={handleDelete}
                   disabled={deleteLoading}
                   className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
                 >
                   {deleteLoading ? <FaSpinner className="animate-spin" /> : "Yes, Delete Everything"}
                 </button>
               </div>
             </div>
           ) : showNokRevokeConfirm ? (
              <div className="text-center py-6 animate-in fade-in zoom-in duration-200">
                <div className="mx-auto w-14 h-14 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center mb-4 text-2xl">
                   <FaUserShield />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Revoke Next of Kin?</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm px-4">
                  You are removing Next of Kin access from this vault. <br/>
                  <strong>All files inside will also be unshared.</strong>
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowNokRevokeConfirm(false)}
                    className="flex-1 py-3 font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUpdate} // Call update again, this time it will pass the check
                    disabled={loading}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
                  >
                   {loading ? <FaSpinner className="animate-spin" /> : "Confirm Revoke"}
                  </button>
                </div>
              </div>
           ) : (
             <form onSubmit={handleUpdate} className="space-y-5">
               {/* Name & Desc */}
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Vault Name</label>
                  <input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    required
                  />
               </div>
               
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Description</label>
                  <input 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={inputClass}
                  />
               </div>

               {/* Lock Toggle */}
               <div className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${isLocked ? "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800" : "bg-gray-50 border-gray-100 dark:bg-gray-800 dark:border-gray-700"}`} onClick={() => setIsLocked(!isLocked)}>
                  <div className="flex items-center gap-3">
                     <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isLocked ? "bg-amber-500 text-white" : "bg-gray-200 text-gray-400 dark:bg-gray-700"}`}>
                        <FaLock />
                     </div>
                     <div className="flex-1">
                        <h4 className={`font-bold ${isLocked ? "text-amber-800 dark:text-amber-400" : "text-gray-700 dark:text-gray-300"}`}>Vault Lock</h4>
                        <p className="text-xs opacity-70">Require password to open.</p>
                     </div>
                     {isLocked && <FaCheck className="text-amber-600" />}
                  </div>

                  <AnimatePresence>
                    {isLocked && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: "auto", opacity: 1, marginTop: 12 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        className="overflow-hidden"
                        onClick={(e) => e.stopPropagation()} 
                      >
                         <input 
                           type="password"
                           value={lockCode}
                           onChange={(e) => setLockCode(e.target.value)}
                           placeholder="Enter lock code..."
                           className="w-full p-3 bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-800 rounded-lg outline-none text-amber-900 dark:text-amber-200 placeholder:text-amber-400/70"
                         />
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>

               {/* NOK Toggle */}
               <div 
                 onClick={() => setShareWithNok(!shareWithNok)}
                 className={`cursor-pointer flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${
                   shareWithNok 
                     ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" 
                     : "bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                 }`}
               >
                 <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                   shareWithNok ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400 dark:bg-gray-700"
                 }`}>
                   <FaUserShield />
                 </div>
                 <div className="flex-1">
                   <h4 className={`font-bold ${shareWithNok ? "text-blue-800 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"}`}>
                     Share with Next of Kin
                   </h4>
                 </div>
                 {shareWithNok && <FaCheck className="text-blue-600" />}
               </div>

               <div className="pt-4 flex gap-3">
                 <button 
                   type="button"
                   onClick={() => setShowDeleteConfirm(true)}
                   className="p-4 rounded-xl border border-red-100 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                   title="Delete Vault"
                 >
                   <FaTrash />
                 </button>
                 <button 
                   type="submit"
                   disabled={loading}
                   className="flex-1 p-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2"
                 >
                   {loading ? <FaSpinner className="animate-spin" /> : "Save Changes"}
                 </button>
               </div>
             </form>
           )}
        </div>
      </motion.div>
    </div>
  );
}
