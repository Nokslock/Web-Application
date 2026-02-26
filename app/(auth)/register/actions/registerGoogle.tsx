"use client";

import React, { useState } from "react";
import { FaGoogle } from "react-icons/fa6";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { toast } from "sonner";

const RegisterGoogle = () => {
  const [isPending, setIsPending] = useState(false);

  const handleGoogleRegister = async () => {
    setIsPending(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });

      if (error) {
        toast.error(error.message || "Failed to connect with Google.");
        setIsPending(false);
      }
    } catch {
      toast.error("An unexpected error occurred.");
      setIsPending(false);
    }
  };

  return (
    <div onClick={handleGoogleRegister}>
      <button
        disabled={isPending}
        className="flex items-center justify-center w-full px-4 h-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all group shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <FaGoogle className="text-xl text-gray-700 dark:text-white group-hover:scale-110 transition-transform" />
        <span className="ml-3 font-semibold text-gray-700 dark:text-gray-200">
          {isPending ? "Connecting..." : "Google"}
        </span>
      </button>
    </div>
  );
};

export default RegisterGoogle;