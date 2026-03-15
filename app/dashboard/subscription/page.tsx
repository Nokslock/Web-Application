import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";
import SubscriptionManager from "@/components/subscription/SubscriptionManager";

export const metadata = {
  title: "Nockslock - Manage Subscription",
};

export default async function SubscriptionPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { data: history }] = await Promise.all([
    supabase
      .from("profiles")
      .select("plan, plan_started_at, plan_expires_at, plan_reference, plan_cancelled")
      .eq("id", user.id)
      .single(),
    supabase
      .from("payment_history")
      .select("*")
      .eq("user_id", user.id)
      .order("paid_at", { ascending: false }),
  ]);

  if (!profile || profile.plan === "free") {
    redirect("/pricing");
  }

  return (
    <SubscriptionManager
      plan={profile.plan}
      planStartedAt={profile.plan_started_at}
      planExpiresAt={profile.plan_expires_at}
      planReference={profile.plan_reference}
      planCancelled={profile.plan_cancelled ?? false}
      userEmail={user.email ?? ""}
      paymentHistory={history ?? []}
    />
  );
}
