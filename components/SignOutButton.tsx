"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useRouter } from "next/navigation";
import { IoMdExit } from "react-icons/io";
import { toast } from "sonner"; // <--- Import Sonner

interface SignOutButtonProps {
  className?: string;
  showLabel?: boolean;
}

export default function SignOutButton({ className, showLabel }: SignOutButtonProps) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();

    } catch (error: any) {
      toast.error(error.message || "Error signing out");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={className || "flex items-center justify-center text-red-600 hover:text-red-700 transition-colors"}
      title="Sign Out"
    >
      <IoMdExit size={20} />
      {showLabel && <span>Sign Out</span>}
    </button>
  );
}