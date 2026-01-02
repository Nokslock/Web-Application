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

  // 1. FETCH DATA
  const { data: items } = await supabase
    .from("vault_items")
    .select("id, type, name, ciphertext, created_at")
    .order("created_at", { ascending: false });

  // 2. SANITIZE USER DATA (Fixes Hydration Error)
  // We extract only what we need. Passing the full 'user' object causes issues.
  const serializedUser = {
    id: user.id,
    email: user.email,
    user_metadata: user.user_metadata,
    // Add other fields if strictly necessary
  };

  // 3. Pass sanitized data to the Client Component
  return <DashboardContent user={serializedUser} items={items || []} />;
}