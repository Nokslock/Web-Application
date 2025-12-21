"use client";
import React, { useTransition } from "react";
import { FaApple } from "react-icons/fa6";

const LoginApple = () => {
  const [isPending, startTransition] = useTransition();

  const handleAppleLogin = () => {
    startTransition(() => {
      // Simulate Apple login process 
      setTimeout(() => {
        alert("Logged in with Apple!");
      }, 1000);
    });
  };
  return (
    <div onClick={handleAppleLogin}>
      <button className="text-black flex items-center justify-center w-full px-4 py-2 mt-4 border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
        <FaApple className="text-black" />&nbsp;
        {isPending ? "Redirecting" : " Apple"}
      </button>
    </div>
  );
};

export default LoginApple;
