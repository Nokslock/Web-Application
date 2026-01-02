import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";
import DashboardContent from "@/components/dashboard/DashboardContent"; 

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // --- THE FIX IS HERE ---
  // Added "share_with_nok" to the select list
  const { data: items } = await supabase
    .from("vault_items")
    .select("id, type, name, ciphertext, created_at, share_with_nok") 
    .order("created_at", { ascending: false });

  const serializedUser = {
    id: user.id,
    email: user.email,
    user_metadata: user.user_metadata,
  };

  return <DashboardContent user={serializedUser} items={items || []} />;
}