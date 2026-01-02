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
      <form onSubmit={handleLogin} className="lg:pb-10 md:pb-5 pb-5">
        
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
            className="w-full flex justify-center"
          >
            Login
          </AuthButton>
        </div>
      </form>
    </>
  );
}