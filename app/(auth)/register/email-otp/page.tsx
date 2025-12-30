"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import AuthButton from "@/components/AuthButton";
import Link from "next/link";
import { FaAngleLeft } from "react-icons/fa6";

export default function EmailOtpVerification() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = getSupabaseBrowserClient();
  
  // Get email from URL (e.g., /verify?email=john@example.com)
  const email = searchParams.get("email");

  // State for the 6-digit OTP
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs to control focus jumping
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Handle typing in a box
  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    
    // Allow only one character per box
    newOtp[index] = value.substring(value.length - 1); 
    setOtp(newOtp);

    // Move focus to next input if value is entered
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Paste (User pastes "123456")
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
    if (pastedData.every((char) => !isNaN(Number(char)))) {
      const newOtp = [...otp];
      pastedData.forEach((char, index) => {
        if (index < 6) newOtp[index] = char;
      });
      setOtp(newOtp);
      // Focus the last filled input
      const lastIndex = Math.min(pastedData.length, 5);
      inputRefs.current[lastIndex]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const token = otp.join("");

    if (token.length !== 6) {
      setError("Please enter the full 6-digit code.");
      setLoading(false);
      return;
    }

    if (!email) {
      setError("Email address is missing. Please go back and try again.");
      setLoading(false);
      return;
    }

    // Verify with Supabase
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "signup", // Use 'signup' for new users, or 'email' for magic links
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Success! Redirect to dashboard or next step
      router.push("/dashboard"); 
      router.refresh();
    }
  };

  // Check if all boxes are filled to enable button
  const isComplete = otp.every((digit) => digit !== "");

  return (
    <>
      <div className="pb-3">
        <Link href="/register/bio-data/">
          <div className="px-5 flex items-center gap-2 text-blue-400 text-lg font-medium cursor-pointer hover:underline">
            <FaAngleLeft /> Back
          </div>
        </Link>
      </div>
      
      <h2 className="lg:text-5xl md:text-4xl font-bold mb-8 text-center text-gray-800">
        Enter Verification Code
      </h2>
      
      <p className="text-center text-lg pb-5 text-gray-600">
        We've sent a verification code to{" "}
        <span className="font-bold text-gray-900">{email || "your email"}</span>
      </p>

      {/* Error Message */}
      {error && (
        <div className="mx-auto max-w-md mb-6 p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm text-center">
          {error}
        </div>
      )}

      <div className="px-5 md:px-20">
        <form onSubmit={handleVerify}>
          {/* OTP Inputs Grid */}
          <div className="flex pb-10 pt-5 justify-center gap-3 md:gap-4">
            {otp.map((digit, index) => (
              <div
                key={index}
                className="w-12 h-12 md:w-14 md:h-14 relative"
              >
                <input
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`
                    w-full h-full text-center text-2xl font-semibold rounded-lg border outline-none transition-all
                    ${digit 
                      ? "border-blue-500 bg-blue-50 text-blue-600" 
                      : "border-gray-300 bg-white text-gray-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    }
                  `}
                />
              </div>
            ))}
          </div>

          <AuthButton 
            variant={isComplete ? "primary" : "disabled"} 
            type="submit"
            loading={loading}
            disabled={!isComplete || loading}
          >
            Verify OTP
          </AuthButton>
        </form>
        
        {/* Resend Link (Optional UX) */}
        <p className="text-center mt-6 text-gray-500">
          Didn't receive the code?{" "}
          <button type="button" className="text-blue-500 font-semibold hover:underline">
            Resend
          </button>
        </p>
      </div>
    </>
  );
}