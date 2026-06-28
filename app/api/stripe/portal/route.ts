import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { stripe, priceIdForPlan, VALID_PLANS, PlanType } from "@/lib/stripe";

/**
 * Creates a Stripe Billing Portal session for an existing subscriber.
 *
 * When a `planType` is supplied, the session deep-links straight to the portal's
 * "confirm subscription update" screen for that price — Stripe then handles the
 * proration, payment collection, and any SCA/3DS authentication before applying
 * the change. Without a `planType`, it opens the general management portal.
 */
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let planType: string | undefined;
  try {
    ({ planType } = await req.json());
  } catch {
    // No body — general portal session.
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, stripe_subscription_id, plan")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No billing account found" },
      { status: 400 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const params: any = {
    customer: profile.stripe_customer_id,
    return_url: `${appUrl}/dashboard/subscription`,
  };
  if (process.env.STRIPE_PORTAL_CONFIG_ID) {
    params.configuration = process.env.STRIPE_PORTAL_CONFIG_ID;
  }

  // Deep-link to the confirm-and-pay screen for a specific plan change.
  if (planType) {
    if (!VALID_PLANS.includes(planType as PlanType)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    if (!profile.stripe_subscription_id) {
      return NextResponse.json(
        { error: "No active subscription", code: "NO_SUBSCRIPTION" },
        { status: 400 }
      );
    }

    try {
      const subscription = await stripe.subscriptions.retrieve(
        profile.stripe_subscription_id
      );
      const item = subscription.items.data[0];

      params.flow_data = {
        type: "subscription_update_confirm",
        subscription_update_confirm: {
          subscription: profile.stripe_subscription_id,
          items: [{ id: item.id, price: priceIdForPlan(planType as PlanType), quantity: 1 }],
        },
      };
    } catch (error: any) {
      console.error("Portal flow setup error:", error?.message ?? error);
      return NextResponse.json(
        { error: "Failed to open billing portal" },
        { status: 500 }
      );
    }
  }

  try {
    const session = await stripe.billingPortal.sessions.create(params);
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Portal session error:", error?.message ?? error);
    return NextResponse.json(
      { error: "Failed to open billing portal" },
      { status: 500 }
    );
  }
}
