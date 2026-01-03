"use client";

import Image from "next/image";
import BgImg from "@/public/hero-img.png";
import HomeLogo from "@/components/HomeLogo";
import { motion, Variants } from "framer-motion";

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const imageVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function RegisterLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 1. Outer Container: Matches LoginLayout style (padding, centering)
    // Full-Screen Split Layout
    <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-gray-950 transition-colors duration-300">
      
      {/* --- LEFT COLUMN: SCROLLABLE FORM --- */}
      <motion.div
        variants={itemVariants}
        // h-screen + overflow-y-auto ensures the form scrolls independently
        // flex-col + justify-center centers it vertically if short, but scrolls if long
        className="col-span-1 h-screen overflow-y-auto flex flex-col justify-center px-4 py-12 sm:px-12 lg:px-24 xl:px-32 bg-white dark:bg-gray-950"
      >
        <div className="w-full max-w-md mx-auto">
          <div className="mb-10">
            <HomeLogo />
          </div>
          {children}
        </div>
      </motion.div>

      {/* --- RIGHT COLUMN: FIXED IMAGE --- */}
      <motion.div
        variants={imageVariants}
        className="col-span-1 hidden lg:flex items-center justify-center relative h-screen sticky top-0 overflow-hidden bg-gray-50 dark:bg-gray-900"
      >
        <div className="relative w-full h-full p-12">
          <Image
            src={BgImg}
            alt="Join Nockslock"
            fill
            className="object-contain"
            priority
            placeholder="blur"
          />
        </div>
      </motion.div>

    </div>
  );
}