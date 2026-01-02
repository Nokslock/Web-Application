"use client";

import Image from "next/image";
// 1. Importing 'Variants' fixes the TypeScript red lines
import { motion, Variants } from "framer-motion"; 
import Block from "@/public/block.png";
import landingOneImage from "@/public/demo-img.png"; 

// --- ANIMATION VARIANTS (Typed correctly) ---

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2 // Delay between each child animation
    }
  }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

export default function LandingOne() {
  return (
    <div className="flex flex-col gap-20 pb-20 overflow-hidden">
      
      {/* --- SECTION 1: HERO TEXT (Animated Entrance) --- */}
      <section className="px-5 pt-10">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="max-w-5xl mx-auto text-center"
        >
          <motion.p variants={fadeInUp} className="text-blue-600 font-bold tracking-widest uppercase text-xs md:text-sm mb-4">
            Total Privacy, Zero Compromise
          </motion.p>
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
            The Fort Knox for Your <br className="hidden md:block" />
            <span className="text-blue-600">Digital Life</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Stop relying on browser autofill and sticky notes. Nockslock secures your passwords, 
            files, and crypto assets with bank-grade encryption that only you hold the keys to.
          </motion.p>
        </motion.div>
      </section>

      {/* --- SECTION 2: HERO IMAGE (Floating Animation) --- */}
      <section className="w-full px-5">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto relative group"
        >
          {/* Glowing Background Pulse */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 animate-pulse"></div>
          
          {/* Continuous Floating Motion */}
          <motion.div
            animate={{ y: [0, -15, 0] }} // Moves up and down
            transition={{ 
              duration: 6, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <Image
              src={landingOneImage}
              alt="Nockslock Dashboard Interface"
              className="relative w-full h-auto rounded-2xl shadow-2xl border border-gray-100"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* --- SECTION 3: CORE FEATURES (Staggered Scroll) --- */}
      <section className="px-5">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-3xl font-bold text-gray-900">Everything You Need to Stay Safe</h3>
            <p className="text-gray-500 mt-2">More than just a password manager.</p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <FeatureCard title="Secure Vault" desc="Store unlimited passwords, credit cards, and secure notes with AES-256 bit encryption." />
            <FeatureCard title="Digital Inheritance" desc="Ensure your loved ones can access vital assets if something happens to you via Next of Kin." />
            <FeatureCard title="Crypto Wallet Storage" desc="Safely store seed phrases and private keys offline, away from prying eyes and hackers." />
            <FeatureCard title="Cross-Platform Sync" desc="Access your vault seamlessly across your phone, tablet, and desktop securely." />
            <FeatureCard title="Breach Monitoring" desc="Get instant alerts if your email or passwords appear in known data leaks." />
            <FeatureCard title="Zero-Knowledge Architecture" desc="We can't see your data even if we wanted to. Your master password decrypts it locally." />
          </motion.div>
        </div>
      </section>

      {/* --- SECTION 4: HOW IT WORKS (Slide In) --- */}
      <section className="bg-gray-50 py-20 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* Steps Text - Slides from Left */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <p className="text-blue-600 font-bold uppercase text-sm mb-2">Simplicity First</p>
              <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">
                Security made simple <br /> in <span className="text-blue-600">3 Easy Steps</span>
              </h3>
              <div className="space-y-8">
                <Step number="01" title="Create your Master Password" desc="This is the only password you need to remember. It locks your entire vault." delay={0.1} />
                <Step number="02" title="Import your Data" desc="Easily migrate from other browsers or add your credentials manually in seconds." delay={0.2} />
                <Step number="03" title="Browse Fearlessly" desc="Log in with one click and let Nockslock handle the security complexites." delay={0.3} />
              </div>
            </motion.div>
            
            {/* Illustration - Zooms In */}
            <motion.div 
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center min-h-[400px]"
            >
               <div className="text-center">
                 <motion.div 
                   animate={{ rotate: [0, 10, -10, 0] }} 
                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                 >
                    <Image src={Block} alt="Security Illustration" className="w-32 h-32 mx-auto mb-4 opacity-50" />
                 </motion.div>
                 <p className="text-gray-400 font-medium">Security Workflow</p>
               </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* --- SECTION 5: PRIVACY OBSESSIVES --- */}
      <section className="px-5 pt-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
            Designed for <span className="text-blue-600">Privacy Obsessives</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We built Nockslock because existing solutions weren't secure enough for our own families.
          </p>
        </motion.div>

        <div className="max-w-7xl mx-auto">
          <motion.div 
             variants={staggerContainer}
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <MiniFeature title="Offline Mode" />
            <MiniFeature title="Biometric Login" />
            <MiniFeature title="2FA Support" />
            <MiniFeature title="Priority Support" />
          </motion.div>
        </div>
      </section>

      {/* --- SECTION 6: CTA BANNER (Scale Up) --- */}
      <section className="w-full px-5">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bottom-banner w-full max-w-7xl mx-auto rounded-3xl overflow-hidden px-8 py-20 md:px-20 relative bg-gray-900 text-white shadow-2xl"
        >
          {/* Abstract Background Element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
            <div>
              <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
                Ready to secure your legacy?
              </h2>
              <p className="text-lg text-gray-300 mb-8 max-w-md">
                Join thousands of users who sleep better at night knowing their digital assets are safe.
              </p>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-blue-900/50"
              >
                Get Started for Free
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
}

// --- ANIMATED HELPER COMPONENTS ---

function FeatureCard({ title, desc }: { title: string, desc: string }) {
  return (
    <motion.div 
      variants={fadeInUp}
      whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
      className="flex flex-col items-center text-center p-8 bg-white rounded-2xl border border-gray-100 shadow-sm transition-shadow duration-300 cursor-default"
    >
      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
        <Image src={Block} alt={title} className="w-8 h-8 object-contain" />
      </div>
      <h4 className="text-xl font-bold text-gray-900 mb-3">{title}</h4>
      <p className="text-gray-600 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function MiniFeature({ title }: { title: string }) {
  return (
    <motion.div 
      variants={fadeInUp}
      whileHover={{ scale: 1.05, backgroundColor: "#ffffff", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
      className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 cursor-default transition-colors"
    >
      <Image src={Block} alt={title} className="w-10 h-10 mb-3 object-contain opacity-80" />
      <h5 className="font-bold text-gray-800">{title}</h5>
    </motion.div>
  );
}

function Step({ number, title, desc, delay }: { number: string, title: string, desc: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: delay, duration: 0.5 }}
      className="flex gap-5"
    >
      <div className="flex-shrink-0">
        <span className="text-4xl font-black text-gray-200">{number}</span>
      </div>
      <div>
        <h4 className="text-lg font-bold text-gray-900 mb-1">{title}</h4>
        <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}