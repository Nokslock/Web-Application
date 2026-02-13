"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useRouter } from "next/navigation";
import {
  FaAddressBook,
  FaPen,
  FaCheck,
  FaXmark,
  FaPhone,
  FaEnvelope,
  FaIdCard,
} from "react-icons/fa6";
import clsx from "clsx";
import { toast } from "sonner";

interface NextOfKinProps {
  initialData: {
    full_name: string;
    email: string;
    alt_email: string;
    phone: string;
    nin: string;
  } | null;
  userId: string;
}

export default function NextOfKinForm({ initialData, userId }: NextOfKinProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  // Form State
  const [formData, setFormData] = useState({
    full_name: initialData?.full_name || "",
    email: initialData?.email || "",
    alt_email: initialData?.alt_email || "",
    phone: initialData?.phone || "",
    nin: initialData?.nin || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await (supabase.from("next_of_kin") as any).upsert(
        {
          user_id: userId,
          ...formData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

      if (error) throw error;

      setIsEditing(false);
      router.refresh();
      toast.success("Next of Kin saved successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error("Error updating profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <section className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-50 dark:bg-green-900/10 rounded-lg text-green-600 dark:text-green-400">
              <FaAddressBook size={16} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Next of Kin
              </h4>
              <p className="text-xs text-gray-400 font-medium">
                Emergency contact details
              </p>
            </div>
          </div>

          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-black dark:bg-white dark:text-black rounded-md hover:opacity-80 transition-opacity flex items-center gap-1.5"
                disabled={loading}
              >
                {loading ? (
                  "Saving..."
                ) : (
                  <>
                    <FaCheck size={10} /> Save
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <FaPen size={10} /> Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Full Name
            </label>
            <input
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              disabled={!isEditing}
              className={clsx(
                "w-full p-3 rounded-lg border transition-all text-sm outline-none",
                isEditing
                  ? "bg-white dark:bg-gray-900 border-blue-500 ring-4 ring-blue-500/10 text-gray-900 dark:text-white"
                  : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-500 cursor-not-allowed",
              )}
              placeholder="Full Name"
            />
          </div>

          {/* NIN */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              NIN (ID Number)
            </label>
            <input
              name="nin"
              value={formData.nin}
              onChange={handleChange}
              disabled={!isEditing}
              className={clsx(
                "w-full p-3 rounded-lg border transition-all text-sm outline-none",
                isEditing
                  ? "bg-white dark:bg-gray-900 border-blue-500 ring-4 ring-blue-500/10 text-gray-900 dark:text-white"
                  : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-500 cursor-not-allowed",
              )}
              placeholder="National ID Number"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              className={clsx(
                "w-full p-3 rounded-lg border transition-all text-sm outline-none",
                isEditing
                  ? "bg-white dark:bg-gray-900 border-blue-500 ring-4 ring-blue-500/10 text-gray-900 dark:text-white"
                  : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-500 cursor-not-allowed",
              )}
              placeholder="Email Address"
            />
          </div>

          {/* Alt Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Alternative Email
            </label>
            <input
              name="alt_email"
              type="email"
              value={formData.alt_email}
              onChange={handleChange}
              disabled={!isEditing}
              className={clsx(
                "w-full p-3 rounded-lg border transition-all text-sm outline-none",
                isEditing
                  ? "bg-white dark:bg-gray-900 border-blue-500 ring-4 ring-blue-500/10 text-gray-900 dark:text-white"
                  : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-500 cursor-not-allowed",
              )}
              placeholder="Alt. Email Address"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Phone Number
            </label>
            <input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing}
              className={clsx(
                "w-full p-3 rounded-lg border transition-all text-sm outline-none",
                isEditing
                  ? "bg-white dark:bg-gray-900 border-blue-500 ring-4 ring-blue-500/10 text-gray-900 dark:text-white"
                  : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-500 cursor-not-allowed",
              )}
              placeholder="Phone Number"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
