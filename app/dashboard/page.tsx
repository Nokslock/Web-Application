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
  // Removed "updated_at" to fix query failure if column is missing
  const { data: items, error } = await supabase
    .from("vault_items")
    .select("id, type, name, ciphertext, created_at, share_with_nok, vault_id, is_locked") 
    .order("created_at", { ascending: false });

  // Fetch Vaults as well
  const { data: vaults, error: vaultError } = await supabase
    .from("vaults")
    .select("id, name, is_locked, share_with_nok, created_at")
    .order("created_at", { ascending: false });

  if (error || vaultError) {
    console.error("Error fetching data:", error || vaultError);
  }

  // Normalize vaults to look like items
  const vaultItems = (vaults || []).map((v: any) => ({
    ...v,
    type: "vault", // meaningful type
    ciphertext: null, // vaults don't have ciphertext themselves in this view
  }));

  // Identify Locked Vault IDs
  const lockedVaultIds = new Set(
    (vaults || []).filter((v: any) => v.is_locked).map((v: any) => v.id)
  );

  // Filter Items:
  // 1. Exclude items that are inside LOCKED vaults (they should be invisible globally)
  // 2. We keep items in UNLOCKED vaults visible globally (as requested "items in unlocked vaults would show")
  const visibleItems = (items || []).filter((item: any) => {
    if (item.vault_id && lockedVaultIds.has(item.vault_id)) {
      return false; 
    }
    return true;
  });

  // Combine them
  const allItems = [...(vaultItems || []), ...visibleItems];

  const serializedUser = {
    id: user.id,
    email: user.email,
    user_metadata: user.user_metadata,
  };

  return <DashboardContent user={serializedUser} items={allItems} />;
}