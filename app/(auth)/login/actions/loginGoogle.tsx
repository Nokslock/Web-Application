"use client"

import React, { useTransition } from "react";
import { FaGoogle } from "react-icons/fa6";

const LoginGoogle = () => {
  const [isPending, startTransition] = useTransition();

    const handleGoogleLogin = () => {
    startTransition(() => {
      // Simulate Google login process
      setTimeout(() => {
        alert("Logged in with Google!");
      }, 1000);
    });
  };

  return (
    <div onClick={handleGoogleLogin}>
      <button className="flex items-center justify-center w-full px-4 h-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all group shadow-sm hover:shadow-md">
        <FaGoogle className="text-xl text-gray-700 dark:text-white group-hover:scale-110 transition-transform" />
        <span className="ml-3 font-semibold text-gray-700 dark:text-gray-200">{isPending ? "Connecting..." : "Google"}</span>
      </button>
    </div>
  );
};

export default LoginGoogle;