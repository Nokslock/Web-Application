"use client";

import Image from "next/image";
import { motion, Variants } from "framer-motion";
import landingOneImage from "@/public/demo-img.png";
import {
  FaShieldHalved,
  FaHandHoldingHeart,
  FaBitcoin,
  FaArrowsRotate,
  FaBell,
  FaEyeSlash,
  FaWifi,
  FaFingerprint,
  FaLock,
  FaHeadset,
} from "react-icons/fa6";
import { IconType } from "react-icons";

// --- ANIMATION VARIANTS ---

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

// --- FEATURE DATA ---

const features = [
  {
    title: "Secure Vault",
    desc: "Store unlimited passwords, credit cards, and secure notes with AES-256 bit encryption.",
    icon: FaShieldHalved,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/30",
  },
  {
    title: "Digital Inheritance",
    desc: "Ensure your loved ones can access vital assets if something happens to you via Next of Kin.",
    icon: FaHandHoldingHeart,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-900/30",
  },
  {
    title: "Crypto Wallet Storage",
    desc: "Safely store seed phrases and private keys offline, away from prying eyes and hackers.",
    icon: FaBitcoin,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/30",
  },
  {
    title: "Cross-Platform Sync",
    desc: "Access your vault seamlessly across your phone, tablet, and desktop securely.",
    icon: FaArrowsRotate,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/30",
  },
  {
    title: "Breach Monitoring",
    desc: "Get instant alerts if your email or passwords appear in known data leaks.",
    icon: FaBell,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-900/30",
  },
  {
    title: "Zero-Knowledge Architecture",
    desc: "We can't see your data even if we wanted to. Your master password decrypts it locally.",
    icon: FaEyeSlash,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-900/30",
  },
];

const miniFeatures = [
  {
    title: "Offline Mode",
    icon: FaWifi,
    color: "text-teal-600 dark:text-teal-400",
  },
  {
    title: "Biometric Login",
    icon: FaFingerprint,
    color: "text-pink-600 dark:text-pink-400",
  },
  {
    title: "2FA Support",
    icon: FaLock,
    color: "text-indigo-600 dark:text-indigo-400",
  },
  {
    title: "Priority Support",
    icon: FaHeadset,
    color: "text-cyan-600 dark:text-cyan-400",
  },
];

