import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";
import VaultGrid from "@/components/vault/VaultGrid";
import CreateVaultFab from "@/components/vault/CreateVaultFab";
import VaultPaywall from "@/components/vault/VaultPaywall";
import { isSubscriptionActive } from "@/lib/subscription";

export default async function VaultPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Check subscription status
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, plan_expires_at")
    .eq("id", user.id)
    .single();

  const hasActiveSubscription =
    profile?.plan !== "free" && isSubscriptionActive(profile?.plan_expires_at);

  if (!hasActiveSubscription) {
    return <VaultPaywall />;
  }

  // Fetch Vaults
  // Explicitly exclude lock_code from the response
  const { data: vaults } = await supabase
    .from("vaults")
    .select("id, name, description, is_locked, share_with_nok, created_at")
    .order("created_at", { ascending: false });

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