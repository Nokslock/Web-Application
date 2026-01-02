"use client";

import Image from "next/image";
import BgImg from "@/public/hero-img.png";
import HomeLogo from "@/components/HomeLogo";
import { motion, Variants } from "framer-motion"; 

// --- ANIMATION VARIANTS (Same as before) ---
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

export default function LoginLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Changed items-center to items-start on large screens so the form stays top-aligned if the image is very tall
    <div className="min-h-screen w-full flex items-center lg:items-start justify-center p-4 md:p-8 lg:p-12 bg-white">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        // Changed items-center to items-start so they align at the top
        className="container max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start"
      >
        {/* --- LEFT COLUMN (Form) --- */}
        <motion.div
          variants={itemVariants}
          // Added lg:sticky and lg:top-12 so the form stays in view if you scroll down a tall image
          className="col-span-1 w-full max-w-md mx-auto lg:max-w-full lg:mx-0 lg:sticky lg:top-12"
        >
          <div className="mb-8 flex justify-center lg:justify-start">
            <HomeLogo />
          </div>
          {children}
        </motion.div>

        {/* --- RIGHT COLUMN (Image) --- */}
        <motion.div
          variants={imageVariants}
          // REMOVED: relative h-[600px] 
          // REMOVED: overflow-hidden (so shadow isn't clipped if image is tall)
          className="col-span-1 hidden lg:block w-full rounded-2xl shadow-sm"
        >
          <Image
            src={BgImg}
            alt="Secure your digital assets"
            // REMOVED: fill
            // ADDED: width and height to let it maintain its natural aspect ratio
            width={800} // Set a base width (doesn't have to be exact, just defines ratio)
            height={1000} // Set a base height
            className="w-full h-auto rounded-2xl" // h-auto allows it to scale in full height
            priority
            placeholder="blur" 
          />
        </motion.div>
      </motion.div>
    </div>
  );
}