"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthButton from "@/components/AuthButton";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { toast } from "sonner"; // Using the toast library we set up earlier

export default function EmailForm() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.warning("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      // 1. Send the OTP
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: undefined, // We are handling the flow manually with OTP
      });

      if (error) {
        // This catches "User not found" if Email Enumeration is OFF in Supabase
        throw error;
      }

      // 2. Success: Notify and Redirect
      toast.success("OTP Code sent to your email!");
      
      // We pass the email to the next page via query params so user doesn't have to re-type it
      router.push(`/forgot-password/email-otp?email=${encodeURIComponent(email)}`);

    } catch (error: any) {
      console.error(error);
      // Specific check for user existence (depends on Supabase settings)
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
            className="mt-1 w-full px-4 p-2 h-13 rounded-md border border-gray-200 bg-white text-sm text-gray-700 focus:outline-blue-500"
          />
        </div>
        
        {/* Changed Link to a standard submit button interaction */}
        <div className="w-full">
          <AuthButton
            variant="primary"
            type="submit"
            className="w-full flex justify-center" // Ensure button is centered/full width
            disabled={loading} // Prevent double clicks
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