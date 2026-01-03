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

  // 1. Fetch Vault Details
  const { data: vault, error } = await supabase
    .from("vaults")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !vault) {
    notFound();
  }

  // 2. Fetch Items in this vault
  // Note: We are fetching ciphertext here. In a real highly-secure app, we might ONLY fetch this after a second password verification on the server,
  // but for this architecture, we send the encrypted blobs to the client, and the client "Gatekeeper" UI prevents viewing them until unlocked.
  const { data: items } = await supabase
    .from("vault_items")
    .select("*")
    .eq("vault_id", id)
    .order("created_at", { ascending: false });

  return (
    <VaultDetailClient vault={vault} items={items || []} />
  );
}
