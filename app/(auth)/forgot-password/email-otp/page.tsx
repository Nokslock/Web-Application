"use client";

import { useState, useRef, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FaAngleLeft, FaEye, FaEyeSlash, FaCheck, FaXmark } from "react-icons/fa6";
import AuthButton from "@/components/AuthButton";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { toast } from "sonner";
import PasswordInput from "@/components/PasswordInput";

export default function EmailOtpVerificationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OtpVerificationForm />
    </Suspense>
  );
}

function OtpVerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = getSupabaseBrowserClient();
  const email = searchParams.get("email") || "your email";

  // --- STATES ---
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"OTP" | "PASSWORD">("OTP");
  
  // OTP State
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Password State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Password Strength State
  const [validations, setValidations] = useState({
    minLength: false,
    hasLower: false,
    hasUpper: false,
    hasNumber: false,
  });

  // --- PASSWORD CHECKER LOGIC ---
  useEffect(() => {
    setValidations({
      minLength: newPassword.length >= 8,
      hasLower: /[a-z]/.test(newPassword),
      hasUpper: /[A-Z]/.test(newPassword),
      hasNumber: /\d/.test(newPassword),
    });
  }, [newPassword]);

  const isPasswordValid = Object.values(validations).every(Boolean);

  // --- OTP HANDLERS (Same as before) ---
  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
    if (pastedData.every(char => !isNaN(Number(char)))) {
       const newOtp = [...otp];
       pastedData.forEach((char, i) => { if (i < 6) newOtp[i] = char; });
       setOtp(newOtp);
       inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  // --- SUBMIT HANDLERS ---
  const handleVerifyOtp = async () => {
    const token = otp.join("");
    if (token.length !== 6) {
      toast.warning("Please enter the full 6-digit code");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "recovery",
      });
      if (error) throw error;
      toast.success("Code verified! Please set a new password.");
      setStep("PASSWORD");
    } catch (error: any) {
      toast.error(error.message || "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!isPasswordValid) {
      toast.warning("Please meet all password requirements");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      toast.success("Password reset successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="pb-8">
        <Link href="/forgot-password/">
          <div className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors font-medium text-sm group">
            <FaAngleLeft className="group-hover:-translate-x-1 transition-transform" /> Back
          </div>
        </Link>
      </div>

      {step === "OTP" ? (
        // --- STEP 1: OTP FORM ---
        <>
          <div className="text-center px-5 mb-8">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white md:text-4xl lg:text-5xl tracking-tighter mb-4">
              Verification Code
            </h1>
            <p className="text-base text-gray-500 dark:text-gray-400 md:text-lg">
              We've sent a 6-digit code to <span className="font-bold text-gray-900 dark:text-gray-200">{email}</span>
            </p>
          </div>
          
          <div className="w-full px-4">
            <form>
              <div className="flex pb-10 pt-4 gap-2 md:gap-3 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={`w-12 h-14 md:w-14 md:h-16 text-center text-xl md:text-2xl font-bold rounded-xl border outline-none transition-all
                      ${digit 
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                        : "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white dark:focus:bg-gray-950"
                      }`}
                  />
                ))}
              </div>
              <div className="flex justify-center">
                <div onClick={handleVerifyOtp} className="w-full">
                    <AuthButton 
                        variant={loading ? "disabled" : "primary"} 
                        type="button"
                        className="w-full justify-center py-4 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 text-lg font-bold"
                        disabled={loading}
                    >
                        {loading ? "Verifying..." : "Verify Code"}
                    </AuthButton>
                </div>
              </div>
            </form>
          </div>
        </>
      ) : (
        // --- STEP 2: NEW PASSWORD FORM (UPDATED) ---
        <>
          <div className="text-center px-5 mb-8">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white md:text-4xl lg:text-5xl tracking-tighter mb-4">
              Reset Password
            </h1>
            <p className="text-base text-gray-500 dark:text-gray-400 md:text-lg">
              Secure your account with a new, strong password.
            </p>
          </div>

          <div className="w-full">
             {/* NEW PASSWORD */}
             <div className="relative mb-5">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 pl-1">New Password</label>
                <div className="relative">
                    <PasswordInput 
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white dark:focus:bg-gray-950 transition-all outline-none"
                    />
                </div>
             </div>

             {/* CONFIRM PASSWORD */}
             <div className="relative mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 pl-1">Confirm Password</label>
                <div className="relative">
                    <PasswordInput 
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full px-4 py-3.5 rounded-xl border bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-4 transition-all outline-none ${
                             confirmPassword && newPassword !== confirmPassword 
                             ? "!border-red-500 !focus:border-red-500 !bg-red-50 dark:!bg-red-900/10 focus:ring-red-500/10" 
                             : "border-gray-200 dark:border-gray-800 focus:border-blue-500 focus:ring-blue-500/10 focus:bg-white dark:focus:bg-gray-950"
                        }`}
                    />
                </div>
             </div>

             {/* PASSWORD CHECKER LIST */}
             <div className="grid grid-cols-2 gap-2 mb-8 bg-gray-50 dark:bg-gray-900/30 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
               <PasswordRequirement label="8+ Characters" met={validations.minLength} />
               <PasswordRequirement label="Lowercase" met={validations.hasLower} />
               <PasswordRequirement label="Uppercase" met={validations.hasUpper} />
               <PasswordRequirement label="Number (0-9)" met={validations.hasNumber} />
             </div>

             <div onClick={isPasswordValid && newPassword === confirmPassword ? handleUpdatePassword : undefined} className="w-full">
                <AuthButton 
                    variant={isPasswordValid && newPassword === confirmPassword ? "primary" : "disabled"} 
                    type="button"
                    className="w-full flex justify-center py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all text-base tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading || !isPasswordValid || newPassword !== confirmPassword}
                >
                    {loading ? "Updating..." : "Update Password"}
                </AuthButton>
             </div>
          </div>
        </>
      )}

      {/* FOOTER */}
      <div className="mt-12 pt-6 border-t border-gray-100 dark:border-gray-900 flex justify-between items-center text-xs text-gray-400">
          <div className="font-medium">&copy; Nokslock 2025</div>
          <Link href="#" className="hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            Privacy & Security
          </Link>
      </div>
    </>
  );
}

// Helper Component for the Checklist Items
function PasswordRequirement({ label, met }: { label: string; met: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-xs font-medium transition-colors duration-300 ${met ? "text-green-600" : "text-gray-400"}`}>
      <span className={`p-0.5 rounded-full ${met ? "bg-green-100" : "bg-gray-200"}`}>
         {met ? <FaCheck className="text-[10px]" /> : <FaXmark className="text-[10px]" />}
      </span>
      {label}
    </div>
  );
}