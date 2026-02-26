"use client";

import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { IoKey, IoSearch } from "react-icons/io5";
import { FaLock, FaShieldHalved } from "react-icons/fa6";
import NotificationBell from "@/components/NotificationBell";
import DashboardFab from "@/components/DashboardFab";
import DashboardCategorySelector from "./DashboardCategorySelector";
import DashboardHome from "./DashboardHome";
import CategoryItemGrid from "./CategoryItemGrid";
import ItemDetailModal from "./ItemDetailModal";
import PasswordInput from "@/components/PasswordInput";
import { isVaultUnlocked, unlockVault } from "@/lib/vaultKeyManager";
import { toast } from "sonner";

// --- ANIMATION VARIANTS (Typed correctly) ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Stagger effect for children
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const barVariants: Variants = {
  hidden: { height: 0, opacity: 0 },
  visible: (customHeight: string) => ({
    height: customHeight,
    opacity: 1,
    transition: { duration: 0.8, ease: "backOut" },
  }),
};

interface DashboardContentProps {
  user: any;
  items: any[];
}

export default function DashboardContent({ user, items }: DashboardContentProps) {
  const [greeting, setGreeting] = useState("Welcome back");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // --- VAULT LOCK STATE ---
  const [vaultLocked, setVaultLocked] = useState(!isVaultUnlocked());
  const [vaultPassword, setVaultPassword] = useState("");
  const [unlocking, setUnlocking] = useState(false);

  // Dynamic Greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const meta = user.user_metadata || {};
  const userName = meta.first_name || (meta.full_name || meta.name || "").split(" ")[0] || user.email?.split("@")[0] || "User";

  // Filter items for search
  const filteredItems = items?.filter(item => {
    const q = searchQuery.toLowerCase();

    // 1. Match Name or Type
    if (item.name.toLowerCase().includes(q) || item.type.toLowerCase().includes(q)) {
      return true;
    }

    // 2. Match "Next of Kin" / "Family" if the item is shared
    if (item.share_with_nok) {
      const nokTerms = ["next of kin", "nok", "family", "shared"];
      // If the search query matches any of these terms (partial match)
      if (nokTerms.some(term => term.includes(q) || q.includes(term))) {
        return true;
      }
    }

    return false;
  });

  // --- VAULT UNLOCK HANDLER ---
  const handleVaultUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaultPassword.trim()) {
      toast.warning("Please enter your Master Password.");
      return;
    }
    setUnlocking(true);
    try {
      await unlockVault(vaultPassword, user.id);
      setVaultLocked(false);
      setVaultPassword("");
      toast.success("Vault unlocked successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to unlock vault.");
    } finally {
      setUnlocking(false);
    }
  };

  // --- VAULT LOCKED OVERLAY ---
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
            <form onSubmit={handleVaultUnlock}>
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="pb-20"
    >
      {/* HEADER SECTION */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-center">
        <div className="col-span-1 md:col-span-2">
          <h1 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">
            {greeting}, <span className="text-blue-600">{userName}</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Here is an overview of your secure vault.</p>
        </div>

        <div className="col-span-1 flex gap-4 justify-start md:justify-end items-center">
          <div className="relative w-full md:w-64 group">
            <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl h-11 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white pl-10 pr-4 w-full focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm text-sm"
              placeholder="Search assets..."
              type="search"
            />
          </div>
          <NotificationBell />
        </div>
      </motion.div>

      {/* --- CATEGORY SELECTOR (Hidden when searching) --- */}
      {!searchQuery && (
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <DashboardCategorySelector
            items={items || []}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </motion.div>
      )}

      {/* --- DYNAMIC CONTENT (Home, Search, or Category Grid) --- */}
      {searchQuery ? (
        <CategoryItemGrid
          items={items || []}
          selectedCategory="search"
          customItems={filteredItems}
          onSelectItem={setSelectedItem}
          emptyMessage={`No results found for "${searchQuery}"`}
        />
      ) : selectedCategory ? (
        <CategoryItemGrid
          items={items || []}
          selectedCategory={selectedCategory}
          onSelectItem={setSelectedItem}
        />
      ) : (
        <DashboardHome items={items || []} />
      )}

      {/* --- DETAIL MODAL --- */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {/* Floating Action Button */}
      <DashboardFab />
    </motion.div>
  );
}

