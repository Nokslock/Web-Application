"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"
import AuthButton from "@/components/AuthButton";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleContinue = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Perform validation
    if (!email || !emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    // small delay to simulate server request
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // This saves the email in the browser's invisible storage for this tab
    if (typeof window !== "undefined") {
      sessionStorage.setItem("registerEmail", email);
    }
    // Navigate to the next step
    router.push("/register/bio-data/");
  };

  return (
    <>
      <form className="pb-10">
        <div className="pb-5">
          <label className="block text-sm font-bold text-gray-500">Email</label>
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            // Clear error when user starts typing again
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            // Add red border if there is an error
            className={`mt-1 w-full px-4 p-2 h-13 rounded-md border bg-white text-sm text-gray-700 
              ${error ? "border-red-500" : "border-gray-200"}`}
          />
          {/* Show error text if exists */}
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>

        <AuthButton
          variant="primary"
          type="button"
          onClick={handleContinue}
          loading={isLoading}
        >
          Create Account
        </AuthButton>
      </form>
    </>
  );
}
