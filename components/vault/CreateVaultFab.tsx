"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus } from "react-icons/fa6";
import CreateVaultModal from "./CreateVaultModal";

export default function CreateVaultFab() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-xl shadow-blue-500/30 flex items-center justify-center z-50"
      >
        <FaPlus size={24} />
      </motion.button>

      <AnimatePresence>
        {isModalOpen && (
          <CreateVaultModal 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={() => console.log("Vault created!")} 
          />
        )}
      </AnimatePresence>
    </>
  );
}
