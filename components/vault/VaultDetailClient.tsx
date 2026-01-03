"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLock, FaFolderOpen, FaArrowLeft, FaGear } from "react-icons/fa6"; // Added FaGear
import Link from "next/link";
import CategoryItemGrid from "@/components/dashboard/CategoryItemGrid";
import DashboardFab from "@/components/DashboardFab";
import ItemDetailModal from "@/components/dashboard/ItemDetailModal";
import VaultSettingsModal from "@/components/vault/VaultSettingsModal";
import { useRouter } from "next/navigation";

interface VaultDetailClientProps {
  vault: any;
  items: any[];
}

export default function VaultDetailClient({ vault, items }: VaultDetailClientProps) {
  const [isUnlocked, setIsUnlocked] = useState(!vault.is_locked);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Settings State
  const router = useRouter();

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === vault.lock_code) {
      setIsUnlocked(true);
      setError("");
    } else {
      setError("Incorrect PIN code");
      setPin("");
    }
  };

  const handleUpdate = () => {
    router.refresh();
  };

  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/10">
          <FaLock size={32} />
        </div>
        <h1 className="text-2xl font-black text-gray-800 dark:text-white mb-2">{vault.name} is Locked</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs text-center">
          Enter the lock code to access the secure contents of this vault.
        </p>

        <form onSubmit={handleUnlock} className="w-full max-w-xs">
          <input 
            type="password"
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter Lock Code"
            className="w-full text-center text-2xl font-bold tracking-widest p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all mb-4"
          />
          {error && <p className="text-red-500 text-sm font-bold text-center mb-4">{error}</p>}
          <button 
            type="submit"
            className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:opacity-90 transition"
          >
            Unlock Vault
          </button>
        </form>

        <Link href="/dashboard/vault" className="mt-8 text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          Go Back
        </Link>
      </div>
    );
  }

  return (
    <div className="relative pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/vault" className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
             <FaArrowLeft />
          </Link>
          <div>
             <h1 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight flex items-center gap-3">
               <FaFolderOpen className="text-blue-500" /> {vault.name}
             </h1>
             {vault.description && <p className="text-gray-500 dark:text-gray-400 mt-1">{vault.description}</p>}
          </div>
        </div>
        
        {/* Settings Button */}
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          <FaGear />
        </button>
      </div>

      {/* Content */}
      <CategoryItemGrid 
         items={items} 
         selectedCategory="search" 
         customItems={items}       
         onSelectItem={setSelectedItem}
         emptyMessage="This vault is empty." 
      />

      {/* FAB with Vault Context */}
      <DashboardFab vaultId={vault.id} defaultShareWithNok={vault.share_with_nok} />

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <ItemDetailModal 
            item={selectedItem} 
            onClose={() => setSelectedItem(null)} 
          />
        )}
        {isSettingsOpen && (
          <VaultSettingsModal 
            vault={vault} 
            onClose={() => setIsSettingsOpen(false)}
            onUpdate={handleUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
