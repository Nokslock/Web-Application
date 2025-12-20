"use client";

import React, { useTransition } from "react";
import { FaGoogle } from "react-icons/fa6";
const RegisterGoogle = () => {
  const [isPending, startTransition] = useTransition();

    const handleGoogleRegister = () => {
    startTransition(() => {
      // Simulate Google registration process
      setTimeout(() => {
        alert("Registered with Google!");
      }, 1000);
    });
  };
  return (
    <>
    <div onClick={handleGoogleRegister}>
            <button className="text-black flex items-center justify-center w-full px-4 py-2 mt-4 border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
              <FaGoogle className="text-black" />&nbsp;
              {isPending ? "Redirecting" : "Continue with Google"}
            </button>
    </div>
    </>
  );
};

export default RegisterGoogle;