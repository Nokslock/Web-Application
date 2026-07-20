"use client";

import React, { useState } from "react";
import { FaApple } from "react-icons/fa6";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { toast } from "sonner";

const LoginApple = () => {
  const [isPending, setIsPending] = useState(false);

  const handleAppleLogin = async () => {
    setIsPending(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });

      if (error) {
        toast.error(error.message || "Failed to connect with Apple.");
        setIsPending(false);
      }
    } catch {
      toast.error("An unexpected error occurred.");
      setIsPending(false);
    }
  };

  return (
    <div onClick={handleAppleLogin}>
      <button
        disabled={isPending}
        className="flex items-center justify-center w-full px-4 h-12 bg-black dark:bg-white border border-black dark:border-white rounded-xl hover:opacity-90 transition-all group shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <FaApple className="text-xl text-white dark:text-black group-hover:scale-110 transition-transform" />
        <span className="ml-3 font-semibold text-white dark:text-black">
          {isPending ? "Connecting..." : "Apple"}
        </span>
      </button>
    </div>
  );
};

export default LoginApple;
