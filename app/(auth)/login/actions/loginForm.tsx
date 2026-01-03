"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client"; 
import AuthButton from "@/components/AuthButton";
import Link from "next/link";
import PasswordInput from "@/components/PasswordInput";
import { toast } from "sonner"; // <--- Import Sonner

export default function LoginForm() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanEmail = email.trim(); 

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        // Show error toast instead of setting state
        toast.error(error.message || "Invalid login credentials.");
        setLoading(false);
        return;
      }

      // Success
      toast.success("Welcome back! Redirecting...");
      router.push("/dashboard"); 
      router.refresh();
      
    } catch (err: any) {
      toast.error("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleLogin} className="pb-4">
        
        <div className="pb-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 pl-1">Email Address</label>
          <input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white dark:focus:bg-gray-950 transition-all outline-none"
          />
        </div>

        <div className="pb-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 pl-1">
            Password
          </label>
          <PasswordInput
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white dark:focus:bg-gray-950 transition-all outline-none"
          />
        </div>

        <div className="flex justify-end pb-8">
          <Link 
            href="/forgot-password" 
            className="text-sm font-medium text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 hover:underline transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        <div>
          <AuthButton
            variant="primary"
            type="submit"
            loading={loading} 
            className="w-full flex justify-center py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all text-base tracking-wide"
          >
            Access Vault
          </AuthButton>
        </div>
      </form>
    </>
  );
}