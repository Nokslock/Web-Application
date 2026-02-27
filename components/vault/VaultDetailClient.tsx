"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLock, FaFolderOpen, FaArrowLeft, FaGear, FaSpinner } from "react-icons/fa6";
import Link from "next/link";
import CategoryItemGrid from "@/components/dashboard/CategoryItemGrid";
import DashboardFab from "@/components/DashboardFab";
import ItemDetailModal from "@/components/dashboard/ItemDetailModal";
import VaultSettingsModal from "@/components/vault/VaultSettingsModal";
import { verifyVaultPin } from "@/lib/vault-actions";
import { useRouter } from "next/navigation";
import { isVaultUnlocked, unlockVault } from "@/lib/vaultKeyManager";
import { toast } from "sonner";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

// Simple PasswordInput component to prevent missing module error
const PasswordInput = (props: any) => <input {...props} />;

interface VaultDetailClientProps {
  vault: any;
  items: any[]; // Pre-loaded only for unlocked vaults; empty for locked ones
}

export default function VaultDetailClient({ vault, items: initialItems }: VaultDetailClientProps) {
  const [isUnlocked, setIsUnlocked] = useState(!vault.is_locked);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [vaultItems, setVaultItems] = useState<any[]>(initialItems);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // -- OVERALL MASTER VAULT LOCK STATE --
  const [sessionVaultLocked, setSessionVaultLocked] = useState(!isVaultUnlocked());
  const [masterPassword, setMasterPassword] = useState("");
  const [unlockingMaster, setUnlockingMaster] = useState(false);

  const router = useRouter();

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;

    setUnlocking(true);
    setError("");

    try {
      const result = await verifyVaultPin(vault.id, pin);

      if (result.success && result.items) {
        setVaultItems(result.items);
        setIsUnlocked(true);
      } else {
        setError(result.error || "Incorrect PIN code");
        setPin("");
      }
    } catch (err: any) {
      setError("Something went wrong. Please try again.");
      setPin("");
    } finally {
      setUnlocking(false);
    }
  };

  const handleUpdate = () => {
    router.refresh();
  };

  const handleMasterUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterPassword.trim()) {
      toast.warning("Please enter your Master Password.");
      return;
    }
    setUnlockingMaster(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      await unlockVault(masterPassword, user.id);
      setSessionVaultLocked(false);
      setMasterPassword("");
      toast.success("Master Vault unlocked successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to unlock master vault.");
    } finally {
      setUnlockingMaster(false);
    }
  };

  // 1. MUST UNLOCK SESSION VAULT FIRST
  if (sessionVaultLocked) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl shadow-blue-500/5 p-8 md:p-10">
            {/* Lock Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-2xl flex items-center justify-center border border-blue-200/50 dark:border-blue-800/50">
                  <FaLock className="text-3xl text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            {/* Text */}
            <h2 className="text-2xl font-black text-center text-gray-900 dark:text-white tracking-tight mb-2">
              Master Vault Locked
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8 leading-relaxed">
              Enter your Master Password to decrypt and access this vault's items.
            </p>

            {/* Unlock Form */}
            <form onSubmit={handleMasterUnlock}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 pl-1">
                  Master Password
                </label>
                <PasswordInput
                  type="password"
                  placeholder="Enter your master password"
                  value={masterPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMasterPassword(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white dark:focus:bg-gray-950 transition-all outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={unlockingMaster}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all text-base tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {unlockingMaster ? <FaSpinner className="animate-spin" /> : <FaLock />}
                {unlockingMaster ? "Unlocking..." : "Unlock Master Vault"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 2. THEN CHECK STANDALONE VAULT LOCK
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
            disabled={unlocking}
            className="w-full text-center text-2xl font-bold tracking-widest p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all mb-4"
          />
          {error && <p className="text-red-500 text-sm font-bold text-center mb-4">{error}</p>}
          <button
            type="submit"
            disabled={unlocking}
            className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            {unlocking ? <><FaSpinner className="animate-spin" /> Verifying…</> : "Unlock Vault"}
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
        items={vaultItems}
        selectedCategory="search"
        customItems={vaultItems}
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
