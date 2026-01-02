"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthButton from "@/components/AuthButton";
import PasswordInput from "@/components/PasswordInput";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { FaCheck, FaCircle } from "react-icons/fa6"; 

export default function BioForm() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [email, setEmail] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    password: "",
    verifyPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --- NEW: Password Requirement Logic ---
  const passwordRequirements = [
    { label: "At least 8 characters", valid: formData.password.length >= 8 },
    { label: "At least one lowercase letter", valid: /[a-z]/.test(formData.password) },
    { label: "At least one uppercase letter", valid: /[A-Z]/.test(formData.password) },
    { label: "At least one number", valid: /\d/.test(formData.password) },
  ];

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("registerEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      router.push("/register");
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handlePhoneChange = (value: string | undefined) => {
    setFormData({ ...formData, phoneNumber: value || "" });
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.phoneNumber ||
      !formData.password ||
      !formData.verifyPassword
    ) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    // --- UPDATED REGEX ---
    // 1. (?=.*[a-z]) -> Must contain lowercase
    // 2. (?=.*[A-Z]) -> Must contain uppercase
    // 3. (?=.*\d)    -> Must contain digit
    // 4. .{8,}       -> Any character, at least 8 long
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(formData.password)) {
      setError("Password does not meet all requirements below.");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.verifyPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const { data, error: supabaseError } = await supabase.auth.signUp({
        email: email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            full_name: `${formData.firstName} ${formData.lastName}`,
            phone: formData.phoneNumber,
          },
        },
      });

      if (supabaseError) throw supabaseError;

      sessionStorage.removeItem("registerEmail");
      router.push(`/register/email-otp?email=${encodeURIComponent(email)}`);
      
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  return (
    <>
      <form className="pb-10">
        <div className="pb-5">
          <label className="block text-sm font-bold text-gray-500">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="mt-1 w-full h-13 rounded-md border border-gray-200 bg-gray-100 p-2 px-4 text-sm text-gray-500 cursor-not-allowed"
          />
        </div>

        <div className="flex gap-4 pb-5">
          <div className="w-1/2">
            <label className="block text-sm font-bold text-gray-500">First Name</label>
            <input
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
              className="mt-1 w-full h-13 rounded-md border border-gray-200 bg-white p-2 px-4 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="w-1/2">
            <label className="block text-sm font-bold text-gray-500">Last Name</label>
            <input
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              className="mt-1 w-full h-13 rounded-md border border-gray-200 bg-white p-2 px-4 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="pb-5"> 
          <label className="block text-sm font-bold text-gray-500">Phone Number</label>
          <PhoneInput
              country={'ng'}
              value={formData.phoneNumber}
              onChange={handlePhoneChange}
            />
        </div>

        {/* --- PASSWORD FIELD WITH LIVE CHECKLIST --- */}
        <div className="pb-5">
          <label className="block text-sm font-bold text-gray-500">
            Password
          </label>
          <PasswordInput
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="mt-1 w-full h-13 rounded-md border border-gray-200 bg-white p-2 px-4 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none"
          />
          
          {/* Visual Checklist */}
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
            {passwordRequirements.map((req, index) => (
              <div key={index} className="flex items-center gap-2">
                {req.valid ? (
                  <FaCheck className="text-emerald-500 text-xs" />
                ) : (
                  <FaCircle className="text-gray-300 text-[8px]" />
                )}
                <span className={`text-xs ${req.valid ? "text-emerald-600 font-medium" : "text-gray-500"}`}>
                  {req.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pb-5">
          <label className="block text-sm font-bold text-gray-500">
            Verify Password
          </label>
          <PasswordInput
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