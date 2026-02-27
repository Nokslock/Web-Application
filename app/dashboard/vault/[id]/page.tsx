import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { notFound, redirect } from "next/navigation";
import VaultDetailClient from "@/components/vault/VaultDetailClient";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function VaultDetailPage({ params }: PageProps) {
  const supabase = await createSupabaseServerClient();
  const { id } = await params;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 1. Fetch Vault Details — explicitly exclude lock_code
  const { data: vault, error } = await supabase
    .from("vaults")
    .select("id, name, description, is_locked, share_with_nok, created_at")
    .eq("id", id)
    .single();

  if (error || !vault) {
    notFound();
  }

  // 2. Only fetch items if the vault is UNLOCKED
  // For locked vaults, items are fetched via the verifyVaultPin server action after PIN entry
  let items: any[] = [];
  if (!vault.is_locked) {
    const { data } = await supabase
      .from("vault_items")
      .select("id, type, name, ciphertext, created_at, share_with_nok, vault_id, is_locked")
      .eq("vault_id", id)
      .order("created_at", { ascending: false });
    items = data || [];
  }

  return (
    <VaultDetailClient vault={vault} items={items} />
  );
}
