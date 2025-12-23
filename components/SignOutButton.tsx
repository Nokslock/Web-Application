"use client";

// UPDATED IMPORT: Matching your function name
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client"; 
import { useRouter } from "next/navigation";
import { IoMdExit } from "react-icons/io";

export default function SignOutButton() {
  const router = useRouter();
  
  // Use your specific function here
  const supabase = getSupabaseBrowserClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login"); 
    router.refresh();      
  };

  return (
    <button onClick={handleLogout} className="flex items-center justify-center text-red-600">
      <IoMdExit size={20} />
    </button>
  );
}