"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
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
      const { error } = await (supabase.from("next_of_kin") as any).upsert({
  user_id: userId,
  ...formData,
  updated_at: new Date().toISOString(),
});

      if (error) throw error;

      setIsEditing(false);
      router.refresh(); // Refreshes server data
      alert("Next of Kin updated successfully!");
    } catch (error: any) {
      alert("Error updating profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="grid grid-cols-2 pb-5 items-center">
        <div>
          <p className="text-gray-600 font-bold text-xl">Next of Kin</p>
        </div>
        <div className="text-end">
          {isEditing ? (
            <div className="flex justify-end gap-3 text-sm">
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-500 hover:text-gray-700"
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
              className="text-blue-500 cursor-pointer hover:underline"
            >
              edit
            </span>
          )}
        </div>
      </div>

      {/* INPUTS */}
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-500">Full Name</label>
          <input
            name="full_name"
            disabled={!isEditing}
            value={formData.full_name}
            onChange={handleChange}
            type="text"
            placeholder="Add next of kin name"
            className={`mt-1 w-full px-4 p-2 rounded-md border text-sm text-gray-700 transition-colors ${
              isEditing
                ? "border-blue-300 bg-white focus:ring-2 focus:ring-blue-100"
                : "border-gray-200 bg-gray-50 cursor-not-allowed"
            }`}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-500">Email</label>
          <input
            name="email"
            disabled={!isEditing}
            value={formData.email}
            onChange={handleChange}
            type="email"
            placeholder="Add email"
            className={`mt-1 w-full px-4 p-2 rounded-md border text-sm text-gray-700 transition-colors ${
              isEditing
                ? "border-blue-300 bg-white focus:ring-2 focus:ring-blue-100"
                : "border-gray-200 bg-gray-50 cursor-not-allowed"
            }`}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-500">
            Alternative Email
          </label>
          <input
            name="alt_email"
            disabled={!isEditing}
            value={formData.alt_email}
            onChange={handleChange}
            type="email"
            placeholder="Add alternative email"
            className={`mt-1 w-full px-4 p-2 rounded-md border text-sm text-gray-700 transition-colors ${
              isEditing
                ? "border-blue-300 bg-white focus:ring-2 focus:ring-blue-100"
                : "border-gray-200 bg-gray-50 cursor-not-allowed"
            }`}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-500">
            Phone Number
          </label>
          <input
            name="phone"
            disabled={!isEditing}
            value={formData.phone}
            onChange={handleChange}
            type="tel"
            placeholder="Add phone number"
            className={`mt-1 w-full px-4 p-2 rounded-md border text-sm text-gray-700 transition-colors ${
              isEditing
                ? "border-blue-300 bg-white focus:ring-2 focus:ring-blue-100"
                : "border-gray-200 bg-gray-50 cursor-not-allowed"
            }`}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-500">
            National Identification Number (NIN)
          </label>
          <input
            name="nin"
            disabled={!isEditing}
            value={formData.nin}
            onChange={handleChange}
            type="text"
            placeholder="Add NIN"
            className={`mt-1 w-full px-4 p-2 rounded-md border text-sm text-gray-700 transition-colors ${
              isEditing
                ? "border-blue-300 bg-white focus:ring-2 focus:ring-blue-100"
                : "border-gray-200 bg-gray-50 cursor-not-allowed"
            }`}
          />
        </div>
      </div>
    </div>
  );
}