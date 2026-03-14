"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaLock, FaShieldHalved } from "react-icons/fa6";
import { isVaultUnlocked, unlockVault, tryRestoreVaultKey } from "@/lib/vaultKeyManager";
import PasswordInput from "@/components/PasswordInput";
import { toast } from "sonner";

interface VaultGuardProps {
  userId: string;
  children: React.ReactNode;
}

export default function VaultGuard({ userId, children }: VaultGuardProps) {
  const [vaultLocked, setVaultLocked] = useState(true);
  const [vaultPassword, setVaultPassword] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    if (isVaultUnlocked()) {
      setVaultLocked(false);
      setRestoring(false);
      return;
    }
    tryRestoreVaultKey().then((restored) => {
      setVaultLocked(!restored);
      setRestoring(false);
    });
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaultPassword.trim()) {
      toast.warning("Please enter your Master Password.");
      return;
    }
    setUnlocking(true);
    try {
      await unlockVault(vaultPassword, userId);
      setVaultLocked(false);
      setVaultPassword("");
      toast.success("Vault unlocked successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to unlock vault.");
    } finally {
      setUnlocking(false);
    }
  };

  // While checking sessionStorage, render nothing to avoid flash
  if (restoring) return null;

  if (vaultLocked) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex items-center justify-center min-h-[70vh]"
      >
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
              Vault Locked
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8 leading-relaxed">
              Enter your Master Password to decrypt and access your vault items for this session.
            </p>

            {/* Unlock Form */}
            <form onSubmit={handleUnlock}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 pl-1">
                  Master Password
                </label>
                <PasswordInput
                  type="password"
                  placeholder="Enter your master password"
                  value={vaultPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVaultPassword(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white dark:focus:bg-gray-950 transition-all outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={unlocking}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all text-base tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {unlocking ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Unlocking...
                  </>
                ) : (
                  <>
                    <FaShieldHalved className="text-lg" />
                    Unlock Vault
                  </>
                )}
              </button>
            </form>

            {/* Security Note */}
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-6">
              Your password is used locally to derive your encryption key. It is never sent to our servers.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return <>{children}</>;
}
