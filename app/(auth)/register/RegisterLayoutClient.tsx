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
    <div className="min-h-screen w-full flex items-center lg:items-start justify-center p-4 md:p-8 lg:p-12 bg-white">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        // 2. Grid: items-start allows columns to be different heights
        className="container max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start"
      >
        {/* --- LEFT COLUMN (Long Form) --- */}
        <motion.div
          variants={itemVariants}
          // No sticky here. We want the form to scroll naturally.
          className="col-span-1 w-full max-w-md mx-auto lg:max-w-full lg:mx-0"
        >
          <div className="mb-8 flex justify-center lg:justify-start">
            <HomeLogo />
          </div>
          {children}
        </motion.div>

        {/* --- RIGHT COLUMN (Image) --- */}
        <motion.div
          variants={imageVariants}
          // 3. STICKY FIX: 
          // 'lg:sticky lg:top-12' keeps the image pinned to the top of the viewport 
          // while you scroll down the long form.
          className="col-span-1 hidden lg:block w-full rounded-2xl shadow-sm lg:sticky lg:top-12"
        >
          <Image
            src={BgImg}
            alt="Join Nockslock"
            // 4. Sizing: Matches LoginLayout (No crop, natural aspect ratio)
            width={800}
            height={1000}
            className="w-full h-auto rounded-2xl"
            priority
            placeholder="blur"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}