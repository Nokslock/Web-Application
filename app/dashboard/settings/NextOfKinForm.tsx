"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client"; // Checked your import path
import { useRouter } from "next/navigation";

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
      // 👇 THE FIX: Added the second argument { onConflict: 'user_id' }
      const { error } = await (supabase.from("next_of_kin") as any).upsert(
        {
          user_id: userId,
          ...formData,
          updated_at: new Date().toISOString(), // This now works since you added the column
        },
        { onConflict: "user_id" } // <--- CRITICAL: Tells DB "If this user_id exists, update it. If not, create it."
      );

      if (error) throw error;

      setIsEditing(false);
      router.refresh();
      alert("Next of Kin saved successfully!");
    } catch (error: any) {
      console.error(error);
      alert("Error updating profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Added h-full and flex logic to match your other cards
    <div className="card bg-white dark:bg-gray-800 pb-6 h-full rounded-lg shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
      {/* HEADER */}
      <div>
        <div className="grid grid-cols-3 items-center border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 px-6">
          <div className="py-4 col-span-2">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Next of Kin</h2>
            <p className="text-sm text-neutral-500 dark:text-gray-400">Manage your NOK details.</p>
          </div>
          <div className="text-end col-span-1">
            {isEditing ? (
              <div className="flex justify-end gap-3 text-sm">
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="text-blue-600 font-bold hover:text-blue-800"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            ) : (
              <span
                onClick={() => setIsEditing(true)}
                className="text-blue-500 dark:text-blue-400 cursor-pointer hover:underline"
              >
                edit
              </span>
            )}
          </div>
        </div>

        {/* INPUTS */}
        <div className="space-y-5 px-6 pt-5">
          <div>
            <label className="block text-sm font-bold text-gray-500 dark:text-gray-400">
              Full Name
            </label>
            <input
              name="full_name"
              disabled={!isEditing}
              value={formData.full_name}
              onChange={handleChange}
              type="text"
              placeholder="Add next of kin name"
              className={`mt-1 w-full px-4 p-2 rounded-md border text-sm text-gray-700 dark:text-gray-200 transition-colors ${
                isEditing
                  ? "border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:outline-none"
                  : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed"
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-500 dark:text-gray-400">
              Email
            </label>
            <input
              name="email"
              disabled={!isEditing}
              value={formData.email}
              onChange={handleChange}
              type="email"
              placeholder="Add email"
              className={`mt-1 w-full px-4 p-2 rounded-md border text-sm text-gray-700 dark:text-gray-200 transition-colors ${
                isEditing
                  ? "border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:outline-none"
                  : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed"
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-500 dark:text-gray-400">
              Alternative Email
            </label>
            <input
              name="alt_email"
              disabled={!isEditing}
              value={formData.alt_email}
              onChange={handleChange}
              type="email"
              placeholder="Add alternative email"
              className={`mt-1 w-full px-4 p-2 rounded-md border text-sm text-gray-700 dark:text-gray-200 transition-colors ${
                isEditing
                  ? "border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:outline-none"
                  : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed"
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-500 dark:text-gray-400">
              Phone Number
            </label>
            <input
              name="phone"
              disabled={!isEditing}
              value={formData.phone}
              onChange={handleChange}
              type="tel"
              placeholder="Add phone number"
              className={`mt-1 w-full px-4 p-2 rounded-md border text-sm text-gray-700 dark:text-gray-200 transition-colors ${
                isEditing
                  ? "border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:outline-none"
                  : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed"
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-500 dark:text-gray-400">
              National Identification Number (NIN)
            </label>
            <input
              name="nin"
              disabled={!isEditing}
              value={formData.nin}
              onChange={handleChange}
              type="text"
              placeholder="Add NIN"
              className={`mt-1 w-full px-4 p-2 rounded-md border text-sm text-gray-700 dark:text-gray-200 transition-colors ${
                isEditing
                  ? "border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:outline-none"
                  : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