export default function LandingOne() {
  return (
    <div className="flex flex-col gap-20 pb-20 overflow-hidden">
      {/* --- SECTION 1: HERO TEXT --- */}
      <section className="px-5 pt-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-100px" }}
          variants={staggerContainer}
          className="max-w-5xl mx-auto text-center"
        >
          <motion.p
            variants={fadeInUp}
            className="text-blue-600 font-bold tracking-widest uppercase text-xs md:text-sm mb-4"
          >
            Total Privacy, Zero Compromise
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight leading-tight"
          >
            The Fort Knox for Your <br className="hidden md:block" />
            <span className="text-blue-600">Digital Life</span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed"
          >
            Stop relying on browser autofill and sticky notes. Nockslock secures
            your passwords, files, and crypto assets with bank-grade encryption
            that only you hold the keys to.
          </motion.p>
        </motion.div>
      </section>

      {/* --- SECTION 2: HERO IMAGE --- */}
      <section className="w-full px-5">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false, amount: 0.2 }}
          className="max-w-6xl mx-auto relative group"
        >
          {/* Glowing Background Pulse */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 animate-pulse"></div>

          {/* Continuous Floating Motion */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Image
              src={landingOneImage}
              alt="Nockslock Dashboard Interface"
              className="relative w-full h-auto rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* --- SECTION 3: CORE FEATURES --- */}
      <section className="px-5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            className="text-center mb-12"
          >
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              Everything You Need to Stay Safe
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              More than just a password manager.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((f) => (
              <FeatureCard
                key={f.title}
                title={f.title}
                desc={f.desc}
                icon={f.icon}
                color={f.color}
                bg={f.bg}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- SECTION 4: HOW IT WORKS --- */}
      <section className="bg-gray-50 dark:bg-gray-900 py-20 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Steps Text */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: false, amount: 0.3 }}
            >
              <p className="text-blue-600 font-bold uppercase text-sm mb-2">
                How It Works
              </p>
              <h3 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-6">
                Get started in{" "}
                <span className="text-blue-600">3 Easy Steps</span>
              </h3>
              <div className="space-y-8">
                <Step
                  number="01"
                  title="Sign Up & Create Your Vault"
                  desc="Register with your email and set a master password. This single key encrypts everything — we never see it."
                  delay={0.1}
                />
                <Step
                  number="02"
                  title="Store & Encrypt Your Assets"
                  desc="Add passwords, secure notes, files, and crypto seed phrases. Everything is encrypted with AES-256 before it leaves your device."
                  delay={0.2}
                />
                <Step
                  number="03"
                  title="Set Up Your Next of Kin"
                  desc="Designate a trusted person who can access your vault if something happens to you. Your digital legacy, protected."
                  delay={0.3}
                />
              </div>
            </motion.div>

            {/* Visual Workflow Illustration */}
            <motion.div
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.5 }}
              className="bg-white dark:bg-gray-800 p-8 md:p-10 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 min-h-[400px] flex flex-col items-center justify-center gap-6"
            >
              {/* Step 1 Node */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-4 w-full max-w-xs"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <FaLock className="text-blue-600 dark:text-blue-400 text-xl" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Create Vault
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    AES-256 encryption
                  </p>
                </div>
              </motion.div>

              {/* Connector */}
              <motion.div
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: false }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="w-0.5 h-8 bg-gradient-to-b from-blue-400 to-emerald-400 rounded-full origin-top"
              />

              {/* Step 2 Node */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-4 w-full max-w-xs"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <FaShieldHalved className="text-emerald-600 dark:text-emerald-400 text-xl" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Store Assets
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Passwords, files & crypto
                  </p>
                </div>
              </motion.div>

              {/* Connector */}
              <motion.div
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: false }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="w-0.5 h-8 bg-gradient-to-b from-emerald-400 to-rose-400 rounded-full origin-top"
              />

              {/* Step 3 Node */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-4 w-full max-w-xs"
              >
                <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <FaHandHoldingHeart className="text-rose-600 dark:text-rose-400 text-xl" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Assign Next of Kin
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Digital inheritance
                  </p>
                </div>
              </motion.div>

              {/* Status Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false }}
                transition={{ delay: 0.7 }}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-100 dark:border-emerald-800/50"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  Vault Secured & Protected
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- SECTION 5: PRIVACY OBSESSIVES --- */}
      <section className="px-5 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
            Designed for{" "}
            <span className="text-blue-600">Privacy Obsessives</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            We built Nockslock because existing solutions weren't secure enough
            for our own families.
          </p>
        </motion.div>

        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {miniFeatures.map((f) => (
              <MiniFeature
                key={f.title}
                title={f.title}
                icon={f.icon}
                color={f.color}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- SECTION 6: CTA BANNER --- */}
      <section className="w-full px-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.5 }}
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
                Join thousands of users who sleep better at night knowing their
                digital assets are safe.
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

function FeatureCard({
  title,
  desc,
  icon: Icon,
  color,
  bg,
}: {
  title: string;
  desc: string;
  icon: IconType;
  color: string;
  bg: string;
}) {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{
        y: -8,
        boxShadow:
          "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      }}
      className="flex flex-col items-center text-center p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-shadow duration-300 cursor-default"
    >
      <div
        className={`w-16 h-16 ${bg} rounded-full flex items-center justify-center mb-6`}
      >
        <Icon className={`text-2xl ${color}`} />
      </div>
      <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
        {title}
      </h4>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function MiniFeature({
  title,
  icon: Icon,
  color,
}: {
  title: string;
  icon: IconType;
  color: string;
}) {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ scale: 1.05, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
      className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 cursor-default transition-colors"
    >
      <Icon className={`text-3xl mb-3 ${color}`} />
      <h5 className="font-bold text-gray-800 dark:text-gray-200">{title}</h5>
    </motion.div>
  );
}

function Step({
  number,
  title,
  desc,
  delay,
}: {
  number: string;
  title: string;
  desc: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: false }}
      transition={{ delay: delay, duration: 0.5 }}
      className="flex gap-5"
    >
      <div className="flex-shrink-0">
        <span className="text-4xl font-black text-gray-200 dark:text-gray-700">
          {number}
        </span>
      </div>
      <div>
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          {title}
        </h4>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
          {desc}
        </p>
      </div>
    </motion.div>
  );
}
