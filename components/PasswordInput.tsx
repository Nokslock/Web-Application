"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function PasswordInput({ label, className, ...rest }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="pb-5">
      {label && (
        <label className="block text-sm font-bold text-gray-500 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          {...rest} // Passes down all standard props (value, onChange, placeholder, etc.)
          type={showPassword ? "text" : "password"}
          className={`
            w-full h-13 rounded-md border border-gray-200 bg-white p-2 px-4 pr-10 
            text-sm text-gray-700 focus:border-emerald-500 focus:outline-none 
            ${className}
          `}
        />
        
        <button
          type="button" // Important: Prevent form submission
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? (
            <FaEyeSlash size={20} /> // Icon when visible
          ) : (
            <FaEye size={20} />      // Icon when hidden
          )}
        </button>
      </div>
    </div>
  );
}