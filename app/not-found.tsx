"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaUserLock, FaArrowLeft, FaHouse } from "react-icons/fa6";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-950 transition-colors duration-300 overflow-hidden relative">
      
      {/* Background decoration - Digital Noise / Grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center max-w-lg w-full"
      >
        {/* Animated Icon Container */}
        <motion.div
           initial={{ rotate: 0 }}
           animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
           transition={{ 
             duration: 0.6, 
             delay: 0.5,
             repeat: Infinity, 
             repeatDelay: 3 
           }}
           className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-8 border-4 border-white dark:border-gray-900 shadow-xl"
        >
          <FaUserLock className="text-4xl text-red-500 dark:text-red-400" />
        </motion.div>

        {/* Typography */}
        <h1 className="text-8xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter">
          404
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Access Denied
        </h2>
        
        <p className="text-gray-500 dark:text-gray-400 mb-10 text-lg leading-relaxed px-4">
          We checked the vault, but this page seems to be missing or restricted. Let's get you back to safety.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-200 dark:shadow-none hover:shadow-xl hover:-translate-y-0.5">
              <FaArrowLeft /> Return to Dashboard
            </button>
          </Link>
          
          <Link href="/" className="w-full sm:w-auto">
             <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl font-bold transition-all hover:-translate-y-0.5">
              <FaHouse /> Go Home
            </button>
          </Link>
        </div>
      </motion.div>

      {/* Footer / Copyright */}
      <div className="absolute bottom-6 text-xs text-gray-400 dark:text-gray-600 font-medium">
        Error Code: 404_NOT_FOUND
      </div>
    </div>
  );
}
