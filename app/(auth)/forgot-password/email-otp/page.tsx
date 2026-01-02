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
      <div className="pb-3">
        <Link href="/forgot-password/">
          <div className="px-5 flex items-center gap-2 text-blue-400 text-lg font-medium hover:text-blue-500 transition-colors">
            <FaAngleLeft /> Back
          </div>
        </Link>
      </div>

      {step === "OTP" ? (
        // --- STEP 1: OTP FORM ---
        <>
          <h2 className="lg:text-5xl md:text-4xl font-bold mb-8 text-center text-gray-800">
            Enter Verification Code
          </h2>
          <p className="text-center text-lg pb-5 text-gray-600">
            We've sent a verification code to <br />
            <span className="font-bold text-gray-900">{email}</span>
          </p>
          
          <div className="px-4 md:px-20">
            <form>
              <div className="flex pb-10 pt-6 gap-2 md:gap-4 justify-center">
                {otp.map((digit, index) => (
                  <div key={index} className="w-10 h-12 md:w-14 md:h-16 relative rounded-lg shadow-sm">
                    <input
                      ref={(el) => { inputRefs.current[index] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className={`w-full h-full text-center text-2xl font-bold rounded-lg border 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all
                        ${digit ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-300 bg-white text-gray-800"}
                      `}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-center">
                <div onClick={handleVerifyOtp} className="w-full">
                    <AuthButton 
                        variant={loading ? "disabled" : "primary"} 
                        type="button"
                        className="w-full flex justify-center"
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
          <h2 className="lg:text-4xl md:text-3xl font-bold mb-4 text-center text-gray-800">
            Reset Password
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Please enter your new password below.
          </p>

          <div className="px-4 md:px-20 max-w-md mx-auto">
             <div className="relative mb-6">
                <label className="block text-sm font-bold text-gray-500 mb-1">New Password</label>
                <div className="relative">
                    <PasswordInput 
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 rounded-md border border-gray-200 bg-white text-gray-800 focus:outline-blue-500"
                    />
                </div>
             </div>

             {/* PASSWORD CHECKER LIST */}
             <div className="grid grid-cols-2 gap-2 mb-8 bg-gray-50 p-4 rounded-lg border border-gray-100">
               <PasswordRequirement label="8+ Characters" met={validations.minLength} />
               <PasswordRequirement label="Lowercase Letter" met={validations.hasLower} />
               <PasswordRequirement label="Uppercase Letter" met={validations.hasUpper} />
               <PasswordRequirement label="Number (0-9)" met={validations.hasNumber} />
             </div>

             <div onClick={isPasswordValid ? handleUpdatePassword : undefined} className="w-full">
                <AuthButton 
                    variant={isPasswordValid ? "primary" : "disabled"} 
                    type="button"
                    className="w-full flex justify-center transition-colors duration-300"
                    disabled={loading || !isPasswordValid}
                >
                    {loading ? "Updating..." : "Update Password"}
                </AuthButton>
             </div>
          </div>
        </>
      )}
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