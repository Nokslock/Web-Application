"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthButton from "@/components/AuthButton";
import { toast } from "sonner"; // <--- Import Sonner

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Sanitize Input
    const cleanEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 2. Validation
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    // Small delay to simulate transition (optional, improves UX feel)
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 3. Save to Session Storage
    if (typeof window !== "undefined") {
      sessionStorage.setItem("registerEmail", cleanEmail);
    }

    // 4. Navigate
    router.push("/register/bio-data/");
  };

  return (
    <>
      <form onSubmit={handleContinue} className="pb-8">
        <div className="pb-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 pl-1">Email Address</label>
          <input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white dark:focus:bg-gray-950 transition-all outline-none"
          />
        </div>

        <AuthButton
          variant="primary"
          type="submit"
          loading={isLoading}
          className="w-full flex justify-center py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all text-base tracking-wide"
        >
          Create Account
        </AuthButton>
      </form>
    </>
  );
}