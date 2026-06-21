import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch current plan to validate they actually have one
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, plan_expires_at, stripe_subscription_id")
    .eq("id", user.id)
    .single();

  if (!profile || profile.plan === "free") {
    return NextResponse.json(
      { error: "No active subscription to cancel" },
      { status: 400 }
    );
  }

  if (!profile.stripe_subscription_id) {
    return NextResponse.json(
      { error: "No Stripe subscription found for this account" },
      { status: 400 }
    );
  }

  // Cancel at period end so the user keeps access until plan_expires_at.
  // The customer.subscription.updated webhook syncs plan_cancelled back to us.
  try {
    await stripe.subscriptions.update(profile.stripe_subscription_id, {
      cancel_at_period_end: true,
    });
  } catch (error) {
    console.error("Failed to cancel Stripe subscription:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }

  // Optimistically reflect the cancellation locally; the webhook will confirm.
  const { error } = await supabase
    .from("profiles")
    .update({
      plan_cancelled: true,
      plan_cancelled_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("Failed to flag cancellation locally:", error);
  }

  return NextResponse.json({
    success: true,
    message:
      "Subscription cancelled. You will retain access until your current billing period ends.",
    expiresAt: profile.plan_expires_at,
  });
}
