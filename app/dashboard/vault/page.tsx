import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";
import VaultGrid from "@/components/vault/VaultGrid";
import CreateVaultFab from "@/components/vault/CreateVaultFab";

export default async function VaultPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch Vaults
  const { data: vaults } = await supabase
    .from("vaults")
    .select("*")
    .order("created_at", { ascending: false });

  // Optional: Fetch item counts per vault (requires join or separate query) - skipping for now

  return (
    <div className="flex flex-col h-full relative pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">Your Vaults</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Organize your secure assets into folders.
        </p>
      </div>

      <VaultGrid vaults={vaults || []} />
      
      <CreateVaultFab />
    </div>
  );
}