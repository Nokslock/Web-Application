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

  // Fetch Vaults (never include lock_code)
  const { data: vaults, error: vaultError } = await supabase
    .from("vaults")
    .select("id, name, is_locked, share_with_nok, created_at")
    .order("created_at", { ascending: false });

  if (vaultError) {
    console.error("Error fetching vaults:", vaultError);
  }

  // Identify Locked Vault IDs — used to filter items at the DB level
  const lockedVaultIds = (vaults || [])
    .filter((v: any) => v.is_locked)
    .map((v: any) => v.id);

  // Fetch vault_items — exclude items inside LOCKED vaults at the query level
  // This ensures locked-vault ciphertext is NEVER sent to the client
  let itemsQuery = supabase
    .from("vault_items")
    .select("id, type, name, ciphertext, created_at, share_with_nok, vault_id, is_locked")
    .order("created_at", { ascending: false });

  if (lockedVaultIds.length > 0) {
    // Only return items that are either loose (no vault) or belong to an UNLOCKED vault
    itemsQuery = itemsQuery.or(
      `vault_id.is.null,vault_id.not.in.(${lockedVaultIds.join(",")})`
    );
  }

  const { data: items, error } = await itemsQuery;

  if (error) {
    console.error("Error fetching items:", error);
  }

  // Normalize vaults to look like items for the dashboard grid
  const vaultItems = (vaults || []).map((v: any) => ({
    ...v,
    type: "vault",
    ciphertext: null,
  }));

  // Combine them — no client-side filtering needed, DB already excluded locked items
  const allItems = [...(vaultItems || []), ...(items || [])];

  const serializedUser = {
    id: user.id,
    email: user.email,
    user_metadata: user.user_metadata,
  };

  return <DashboardContent user={serializedUser} items={allItems} />;
}