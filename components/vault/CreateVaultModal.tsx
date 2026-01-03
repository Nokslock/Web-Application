"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaFolder, FaLock, FaUserShield, FaXmark, FaCheck, FaSpinner } from "react-icons/fa6";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CreateVaultModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateVaultModal({ onClose, onSuccess }: CreateVaultModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [lockCode, setLockCode] = useState("");
  const [shareWithNok, setShareWithNok] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (isLocked && lockCode.length < 4) {
      toast.error("Lock code must be at least 4 characters.");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      // Cast to 'any' to bypass the Type check error
const { error } = await (supabase.from("vaults") as any).insert({
  user_id: user.id,
  name,
  description,
  is_locked: isLocked,
  lock_code: isLocked ? lockCode : null,
  share_with_nok: shareWithNok, 
});

      if (error) throw error;

      toast.success("Vault created successfully!");
      onSuccess();
      onClose();
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create vault");
    } finally {
      setLoading(false);
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
             <span className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FaFolder /></span> Create New Vault
           </h2>
           <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition text-gray-500">
             <FaXmark />
           </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
           {/* Name & Desc */}
           <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Vault Name</label>
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. My Secret Project"
                className={inputClass}
                autoFocus
                required
              />
           </div>
           
           <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Description (Optional)</label>
              <input 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's inside?"
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
                    <h4 className={`font-bold ${isLocked ? "text-amber-800 dark:text-amber-400" : "text-gray-700 dark:text-gray-300"}`}>Lock this Vault</h4>
                    <p className="text-xs opacity-70">Require a password to access contents.</p>
                 </div>
                 {isLocked && <FaCheck className="text-amber-600" />}
              </div>

              {/* Password Input (Animated) */}
              <AnimatePresence>
                {isLocked && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: "auto", opacity: 1, marginTop: 12 }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    className="overflow-hidden"
                    onClick={(e) => e.stopPropagation()} // Prevent toggle when clicking input
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
               <p className="text-xs opacity-70">Allow your designated contact to access this folder.</p>
             </div>
             {shareWithNok && <FaCheck className="text-blue-600" />}
           </div>

           <button 
             disabled={loading}
             className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
           >
             {loading ? <FaSpinner className="animate-spin" /> : "Create Vault"}
           </button>
        </form>
      </motion.div>
    </div>
  );
}
