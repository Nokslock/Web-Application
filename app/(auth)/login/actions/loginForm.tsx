"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client"; 
import AuthButton from "@/components/AuthButton";
import Link from "next/link";

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

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false); // Stop loading if error
    } else {
      router.push("/dashboard"); 
      router.refresh();
      // Note: We don't set loading(false) here because we are navigating away.
      // Keeping it true prevents the user from clicking the button again while the page redirects.
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
          <input
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