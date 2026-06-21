import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { stripe, priceIdForPlan, VALID_PLANS, PlanType } from "@/lib/stripe";

const PLAN_RANK: Record<string, number> = {
  free: 0, monthly: 1, "6month": 2, yearly: 3,
};

/**
 * Switches an existing subscriber to a different plan WITHOUT creating a second
 * subscription (which is what going through Checkout again would do).
 *
 *  - Upgrade   → applied immediately, Stripe invoices the prorated difference now.
 *  - Downgrade → scheduled for the end of the current period via a subscription
 *                schedule; the user keeps their current plan until then.
 *
 * Users with no active subscription (free plan) must use /api/stripe/checkout.
 */
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { planType } = (await req.json()) as { planType?: string };
  if (!planType || !VALID_PLANS.includes(planType as PlanType)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, stripe_subscription_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_subscription_id || profile.plan === "free") {
    return NextResponse.json(
      { error: "No active subscription", code: "NO_SUBSCRIPTION" },
      { status: 400 }
    );
  }

  if (profile.plan === planType) {
    return NextResponse.json(
      { error: "You're already on this plan" },
      { status: 400 }
    );
  }

  const newPrice = priceIdForPlan(planType as PlanType);
  const isUpgrade = PLAN_RANK[planType] > PLAN_RANK[profile.plan];

  try {
    const subscription = await stripe.subscriptions.retrieve(
      profile.stripe_subscription_id
    );
    const item = subscription.items.data[0];

    if (isUpgrade) {
      // Swap the price on the existing subscription and bill the difference now.
      await stripe.subscriptions.update(subscription.id, {
        items: [{ id: item.id, price: newPrice }],
        proration_behavior: "always_invoice",
        metadata: { userId: user.id, plan: planType },
      });

      return NextResponse.json({
        success: true,
        effective: "now",
        plan: planType,
        message: "Your plan has been upgraded.",
      });
    }

    // Downgrade: schedule the new price to start at the end of the current period.
    const existingSchedule = subscription.schedule;
    const schedule = existingSchedule
      ? await stripe.subscriptionSchedules.retrieve(
          typeof existingSchedule === "string"
            ? existingSchedule
            : existingSchedule.id
        )
      : await stripe.subscriptionSchedules.create({
          from_subscription: subscription.id,
        });

    const current = schedule.phases[0];
    const currentPrice =
      typeof current.items[0].price === "string"
        ? current.items[0].price
        : current.items[0].price.id;

    await stripe.subscriptionSchedules.update(schedule.id, {
      end_behavior: "release",
      proration_behavior: "none",
      phases: [
        {
          items: [{ price: currentPrice, quantity: 1 }],
          start_date: current.start_date,
          end_date: current.end_date,
        },
        {
          // Open-ended final phase: the new plan takes over at period end and
          // renews normally from there.
          items: [{ price: newPrice, quantity: 1 }],
          metadata: { userId: user.id, plan: planType },
        },
      ],
    });

    return NextResponse.json({
      success: true,
      effective: "period_end",
      plan: planType,
      message:
        "Your plan will switch at the end of your current billing period.",
    });
  } catch (error: any) {
    console.error("Plan change error:", error?.message ?? error);
    return NextResponse.json(
      { error: "Failed to change plan" },
      { status: 500 }
    );
  }
}
