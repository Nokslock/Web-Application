"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthButton from "@/components/AuthButton";
import PasswordInput from "@/components/PasswordInput";
import { FaCheck, FaXmark, FaShieldHalved } from "react-icons/fa6";
import { toast } from "sonner";
import { initializeVaultKey } from "@/lib/vaultKeyManager";

interface SetupVaultFormProps {
    user: {
        id: string;
        email?: string;
        user_metadata?: any;
    };
}

export default function SetupVaultForm({ user }: SetupVaultFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.password || !formData.verifyPassword) {
            toast.warning("Please fill in all fields.");
            setLoading(false);
            return;
        }

        if (!isPasswordValid) {
            toast.warning("Password must meet all requirements.");
            setLoading(false);
            return;
        }

        if (formData.password !== formData.verifyPassword) {
            toast.error("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            await initializeVaultKey(formData.password, user.id);
            toast.success("Vault created successfully! Redirecting...");
            router.push("/dashboard");
            router.refresh();
        } catch (err: any) {
            toast.error(err.message || "Failed to set up vault encryption.");
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white dark:focus:bg-gray-950 transition-all outline-none";
    const labelClass =
        "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 pl-1";

    return (
        <>
            {/* EXPLANATION CARD */}
            <div className="mb-8 p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900/50">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                        <FaShieldHalved className="text-blue-600 dark:text-blue-400 text-lg" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">
                            Why do I need this?
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                            Because you signed in with Google, you need to create a unique
                            Master Password to cryptographically lock your vault. This password
                            is used to derive an encryption key that only you know — Google
                            cannot do this for you. Your data is encrypted before it ever
                            reaches our servers.
                        </p>
                    </div>
                </div>
            </div>

            <form className="pb-10" onSubmit={handleSubmit}>
                {/* MASTER PASSWORD */}
                <div className="pb-5">
                    <label className={labelClass}>Master Vault Password</label>
                    <PasswordInput
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a strong master password"
                        className={inputClass}
                    />

                    {/* VISUAL CHECKLIST */}
                    <div className="grid grid-cols-2 gap-2 mt-4 bg-gray-50 dark:bg-gray-900/30 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                        <PasswordRequirement
                            label="8+ Characters"
                            met={validations.minLength}
                        />
                        <PasswordRequirement
                            label="Lowercase Letter"
                            met={validations.hasLower}
                        />
                        <PasswordRequirement
                            label="Uppercase Letter"
                            met={validations.hasUpper}
                        />
                        <PasswordRequirement label="Number" met={validations.hasNumber} />
                    </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="pb-8">
                    <label className={labelClass}>Confirm Master Password</label>
                    <PasswordInput
                        name="verifyPassword"
                        type="password"
                        value={formData.verifyPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        className={`${inputClass} ${formData.verifyPassword &&
                                formData.password !== formData.verifyPassword
                                ? "!border-red-500 !focus:border-red-500 !bg-red-50 dark:!bg-red-900/10"
                                : ""
                            }`}
                    />
                </div>

                <AuthButton
                    variant={isPasswordValid ? "primary" : "disabled"}
                    type="submit"
                    loading={loading}
                    disabled={loading}
                    className="w-full flex justify-center py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all text-base tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Initialize Vault
                </AuthButton>
            </form>
        </>
    );
}

// --- REUSABLE CHECKLIST ITEM COMPONENT ---
function PasswordRequirement({ label, met }: { label: string; met: boolean }) {
    return (
        <div
            className={`flex items-center gap-2 text-xs font-medium transition-colors duration-300 ${met ? "text-emerald-700 dark:text-emerald-400" : "text-gray-400"
                }`}
        >
            <span
                className={`flex items-center justify-center w-4 h-4 rounded-full transition-colors duration-300 ${met
                        ? "bg-emerald-100 dark:bg-emerald-900/30"
                        : "bg-gray-200 dark:bg-gray-800"
                    }`}
            >
                {met ? (
                    <FaCheck className="text-[8px] text-emerald-600 dark:text-emerald-400" />
                ) : (
                    <FaXmark className="text-[8px] text-gray-400" />
                )}
            </span>
            {label}
        </div>
    );
}
