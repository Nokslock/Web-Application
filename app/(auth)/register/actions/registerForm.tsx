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
      <form onSubmit={handleContinue} className="pb-10">
        <div className="pb-5">
          <label className="block text-sm font-bold text-gray-500">Email</label>
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            // Updated styles to match LoginForm
            className="mt-1 w-full px-4 p-2 h-13 rounded-md border border-gray-200 bg-white text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <AuthButton
          variant="primary"
          type="submit" // Changed to submit so "Enter" key works
          loading={isLoading}
          className="w-full flex justify-center"
        >
          Create Account
        </AuthButton>
      </form>
    </>
  );
}