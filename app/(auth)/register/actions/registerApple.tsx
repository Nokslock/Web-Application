"use client";

import React, { useTransition } from "react";
import { FaApple } from "react-icons/fa6";

const RegisterApple = () => {

  const [isPending, startTransition] = useTransition();

  const handleAppleRegister = () => {
    startTransition(() => {
      // Simulate Apple registration process
      alert("Registered with Apple!");
    });
  };
  return (
    <>
    <div onClick={handleAppleRegister}>
      <button className="text-black flex items-center justify-center w-full px-4 py-2 mt-4 border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                <FaApple className="text-black" />&nbsp;
                {isPending ? "Redirecting" : "Continue with Apple"}
      </button>
    </div>
    </>
  );
};

export default RegisterApple;