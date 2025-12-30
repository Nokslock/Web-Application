"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client"; // <--- FIXED
import { FaCamera, FaSpinner } from "react-icons/fa6";
import DefaultPfp from "@/public/pfp-default.jpg"; 

interface ProfileFormProps {
  user: any;
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const supabase = getSupabaseBrowserClient(); // <--- FIXED
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>(
    user?.user_metadata?.avatar_url || DefaultPfp
  );

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    setLoading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to 'avatars' bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update User Metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      router.refresh(); 

    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error updating profile image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm max-w-2xl">
      <div className="flex flex-col gap-8">
        
        {/* HEADER */}
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Personal Information</h2>
          <p className="text-sm text-neutral-500">Manage your profile details.</p>
        </div>

        {/* IMAGE UPLOAD SECTION */}
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg relative">
              <Image
                src={avatarUrl}
                alt="Profile"
                fill
                className="object-cover"
              />
              {loading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                  <FaSpinner className="text-white animate-spin text-xl" />
                </div>
              )}
            </div>

            <button
              onClick={handleImageClick}
              disabled={loading}
              className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition-all z-10 group-hover:scale-110"
            >
              <FaCamera className="text-sm" />
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="flex flex-col">
             <p className="font-medium text-neutral-900">Profile Photo</p>
             <p className="text-xs text-neutral-500 max-w-[200px]">
               Click the camera icon to upload.
             </p>
          </div>
        </div>

        {/* READ ONLY FIELDS */}
        <div className="grid gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-neutral-700">Full Name</label>
            <input
              type="text"
              defaultValue={user?.user_metadata?.full_name || ""}
              disabled
              className="p-3 bg-neutral-100 border border-neutral-200 rounded-lg text-neutral-500 cursor-not-allowed focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-neutral-700">Email Address</label>
            <input
              type="email"
              defaultValue={user?.email || ""}
              disabled
              className="p-3 bg-neutral-100 border border-neutral-200 rounded-lg text-neutral-500 cursor-not-allowed focus:outline-none"
            />
          </div>
        </div>

      </div>
    </div>
  );
}