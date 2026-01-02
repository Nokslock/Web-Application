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
      <form onSubmit={handleSubmit} className="pb-10">
        <div className="pb-5">
          <label className="block text-sm font-bold text-gray-500">Email</label>
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            // UPDATED: Matches Login/Register style exactly
            className="mt-1 w-full px-4 p-2 h-13 rounded-md border border-gray-200 bg-white text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
          />
        </div>
        
        <div className="w-full">
          <AuthButton
            variant="primary"
            type="submit"
            className="w-full flex justify-center" 
            disabled={loading} 
          >
            {loading ? "Sending Code..." : "Reset Password"}
          </AuthButton>
        </div>

        <p className="text-center pt-10 pb-10">
          Already have an Account? &nbsp;
          <Link href="/login" className="text-blue-400 font-medium hover:underline">
            Login
          </Link>
        </p>
      </form>
    </>
  );
}