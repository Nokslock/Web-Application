"use client";

import { motion, Variants, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { toast } from "sonner";
import { clearVaultKey } from "@/lib/vaultKeyManager";
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
  FaUser,
  FaPeopleArrows,
  FaLink,
  FaScaleBalanced,
} from "react-icons/fa6";
import NextOfKinForm from "@/app/dashboard/settings/NextOfKinForm";
import ProfileForm from "@/app/dashboard/settings/profileForm";

// --- TAB CONFIG ---
const tabs = [
  { id: "profile", label: "Profile", icon: FaUser },
  { id: "next-of-kin", label: "Next of Kin", icon: FaPeopleArrows },
  { id: "verification", label: "Verification", icon: FaUserShield },
  { id: "connections", label: "Connections", icon: FaLink },
  { id: "legal", label: "Legal & Account", icon: FaScaleBalanced },
] as const;

type TabId = (typeof tabs)[number]["id"];

// --- SUB-COMPONENT: DELETE ACCOUNT SECTION ---
function DeleteAccountSection({ email }: { email: string }) {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<"warning" | "otp">("warning");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [timer, setTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  // Timer Countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      });

      if (error) throw error;

      setStep("otp");
      setTimer(60); // 60s cooldown
      toast.success(`Verification code sent to ${email}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndDelete = async () => {
    const token = otp.join("");
    if (token.length !== 6) {
      toast.error("Please enter the full 6-digit code");
      return;
    }

    setLoading(true);
    try {
      // 1. Verify OTP
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });

      if (verifyError) throw verifyError;

      // 2. Call the Postgres function to delete
      const { error: deleteError } = await supabase.rpc("delete_own_account");
      if (deleteError) throw deleteError;

      // 3. Clean up local session
      clearVaultKey();
      await supabase.auth.signOut();

      toast.success("Account deleted successfully.");
      router.push("/");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <>
      <div className="p-5 rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
        <h4 className="text-sm font-bold text-red-600 dark:text-red-400 mb-2">
          Danger Zone
        </h4>
        <p className="text-sm text-red-600/70 dark:text-red-400/70 mb-4 leading-relaxed">
          Permanently delete your account and all encrypted data. This action
          cannot be undone.
        </p>
        <button
          onClick={() => {
            setShowModal(true);
            setStep("warning");
            setOtp(new Array(6).fill(""));
          }}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 transition-colors"
        >
          <FaTrash size={14} /> Delete Account
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

              {step === "warning" ? (
                <>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                    Delete Account?
                  </h3>

                  <p className="text-sm text-neutral-500 dark:text-gray-400 mb-6">
                    Are you sure? This will{" "}
                    <span className="font-bold text-red-600 dark:text-red-400">
                      permanently erase
                    </span>{" "}
                    all your data.
                  </p>

                  <div className="flex flex-col gap-3 w-full">
                    <button
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
                    >
                      {loading ? "Sending Code..." : "Yes, Continue"}
                    </button>

                    <button
                      onClick={() => setShowModal(false)}
                      disabled={loading}
                      className="w-full py-3 px-4 bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 hover:bg-neutral-50 dark:hover:bg-gray-700 text-neutral-700 dark:text-gray-200 rounded-lg font-bold text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                    Verify Deletion
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-gray-400 mb-6">
                    Enter the 6-digit code sent to{" "}
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                      {email}
                    </span>
                  </p>

                  <div className="flex justify-center gap-2 mb-8">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className={`w-10 h-12 text-center text-xl font-bold rounded-lg border outline-none transition-all
                            ${digit
                            ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30"
                          }`}
                      />
                    ))}
                  </div>

                  <div className="flex flex-col gap-3 w-full">
                    <button
                      onClick={handleVerifyAndDelete}
                      disabled={loading || otp.join("").length !== 6}
                      className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
                    >
                      {loading ? "Verifying..." : "Verify & Delete Account"}
                    </button>

                    {timer > 0 ? (
                      <p className="text-xs text-gray-400">
                        Resend code in {timer}s
                      </p>
                    ) : (
                      <button
                        onClick={handleSendOtp}
                        className="text-xs text-blue-500 font-bold hover:underline"
                        disabled={loading}
                      >
                        Resend Code
                      </button>
                    )}

                    <button
                      onClick={() => setStep("warning")}
                      disabled={loading}
                      className="w-full py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm font-semibold"
                    >
                      Back
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// --- SUB-COMPONENT: CONNECTIONS PANEL ---
function ConnectionsPanel({ user }: { user: any }) {
  const [linking, setLinking] = useState(false);
  const supabase = getSupabaseBrowserClient();

  // Check if Google is linked by looking at user.identities
  const identities = user?.identities || [];
  const googleIdentity = identities.find(
    (id: any) => id.provider === "google"
  );
  const isGoogleLinked = !!googleIdentity;
  const googleEmail = googleIdentity?.identity_data?.email || "";

  const handleLinkGoogle = async () => {
    setLinking(true);
    try {
      const { error } = await supabase.auth.linkIdentity({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/settings`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Failed to link Google account");
      setLinking(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Connected Accounts
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage third-party login providers linked to your account.
        </p>
      </div>
      <div className="p-6 space-y-3">
        {/* Google Row */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <FaGoogle className="text-red-500 text-lg" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Google
              </p>
              {isGoogleLinked ? (
                <p className="text-xs text-emerald-500 font-semibold">
                  Connected{googleEmail ? ` • ${googleEmail}` : ""}
                </p>
              ) : (
                <p className="text-xs text-gray-400">Not connected</p>
              )}
            </div>
          </div>
          {isGoogleLinked ? (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg">
              Linked
            </span>
          ) : (
            <button
              onClick={handleLinkGoogle}
              disabled={linking}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50"
            >
              {linking ? "Linking..." : "Link Account"}
            </button>
          )}
        </div>

        {/* Apple Row (Coming Soon) */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700 opacity-60">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <FaApple className="text-black dark:text-white text-lg" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Apple
              </p>
              <p className="text-xs text-gray-400">Coming Soon</p>
            </div>
          </div>
          <span className="text-xs font-bold text-gray-400 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            Soon
          </span>
        </div>
      </div>
    </div>
  );
}

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const panelVariants: Variants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.15 } },
};

interface SettingsContentProps {
  user: any;
  nokData: any;
}

export default function SettingsContent({
  user,
  nokData,
}: SettingsContentProps) {
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="pb-20"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-black text-gray-800 dark:text-white">
          Account Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your identity, security, and legacy.
        </p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="flex flex-col lg:flex-row gap-8"
      >
        {/* --- SIDEBAR TABS --- */}
        <nav className="lg:w-56 flex-shrink-0">
          <div className="lg:sticky lg:top-24 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-2 shadow-sm">
            {/* Mobile: horizontal scroll, Desktop: vertical stack */}
            <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible no-scrollbar">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200
                      ${isActive
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
                      }
                    `}
                  >
                    <tab.icon
                      size={16}
                      className={
                        isActive
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-400 dark:text-gray-500"
                      }
                    />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* --- MAIN CONTENT PANEL --- */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                variants={panelVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      Personal Information
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Manage your profile details and preferences.
                    </p>
                  </div>
                  <div className="p-0">
                    <ProfileForm user={user} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* NEXT OF KIN TAB */}
            {activeTab === "next-of-kin" && (
              <motion.div
                key="next-of-kin"
                variants={panelVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-0">
                    <NextOfKinForm initialData={nokData} userId={user.id} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* VERIFICATION TAB */}
            {activeTab === "verification" && (
              <motion.div
                key="verification"
                variants={panelVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-6 md:p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <FaUserShield size={22} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                          Identity Verification
                        </h2>
                        <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
                          Pending
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed max-w-lg">
                      To unlock full vault features and higher limits, please
                      complete your KYC verification.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                      <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                          <FaPassport className="text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                            Government ID Upload
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            Passport, NIN, or Driver&apos;s License
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                          <FaCamera className="text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                            Liveness Check
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            Selfie verification match
                          </p>
                        </div>
                      </div>
                    </div>

                    <button className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-200 dark:shadow-none transition-all">
                      Start Verification
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* CONNECTIONS TAB */}
            {activeTab === "connections" && (
              <motion.div
                key="connections"
                variants={panelVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <ConnectionsPanel user={user} />
              </motion.div>
            )}

            {/* LEGAL & ACCOUNT TAB */}
            {activeTab === "legal" && (
              <motion.div
                key="legal"
                variants={panelVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                {/* Legal Links Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      Legal
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Review our policies and terms.
                    </p>
                  </div>
                  <div className="p-6 space-y-2">
                    <a
                      href="/privacy"
                      className="flex items-center gap-3 p-3 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <FaFileContract className="text-gray-400" /> Privacy
                      Policy
                    </a>
                    <a
                      href="/terms"
                      className="flex items-center gap-3 p-3 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <FaFileContract className="text-gray-400" /> Terms &
                      Conditions
                    </a>
                  </div>
                </div>

                {/* Danger Zone Card */}
                <DeleteAccountSection email={user.email} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
