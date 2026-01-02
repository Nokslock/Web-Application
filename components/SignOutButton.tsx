"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client"; 
import { useRouter } from "next/navigation";
import { IoMdExit } from "react-icons/io";
import { toast } from "sonner"; // <--- Import Sonner

export default function SignOutButton() {
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
      className="flex items-center justify-center text-red-600 hover:text-red-700 transition-colors"
      title="Sign Out"
    >
      <IoMdExit size={20} />
    </button>
  );
}