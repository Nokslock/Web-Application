"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import AuthButton from "@/components/AuthButton";
import PasswordInput from "@/components/PasswordInput";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { FaCheck, FaXmark } from "react-icons/fa6"; // Switched to FaXmark for consistency
import { toast } from "sonner"; // Added Sonner for consistent alerts

export default function BioForm() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    password: "",
    verifyPassword: "",
  });

  // --- REAL-TIME VALIDATION STATE ---
  const [validations, setValidations] = useState({
    minLength: false,
    hasLower: false,
    hasUpper: false,
    hasNumber: false,
  });

  useEffect(() => {
    // Check if email exists in session
    const storedEmail = sessionStorage.getItem("registerEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      router.push("/register");
    }
  }, [router]);

  // Update validations whenever password changes
  useEffect(() => {
    const pwd = formData.password;
    setValidations({
      minLength: pwd.length >= 8,
      hasLower: /[a-z]/.test(pwd),
      hasUpper: /[A-Z]/.test(pwd),
      hasNumber: /\d/.test(pwd),
    });
  }, [formData.password]);

  const isPasswordValid = Object.values(validations).every(Boolean);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (value: string | undefined) => {
    setFormData({ ...formData, phoneNumber: value || "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Basic Empty Check
    if (!formData.firstName || !formData.lastName || !formData.phoneNumber || !formData.password || !formData.verifyPassword) {
      toast.warning("Please fill in all fields.");
      setLoading(false);
      return;
    }

    // 2. Password Requirement Check
    if (!isPasswordValid) {
      toast.warning("Password must meet all requirements.");
      setLoading(false);
      return;
    }

    // 3. Match Check
    if (formData.password !== formData.verifyPassword) {
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const { error: supabaseError } = await supabase.auth.signUp({
        email: email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            full_name: `${formData.firstName} ${formData.lastName}`.trim(),
            phone: formData.phoneNumber,
          },
        },
      });

      if (supabaseError) throw supabaseError;

      // Success
      toast.success("Account created successfully!");
      sessionStorage.removeItem("registerEmail");
      router.push(`/register/email-otp?email=${encodeURIComponent(email)}`);
      
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  return (
    <>
      <form className="pb-10">
        {/* EMAIL (Read-Only) */}
        <div className="pb-5">
          <label className="block text-sm font-bold text-gray-500">Email Address</label>
          <input
            type="email"
            value={email}
            disabled
            className="mt-1 w-full h-13 rounded-md border border-gray-200 bg-gray-100 p-2 px-4 text-sm text-gray-500 cursor-not-allowed"
          />
        </div>

        {/* NAMES */}
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

        {/* PHONE */}
        <div className="pb-5"> 
          <label className="block text-sm font-bold text-gray-500">Phone Number</label>
          <PhoneInput
              country={'ng'}
              value={formData.phoneNumber}
              onChange={handlePhoneChange}
              inputStyle={{
                width: '100%',
                height: '52px', // Matches h-13 (approx 52px)
                borderRadius: '0.375rem',
                borderColor: '#e5e7eb',
              }}
            />
        </div>

        {/* PASSWORD FIELD */}
        <div className="pb-5">
          <label className="block text-sm font-bold text-gray-500">Password</label>
          <PasswordInput
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="mt-1 w-full h-13 rounded-md border border-gray-200 bg-white p-2 px-4 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none"
          />
          
          {/* VISUAL CHECKLIST (Pill Style) */}
          <div className="grid grid-cols-2 gap-2 mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
             <PasswordRequirement label="8+ Characters" met={validations.minLength} />
             <PasswordRequirement label="Lowercase Letter" met={validations.hasLower} />
             <PasswordRequirement label="Uppercase Letter" met={validations.hasUpper} />
             <PasswordRequirement label="Number" met={validations.hasNumber} />
          </div>
        </div>

        {/* VERIFY PASSWORD */}
        <div className="pb-8">
          <label className="block text-sm font-bold text-gray-500">Verify Password</label>
          <PasswordInput
            name="verifyPassword"
            type="password"
            value={formData.verifyPassword}
            onChange={handleChange}
            placeholder="Verify Password"
            className={`mt-1 w-full h-13 rounded-md border p-2 px-4 text-sm text-gray-700 focus:outline-none transition-colors ${
              formData.verifyPassword && formData.password !== formData.verifyPassword
                ? "border-red-500 focus:border-red-500 bg-red-50"
                : "border-gray-200 focus:border-emerald-500 bg-white"
            }`}
          />
        </div>

        <AuthButton
          variant={isPasswordValid ? "primary" : "disabled"}
          onClick={handleSubmit}
          type="submit"
          loading={loading}
          disabled={loading}
        >
          Create Account
        </AuthButton>
      </form>
    </>
  );
}

// --- REUSABLE CHECKLIST ITEM COMPONENT ---
function PasswordRequirement({ label, met }: { label: string; met: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-xs font-medium transition-colors duration-300 ${met ? "text-emerald-700" : "text-gray-400"}`}>
      <span className={`flex items-center justify-center w-4 h-4 rounded-full transition-colors duration-300 ${met ? "bg-emerald-100" : "bg-gray-200"}`}>
         {met ? <FaCheck className="text-[8px] text-emerald-600" /> : <FaXmark className="text-[8px] text-gray-400" />}
      </span>
      {label}
    </div>
  );
}