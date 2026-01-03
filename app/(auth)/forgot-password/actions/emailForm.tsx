"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthButton from "@/components/AuthButton";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { toast } from "sonner"; 

export default function EmailForm() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sanitize input
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      toast.warning("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: undefined, 
      });

      if (error) throw error;

      toast.success("OTP Code sent to your email!");
      
      router.push(`/forgot-password/email-otp?email=${encodeURIComponent(cleanEmail)}`);

    } catch (error: any) {
      console.error(error);
      if (error.message.includes("not found") || error.status === 404) {
        toast.error("This email does not exist in our system.");
      } else {
        toast.error(error.message || "Failed to send reset email.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="pb-4">
        <div className="pb-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 pl-1">Email Address</label>
          <input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white dark:focus:bg-gray-950 transition-all outline-none"
          />
        </div>
        
        <div className="w-full">
          <AuthButton
            variant="primary"
            type="submit"
            className="w-full flex justify-center py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all text-base tracking-wide"
            disabled={loading} 
          >
            {loading ? "Sending Code..." : "Reset Password"}
          </AuthButton>
        </div>

        <p className="text-center pt-8 pb-4 text-sm text-gray-500 dark:text-gray-400">
          Remember your password? &nbsp;
          <Link href="/login" className="font-bold text-blue-600 dark:text-blue-500 hover:underline">
            Login here
          </Link>
        </p>
      </form>
    </>
  );
}