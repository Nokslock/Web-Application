"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client"; 
import AuthButton from "@/components/AuthButton";
import Link from "next/link";
import PasswordInput from "@/components/PasswordInput";

export default function LoginForm() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. SANITIZE INPUT (The Fix)
    // We trim spaces to ensure clean data is sent
    const cleanEmail = email.trim(); 

    // 2. DEBUG LOGS (Check your browser console!)
    // If you see " user@gmail.com " (with quotes & spaces) in the first log,
    // but the second log is clean, then this fix is working.
    console.log("Raw Input:", JSON.stringify(email));
    console.log("Sending to Supabase:", JSON.stringify(cleanEmail));

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      console.error("Login Error:", error.message); // See the specific error
      setError(error.message);
      setLoading(false);
    } else {
      console.log("Login Success! Redirecting...");
      router.push("/dashboard"); 
      router.refresh();
    }
  };

  return (
    <>
      <form onSubmit={handleLogin} className="lg:pb-10 md:pb-5 pb-5">
        
        {/* Error Message Display */}
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-500 border border-red-200">
            {error}
          </div>
        )}

        <div className="pb-5">
          <label className="block text-sm font-bold text-gray-500">Email</label>
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full px-4 p-2 h-13 rounded-md border border-gray-200 bg-white text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="pb-5">
          <label className="block text-sm font-bold text-gray-500">
            Password
          </label>
          <PasswordInput
            type="password"
            placeholder="Your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full px-4 p-2 h-13 rounded-md border border-gray-200 bg-white text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="pb-5">
          <p className="text-md text-end text-blue-400">
            <Link href="/forgot-password">Forgot Password?</Link>
          </p>
        </div>

        <div>
          <AuthButton
            variant="primary"
            type="submit"
            loading={loading} 
          >
            Login
          </AuthButton>
        </div>
      </form>
    </>
  );
}