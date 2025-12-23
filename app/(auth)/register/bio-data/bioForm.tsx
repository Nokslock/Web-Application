"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthButton from "@/components/AuthButton";
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

export default function BioForm() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [email, setEmail] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    password: "",
    verifyPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get email from the browser storage
    const storedEmail = sessionStorage.getItem("registerEmail");

    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // If no email is found, go back to the first step
      router.push("/register");
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

   // Specific handler for PhoneInput
    const handlePhoneChange = (value: string | undefined) => {
      setFormData({ ...formData, phoneNumber: value || "" });
      if (error) setError("");
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (
      !formData.fullName ||
      !formData.phoneNumber ||
      !formData.password ||
      !formData.verifyPassword
    ) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    // Password Regex: at least 8 characters, one uppercase, one lowercase, one number, one special character
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(formData.password)) {
      setError(
        "Password must contain at least 8 characters, including uppercase, lowercase, numbers, and symbols."
      );
      setLoading(false);
      return;
    }

    //password match check

    if (formData.password !== formData.verifyPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      // Submit to Supabase
      const { data, error: supabaseError } = await supabase.auth.signUp({
        email: email, // Using the email from state
        password: formData.password,
        options: {
          data: {
            name: formData.fullName,
            full_name: formData.fullName,
            phone: formData.phoneNumber,
          },
        },
      });

      if (supabaseError) throw supabaseError;

      // Clear storage since we are done with it
      sessionStorage.removeItem("registerEmail");

      router.push("/register/email-otp/");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // If email hasn't loaded yet, show nothing (prevents hydration mismatch)
  if (!email) return null;

  return (
    <>
      <form className="pb-10">
        {/* 2. Read-Only Email Field (Visual Confirmation) */}
        <div className="pb-5">
          <label className="block text-sm font-bold text-gray-500">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            disabled // User cannot change this here
            className="mt-1 w-full h-13 rounded-md border border-gray-200 bg-gray-100 p-2 px-4 text-sm text-gray-500 cursor-not-allowed"
          />
        </div>

        <div className="pb-5">
          <label className="block text-sm font-bold text-gray-500">
            Full Name
          </label>
          <input
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Your Full Name"
            className="mt-1 w-full h-13 rounded-md border border-gray-200 bg-white p-2 px-4 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="pb-5"> 
          <label className="block text-sm font-bold text-gray-500">
            Phone Number
          </label>
          <PhoneInput
              country={'ng'}
              value={formData.phoneNumber}
              onChange={handlePhoneChange}
            />
          </div>

        <div className="pb-5">
          <label className="block text-sm font-bold text-gray-500">
            Password
          </label>
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="mt-1 w-full h-13 rounded-md border border-gray-200 bg-white p-2 px-4 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="pb-5">
          <label className="block text-sm font-bold text-gray-500">
            Verify Password
          </label>
          <input
            name="verifyPassword"
            type="password"
            value={formData.verifyPassword}
            onChange={handleChange}
            placeholder="Verify Password"
            className={`mt-1 w-full h-13 rounded-md border p-2 px-4 text-sm text-gray-700 focus:outline-none ${
              formData.verifyPassword &&
              formData.password !== formData.verifyPassword
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200 focus:border-emerald-500"
            }`}
          />
        </div>

        {error && (
          <div className="mb-5 rounded-md bg-red-50 p-3 text-sm text-red-500">
            {error}
          </div>
        )}

        <AuthButton
          variant="primary"
          onClick={handleSubmit}
          type="submit"
          loading={loading}
        >
          Create Account
        </AuthButton>
      </form>
    </>
  );
}
