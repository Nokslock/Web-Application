"use client";

import Image from "next/image";
import BgImg from "@/public/login-bg-img.png";
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

export default function ForgotPasswordLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 1. Outer Container: Matches Login style
    <div className="min-h-screen w-full flex items-center lg:items-start justify-center p-4 md:p-8 lg:p-12 bg-white">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        // 2. Grid Alignment: items-start allows independent column heights
        className="container max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start"
      >
        {/* --- LEFT COLUMN (Form) --- */}
        <motion.div
          variants={itemVariants}
          // 3. Sticky Form: Keeps the short form in view if the image is tall
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
          // 4. Responsive Image: Hidden on mobile, full width on desktop
          className="col-span-1 hidden lg:block w-full rounded-2xl shadow-sm"
        >
          <Image
            src={BgImg}
            alt="Secure your digital assets"
            // 5. No Crop: Uses natural aspect ratio
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