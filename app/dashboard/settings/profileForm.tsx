"use client";

import { useState, useRef } from "react";
import Image, { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import {
  FaCamera,
  FaSpinner,
  FaCheck,
  FaEnvelope,
  FaLock,
  FaXmark,
  FaPen,
  FaFingerprint,
  FaUserShield,
} from "react-icons/fa6";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import DefaultPfp from "@/public/pfp-default.jpg";
import clsx from "clsx";

interface ProfileFormProps {
  user: any;
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HELPER: Parse Initial Names ---
  const meta = user?.user_metadata || {};
  const initialFirst = meta.first_name || meta.full_name?.split(" ")[0] || "";
  const initialLast =
    meta.last_name || meta.full_name?.split(" ").slice(1).join(" ") || "";

  // --- STATES ---
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | StaticImageData>(
    meta.avatar_url || DefaultPfp,
  );

  // Name Editing State
  const [isEditingNames, setIsEditingNames] = useState(false);
  const [firstName, setFirstName] = useState(initialFirst);
  const [lastName, setLastName] = useState(initialLast);

  // Modal States
  const [modalType, setModalType] = useState<"NONE" | "EMAIL" | "PASSWORD">(
    "NONE",
  );

  // --- HANDLERS ---

  // 1. IMAGE UPLOAD
  const handleImageClick = () => fileInputRef.current?.click();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Uploading image...");

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });
      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      router.refresh();
      toast.success("Profile photo updated!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload image", { id: toastId });
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 2. UPDATE NAMES
  const handleUpdateNames = async () => {
    setLoading(true);
    try {
      const updates = {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`.trim(),
      };

      const { error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) throw error;

      setIsEditingNames(false);
      router.refresh();
      toast.success("Profile details updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const displayName =
    firstName && lastName
      ? `${firstName} ${lastName}`
      : meta.full_name || user.email?.split("@")[0] || "User";

  return (
    <div className="p-6 space-y-10">
      {/* 1. HEADER / AVATAR ROW */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group">
          <div className="w-20 h-20 rounded-full border border-gray-200 dark:border-gray-700 overflow-hidden relative bg-gray-50 dark:bg-gray-800 shadow-sm">
            <Image
              src={avatarUrl}
              alt="Profile"
              fill
              className={clsx(
                "object-cover transition-opacity duration-300",
                loading ? "opacity-50" : "opacity-100",
              )}
              priority
            />
            {loading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20 backdrop-blur-sm">
                <FaSpinner className="text-white animate-spin text-sm" />
              </div>
            )}
            <div
              onClick={handleImageClick}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer flex items-center justify-center"
            >
              <FaCamera className="text-white" />
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {displayName}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {user.email}
          </p>
          <p className="text-xs text-gray-400 mt-1 dark:text-gray-500 font-mono">
            UID: {user.id.slice(0, 8)}...
          </p>
        </div>

        <button
          onClick={handleImageClick}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
        >
          Change Avatar
        </button>
      </div>

      <hr className="border-t border-gray-100 dark:border-gray-800" />

      {/* 2. PERSONAL DETAILS SECTION */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400">
            <FaFingerprint size={16} />
          </div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            Personal Details
          </h4>
        </div>

        <div className="space-y-4 pl-0 sm:pl-2">
          <div className="flex justify-between items-center">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Full Name
            </h5>
            {isEditingNames ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditingNames(false)}
                  className="text-xs font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateNames}
                  disabled={loading}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  Save
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingNames(true)}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <FaPen size={10} /> Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={!isEditingNames || loading}
              className={clsx(
                "w-full p-3 rounded-lg border transition-all text-sm outline-none",
                isEditingNames
                  ? "bg-white dark:bg-gray-900 border-blue-500 ring-4 ring-blue-500/10 text-gray-900 dark:text-white"
                  : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-500 cursor-not-allowed",
              )}
              placeholder="First Name"
            />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={!isEditingNames || loading}
              className={clsx(
                "w-full p-3 rounded-lg border transition-all text-sm outline-none",
                isEditingNames
                  ? "bg-white dark:bg-gray-900 border-blue-500 ring-4 ring-blue-500/10 text-gray-900 dark:text-white"
                  : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-500 cursor-not-allowed",
              )}
              placeholder="Last Name"
            />
          </div>
        </div>
      </section>

      <hr className="border-t border-gray-100 dark:border-gray-800" />

      {/* 3. SECURITY SECTION */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-purple-50 dark:bg-purple-900/10 rounded-lg text-purple-600 dark:text-purple-400">
            <FaUserShield size={16} />
          </div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            Login & Security
          </h4>
        </div>

        <div className="space-y-4">
          {/* Email Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:border-gray-200 dark:hover:border-gray-700 transition-all shadow-sm hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <FaEnvelope />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                  Email Address
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => setModalType("EMAIL")}
              className="px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-gray-900"
            >
              Change
            </button>
          </div>

          {/* Password Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:border-gray-200 dark:hover:border-gray-700 transition-all shadow-sm hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <FaLock />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                  Password
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Last changed recently
                </p>
              </div>
            </div>
            <button
              onClick={() => setModalType("PASSWORD")}
              className="px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-gray-900"
            >
              Update
            </button>
          </div>
        </div>
      </section>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {modalType === "EMAIL" && (
          <EmailUpdateModal
            user={user}
            supabase={supabase}
            onClose={() => setModalType("NONE")}
          />
        )}
        {modalType === "PASSWORD" && (
          <PasswordResetModal
            user={user}
            supabase={supabase}
            onClose={() => setModalType("NONE")}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function EmailUpdateModal({
  user,
  supabase,
  onClose,
}: {
  user: any;
  supabase: any;
  onClose: () => void;
}) {
  const [step, setStep] = useState(1);
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const initiateEmailChange = async () => {
    if (!newEmail || newEmail === user.email) {
      toast.warning("Please enter a valid, new email address.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      setStep(2);
      toast.success(`Code sent to ${newEmail}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailOtp = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: newEmail,
        token: otp,
        type: "email_change",
      });
      if (error) throw error;
      toast.success("Email updated successfully!");
      router.refresh();
      onClose();
    } catch (err: any) {
      toast.error("Invalid OTP or expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 w-full max-w-sm"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Update Email
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <FaXmark />
          </button>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">
                New Email
              </label>
              <input
                type="email"
                className="w-full p-2.5 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <button
              onClick={initiateEmailChange}
              disabled={loading || !newEmail}
              className="w-full bg-black dark:bg-white text-white dark:text-black p-2.5 rounded-lg font-bold hover:opacity-80 disabled:opacity-50 transition-opacity"
            >
              {loading ? "Sending..." : "Send Code"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">
                OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                className="w-full p-2.5 border rounded-lg text-center tracking-widest font-mono dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <button
              onClick={verifyEmailOtp}
              disabled={loading || otp.length < 6}
              className="w-full bg-black dark:bg-white text-white dark:text-black p-2.5 rounded-lg font-bold hover:opacity-80 disabled:opacity-50 transition-opacity"
            >
              {loading ? "Verifying..." : "Verify Change"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function PasswordResetModal({
  user,
  supabase,
  onClose,
}: {
  user: any;
  supabase: any;
  onClose: () => void;
}) {
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const sendResetOtp = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email);
      if (error) throw error;
      setStep(2);
      toast.success(`Code sent to ${user.email}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpAndSetPassword = async () => {
    setLoading(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: user.email,
        token: otp,
        type: "recovery",
      });
      if (verifyError) throw verifyError;
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) throw updateError;
      toast.success("Password updated!");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Invalid Code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 w-full max-w-sm"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Reset Password
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <FaXmark />
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We'll send a code to <b>{user.email}</b>
            </p>
            <button
              onClick={sendResetOtp}
              disabled={loading}
              className="w-full bg-black dark:bg-white text-white dark:text-black p-2.5 rounded-lg font-bold hover:opacity-80 disabled:opacity-50 transition-opacity"
            >
              {loading ? "Sending..." : "Send Code"}
            </button>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="000000"
                maxLength={6}
                className="w-full p-2.5 border rounded-lg text-center tracking-widest font-mono dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <input
                type="password"
                placeholder="New Password"
                className="w-full p-2.5 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <button
              onClick={verifyOtpAndSetPassword}
              disabled={loading || otp.length < 6 || newPassword.length < 6}
              className="w-full bg-black dark:bg-white text-white dark:text-black p-2.5 rounded-lg font-bold hover:opacity-80 disabled:opacity-50 transition-opacity"
            >
              {loading ? "Updating..." : "Set Password"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
