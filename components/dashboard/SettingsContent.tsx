"use client";

import { motion, Variants } from "framer-motion";
import {
  FaGoogle,
  FaApple,
  FaUserShield,
  FaPassport,
  FaCamera,
  FaFileContract,
  FaTrash,
} from "react-icons/fa6";
import NextOfKinForm from "@/app/dashboard/settings/NextOfKinForm";
import ProfileForm from "@/app/dashboard/settings/profileForm";

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
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

interface SettingsContentProps {
  user: any;
  nokData: any;
}

export default function SettingsContent({
  user,
  nokData,
}: SettingsContentProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="pb-20"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-black text-gray-800">Account Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your identity, security, and legacy.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* --- LEFT COLUMN: MAIN FORMS (Wide) --- */}
        <div className="xl:col-span-2 space-y-8">
          {/* 1. PROFILE FORM */}
          <motion.section variants={itemVariants}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-base font-bold text-neutral-900">
                  Personal Information
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Manage your profile details and preferences.
                </p>
              </div>
              <div className="p-0">
                {/* Passing 'className="p-6"' if ProfileForm accepts it, or assuming it has padding */}
                <ProfileForm user={user} />
              </div>
            </div>
          </motion.section>

          {/* 2. NEXT OF KIN FORM */}
          <motion.section variants={itemVariants}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-0">
                <NextOfKinForm initialData={nokData} userId={user.id} />
              </div>
            </div>
          </motion.section>
        </div>

        {/* --- RIGHT COLUMN: STATUS & ACTIONS (Narrower) --- */}
        <div className="xl:col-span-1 space-y-8">
          {/* 3. NEW: IDENTITY VERIFICATION (KYC) */}
          <motion.section variants={itemVariants}>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 relative overflow-hidden">
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-full -z-0"></div>

              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <FaUserShield size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    Identity Verification
                  </h3>
                  <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Pending
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                To unlock full vault features and higher limits, please complete
                your KYC verification.
              </p>

              <div className="space-y-4 mb-6">
                {/* Requirement 1 */}
                <div className="flex items-start gap-3">
                  <FaPassport className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-xs font-bold text-gray-700">
                      Government ID Upload
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Passport, NIN, or Driver's License
                    </p>
                  </div>
                </div>
                {/* Requirement 2 */}
                <div className="flex items-start gap-3">
                  <FaCamera className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-xs font-bold text-gray-700">
                      Liveness Check
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Selfie verification match
                    </p>
                  </div>
                </div>
              </div>

              <button className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-200 transition-all">
                Start Verification
              </button>
            </div>
          </motion.section>

          {/* 4. THIRD PARTY CONNECTIONS */}
          <motion.section variants={itemVariants}>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">
                Connected Accounts
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <FaGoogle className="text-red-500 text-lg" /> Google
                  </div>
                  <button className="text-xs font-bold text-gray-400 hover:text-red-500">
                    Unlink
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <FaApple className="text-black text-lg" /> Apple
                  </div>
                  <button className="text-xs font-bold text-gray-400 hover:text-red-500">
                    Unlink
                  </button>
                </div>
              </div>
            </div>
          </motion.section>

          {/* 5. NEW: LEGAL & DANGER ZONE */}
          <motion.section variants={itemVariants} className="space-y-6">
            {/* Legal Links */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Legal
              </h4>
              <div className="space-y-2">
                <a
                  href="/privacy"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <FaFileContract className="text-gray-400" /> Privacy Policy
                </a>
                <a
                  href="/terms"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <FaFileContract className="text-gray-400" /> Terms &
                  Conditions
                </a>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="p-4 rounded-xl border border-red-100 bg-red-50/50">
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">
                Danger Zone
              </h4>
              <p className="text-[10px] text-red-600/70 mb-4">
                Permanently delete your account and all encrypted data. This
                cannot be undone.
              </p>
              <button className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-red-200 text-red-600 text-xs font-bold hover:bg-red-100 hover:border-red-300 transition-colors">
                <FaTrash size={12} /> Delete Account
              </button>
            </div>
          </motion.section>
        </div>
      </div>
    </motion.div>
  );
}
