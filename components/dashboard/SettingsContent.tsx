"use client";

import { motion, Variants } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { toast } from "sonner";
import {
  FaGoogle,
  FaApple,
  FaUserShield,
  FaPassport,
  FaCamera,
  FaFileContract,
  FaTrash,
  FaTriangleExclamation,
  FaXmark,
} from "react-icons/fa6";
import NextOfKinForm from "@/app/dashboard/settings/NextOfKinForm";
import ProfileForm from "@/app/dashboard/settings/profileForm";

// --- SUB-COMPONENT: DELETE ACCOUNT SECTION ---
function DeleteAccountSection() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      // Call the Postgres function
      const { error } = await supabase.rpc("delete_own_account");
      if (error) throw error;

      // Clean up local session
      await supabase.auth.signOut();

      toast.success("Account deleted successfully.");
      router.push("/");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to delete account");
      setLoading(false);
      setShowModal(false);
    }
  };

  return (
    <>
      <div className="p-4 rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
        <h4 className="text-xs font-bold text-red-400 dark:text-red-300 uppercase tracking-wider mb-2">
          Danger Zone
        </h4>
        <p className="text-[10px] text-red-600/70 dark:text-red-400/70 mb-4">
          Permanently delete your account and all encrypted data. This cannot be
          undone.
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 transition-colors"
        >
          <FaTrash size={12} /> Delete Account
        </button>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-neutral-200 dark:border-gray-800 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowModal(false)}
              disabled={loading}
              className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-600 p-1"
            >
              <FaXmark size={18} />
            </button>

            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <FaTriangleExclamation className="text-red-600 text-xl" />
              </div>

              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                Delete Account?
              </h3>

              <p className="text-sm text-neutral-500 dark:text-gray-400 mb-6">
                Are you sure? This will{" "}
                <span className="font-bold text-red-600 dark:text-red-400">
                  permanently erase
                </span>{" "}
                all your data. This cannot be undone.
              </p>

              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
                >
                  {loading ? "Deleting..." : "Yes, Delete Everything"}
                </button>

                <button
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 hover:bg-neutral-50 dark:hover:bg-gray-700 text-neutral-700 dark:text-gray-200 rounded-lg font-bold text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
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
        <h1 className="text-3xl font-black text-gray-800 dark:text-white">Account Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your identity, security, and legacy.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* --- LEFT COLUMN: MAIN FORMS (Wide) --- */}
        <div className="xl:col-span-2 space-y-8">
          {/* 1. PROFILE FORM */}
          <motion.section variants={itemVariants}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                  Personal Information
                </h2>
                <p className="text-sm text-neutral-500 dark:text-gray-400 mt-1">
                  Manage your profile details and preferences.
                </p>
              </div>
              <div className="p-0">
                <ProfileForm user={user} />
              </div>
            </div>
          </motion.section>

          {/* 2. NEXT OF KIN FORM */}
          <motion.section variants={itemVariants}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-0">
                <NextOfKinForm initialData={nokData} userId={user.id} />
              </div>
            </div>
          </motion.section>
        </div>

        {/* --- RIGHT COLUMN: STATUS & ACTIONS (Narrower) --- */}
        <div className="xl:col-span-1 space-y-8">
          {/* 3. IDENTITY VERIFICATION (KYC) */}
          <motion.section variants={itemVariants}>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm dark:shadow-none border border-blue-100 dark:border-gray-700 relative overflow-hidden">
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-bl-full -z-0"></div>

              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <FaUserShield size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    Identity Verification
                  </h3>
                  <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Pending
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                To unlock full vault features and higher limits, please complete
                your KYC verification.
              </p>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <FaPassport className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Government ID Upload
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">
                      Passport, NIN, or Driver's License
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaCamera className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Liveness Check
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">
                      Selfie verification match
                    </p>
                  </div>
                </div>
              </div>

              <button className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-200 dark:shadow-none transition-all">
                Start Verification
              </button>
            </div>
          </motion.section>

          {/* 4. THIRD PARTY CONNECTIONS */}
          <motion.section variants={itemVariants}>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                Connected Accounts
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                    <FaGoogle className="text-red-500 text-lg" /> Google
                  </div>
                  <button className="text-xs font-bold text-gray-400 hover:text-red-500">
                    Unlink
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                    <FaApple className="text-black dark:text-white text-lg" /> Apple
                  </div>
                  <button className="text-xs font-bold text-gray-400 hover:text-red-500">
                    Unlink
                  </button>
                </div>
              </div>
            </div>
          </motion.section>

          {/* 5. LEGAL & DANGER ZONE */}
          <motion.section variants={itemVariants} className="space-y-6">
            {/* Legal Links */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Legal
              </h4>
              <div className="space-y-2">
                <a
                  href="/privacy"
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <FaFileContract className="text-gray-400" /> Privacy Policy
                </a>
                <a
                  href="/terms"
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <FaFileContract className="text-gray-400" /> Terms &
                  Conditions
                </a>
              </div>
            </div>

            {/* DANGER ZONE (Functional Component) */}
            <DeleteAccountSection />
          </motion.section>
        </div>
      </div>
    </motion.div>
  );
}
