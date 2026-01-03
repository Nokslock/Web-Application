"use client";

import HomeLogo from "@/components/HomeLogo";
import { motion, Variants } from "framer-motion"; 
import { FaShieldHalved, FaLock } from "react-icons/fa6";

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 50, damping: 15 },
  },
};

const floatingIconVariants: Variants = {
  float: {
    y: [-15, 15, -15],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 6,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

export default function LoginLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-gray-950 transition-colors duration-300 relative overflow-hidden">
      
      {/* --- LEFT COLUMN: FORM AREA --- */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="col-span-1 h-full min-h-screen overflow-y-auto flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20 xl:px-24 bg-white dark:bg-gray-950 z-20 relative shadow-2xl lg:shadow-none"
      >
        <div className="w-full max-w-[480px] mx-auto">
          <motion.div variants={itemVariants} className="mb-12">
            <HomeLogo />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            {children}
          </motion.div>
        </div>
      </motion.div>

      {/* --- RIGHT COLUMN: DYNAMIC VISUALS --- */}
      <div className="col-span-1 hidden lg:flex items-center justify-center relative h-screen sticky top-0 overflow-hidden bg-gray-900">
        
        {/* Dynamic Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 via-gray-900/50 to-gray-900 z-10"></div>

        {/* Floating 3D Elements */}
        <div className="relative z-20 w-full h-full flex items-center justify-center perspective-[1000px]">
          
          {/* Main Shield */}
          <motion.div
            variants={floatingIconVariants}
            animate="float"
            className="relative"
          >
            {/* Glow Behind */}
            <div className="absolute inset-0 bg-blue-500/30 blur-[100px] rounded-full transform scale-150"></div>
            
            <div className="w-64 h-64 bg-gradient-to-br from-blue-600/20 to-indigo-900/20 backdrop-blur-3xl rounded-[3rem] border border-white/10 flex items-center justify-center shadow-2xl relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[3rem] pointer-events-none"></div>
              <FaShieldHalved className="text-9xl text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
              
              {/* Floating Lock Badge */}
              <motion.div 
                animate={{ y: [10, -10, 10], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
                className="absolute -bottom-6 -right-6 w-24 h-24 bg-gray-900/90 backdrop-blur-xl border border-gray-700 rounded-2xl flex items-center justify-center shadow-xl"
              >
                <FaLock className="text-4xl text-emerald-400" />
              </motion.div>
            </div>
          </motion.div>

        </div>

        {/* Decorative Text */}
        <div className="absolute bottom-12 left-12 z-20">
          <h3 className="text-white/80 font-bold text-lg tracking-widest uppercase">Secure Vault Access</h3>
          <p className="text-white/40 text-sm mt-1 font-mono">ENCRYPTED CONNECTION // SECURE</p>
        </div>

      </div>

    </div>
  );
}