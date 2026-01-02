"use client"; 

import Image from "next/image";
import Link from "next/link";
// 1. Import 'Variants' to fix TypeScript errors
import { motion, Variants } from "framer-motion"; 
import BgImg from "@/public/hero-img.png";
import "./globals.css";
import NavBar from "@/components/NavBar";
import AuthButton from "@/components/AuthButton";
import LandingOne from "@/components/LandingOne";
import Footer from "@/components/Footer";

// 2. Apply ': Variants' type here 👇
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

export default function Home() {
  return (
    <div className="bg-white min-h-screen flex flex-col overflow-x-hidden">
      <NavBar />
      
      {/* Hero Section */}
      <div className="w-full px-5 pt-32 pb-20 lg:px-8 lg:pt-40 lg:pb-32 hero-section relative">
        
        {/* Optional: Subtle Background Element */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-50/50 to-transparent -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* LEFT COLUMN: Text (Animated) */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="flex flex-col items-center text-center lg:items-start lg:text-left order-1"
            >
              
              <motion.div variants={fadeInUp} className="mb-4">
                 <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    v1.0 Released
                 </span>
              </motion.div>

              <motion.h1 variants={fadeInUp} className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl lg:text-6xl mb-6 leading-tight">
                Secure your digital life <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  without the complexity.
                </span>
              </motion.h1>
              
              <motion.p variants={fadeInUp} className="text-lg leading-8 text-gray-600 mb-8 max-w-lg">
                Nockslock is the all-in-one vault for your passwords, crypto keys, and digital inheritance. 
                Bank-grade encryption meets beautiful design.
              </motion.p>
              
              {/* Button Container */}
              <motion.div variants={fadeInUp} className="w-full sm:w-auto flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <div className="w-full sm:w-auto">
                   <Link href="/register">
                      <AuthButton variant="dark" type="button" className="w-full shadow-lg shadow-blue-900/20 hover:shadow-xl transition-all">
                        Get Started for Free
                      </AuthButton>
                   </Link>
                </div>
                <div className="w-full sm:w-auto">
                   <button className="w-full px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors">
                      View Demo
                   </button>
                </div>
              </motion.div>

              <motion.p variants={fadeInUp} className="mt-6 text-sm text-gray-400">
                Trusted by 10,000+ users • No credit card required
              </motion.p>

            </motion.div>

            {/* RIGHT COLUMN: Image (Floating only, no blur) */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center lg:justify-end order-2 relative"
            >
                 {/* Floating Motion Wrapper */}
                 <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                 >
                    <Image
                      src={BgImg}
                      alt="Nockslock Security Dashboard"
                      priority
                      className="relative w-full max-w-md lg:max-w-full h-auto object-contain drop-shadow-2xl"
                    />
                 </motion.div>
            </motion.div>

          </div>
        </div>
      </div>

      <LandingOne />
      <Footer />
    </div>
  );
}