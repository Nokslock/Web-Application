"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FaFolder, FaLock, FaUnlock, FaUserShield, FaChevronRight } from "react-icons/fa6";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

interface Vault {
  id: string;
  name: string;
  description: string;
  is_locked: boolean;
  share_with_nok: boolean;
  created_at: string;
}

interface VaultGridProps {
  vaults: Vault[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function VaultGrid({ vaults }: VaultGridProps) {
  if (vaults.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
        <div className="h-20 w-20 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mb-4">
          <FaFolder size={40} />
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">No Vaults Yet</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xs text-center">
          Create a secure vault to organize your sensitive items separately.
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {vaults.map((vault) => (
        <VaultCard key={vault.id} vault={vault} />
      ))}
    </motion.div>
  );
}

function VaultCard({ vault }: { vault: Vault }) {
  // Random "folder" color logic or static blue
  const isLocked = vault.is_locked;

  return (
    <Link href={`/dashboard/vault/${vault.id}`}>
      <motion.div 
        variants={item}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        className="group relative bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 dark:hover:shadow-blue-900/10 transition-all cursor-pointer overflow-hidden"
      >
        {/* Top Gradient Line */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="flex justify-between items-start mb-6">
           <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${
             isLocked 
               ? "bg-amber-50 text-amber-500 dark:bg-amber-900/20" 
               : "bg-blue-50 text-blue-500 dark:bg-blue-900/20"
           }`}>
              {isLocked ? <FaLock /> : <FaFolder />}
           </div>
           
           <div className="flex gap-2">
              {vault.share_with_nok && (
                <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center" title="Shared with NOK">
                   <FaUserShield size={12} />
                </div>
              )}
              <div className="h-8 w-8 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-400 group-hover:bg-blue-500 group-hover:text-white transition-colors flex items-center justify-center">
                 <FaChevronRight size={12} />
              </div>
           </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">
          {vault.name}
        </h3>
        
        {vault.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mb-4 h-5">
            {vault.description}
          </p>
        )}

        <div className="pt-4 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between text-xs text-gray-400 font-medium">
           <span>{isLocked ? "Password Protected" : "Open Access"}</span>
           <span>{formatDistanceToNow(new Date(vault.created_at), { addSuffix: true })}</span>
        </div>

      </motion.div>
    </Link>
  );
}
