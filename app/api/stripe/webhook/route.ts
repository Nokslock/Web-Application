import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { stripe, planForPriceId, VALID_PLANS, PlanType } from "@/lib/stripe";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * The billing-period end moved between subscription and subscription item
 * across Stripe API versions, so read whichever is present.
 */
function periodEndISO(sub: Stripe.Subscription): string {
  const top = (sub as any).current_period_end;
  const item = (sub.items?.data?.[0] as any)?.current_period_end;
  const unix = (top ?? item) as number;
  return new Date(unix * 1000).toISOString();
}

function planFromSubscription(sub: Stripe.Subscription): PlanType | null {
  // The price is the source of truth — metadata can lag behind a scheduled
  // change, so resolve by price first and only fall back to metadata.
  const byPrice = planForPriceId(sub.items?.data?.[0]?.price?.id);
  if (byPrice) return byPrice;
  const metaPlan = sub.metadata?.plan as PlanType | undefined;
  return metaPlan && VALID_PLANS.includes(metaPlan) ? metaPlan : null;
}

async function resolveUserId(
  supabase: SupabaseClient,
  sub: Stripe.Subscription,
  fallback?: string | null
): Promise<string | null> {
  const fromMeta = (sub.metadata?.userId as string | undefined) ?? fallback;
  if (fromMeta) return fromMeta;

  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
  if (!customerId) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();
  return data?.id ?? null;
}

/**
 * Writes the active subscription state onto the user's profile. Idempotent —
 * safe to call from checkout completion and from every renewal invoice.
 */
async function activate(
  supabase: SupabaseClient,
  sub: Stripe.Subscription,
  fallbackUserId?: string | null
) {
  const userId = await resolveUserId(supabase, sub, fallbackUserId);
  const plan = planFromSubscription(sub);
  if (!userId || !plan) {
    console.error("Stripe webhook: could not resolve user/plan for", sub.id);
    return;
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      plan,
      plan_started_at: new Date(sub.start_date * 1000).toISOString(),
      plan_expires_at: periodEndISO(sub),
      plan_reference: sub.id,
      stripe_subscription_id: sub.id,
      plan_cancelled: sub.cancel_at_period_end ?? false,
    })
    .eq("id", userId);

  if (error) console.error("Failed to update profile:", error);
}

async function recordPayment(
  supabase: SupabaseClient,
  sub: Stripe.Subscription,
  invoice: Stripe.Invoice
) {
  const userId = await resolveUserId(supabase, sub);
  const plan = planFromSubscription(sub);
  if (!userId || !plan) return;

  const { error } = await supabase.from("payment_history").insert({
    user_id: userId,
    reference: invoice.id,
    plan,
    amount: invoice.amount_paid, // already in cents
    currency: invoice.currency.toUpperCase(),
    paid_at: new Date().toISOString(),
    plan_expires_at: periodEndISO(sub),
  });

  if (error) console.error("Failed to insert payment history:", error);
}

async function revertToFree(supabase: SupabaseClient, sub: Stripe.Subscription) {
  const userId = await resolveUserId(supabase, sub);
  if (!userId) return;

  const { error } = await supabase
    .from("profiles")
    .update({
      plan: "free",
      plan_cancelled: false,
      stripe_subscription_id: null,
    })
    .eq("id", userId);

  if (error) console.error("Failed to revert profile to free:", error);
}

function extractSubscriptionId(invoice: Stripe.Invoice): string | null {
  const anyInv = invoice as any;
  const raw =
    anyInv.subscription ??
    anyInv.parent?.subscription_details?.subscription ??
    invoice.lines?.data?.[0]?.subscription ??
    null;
  return typeof raw === "string" ? raw : raw?.id ?? null;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Stripe webhook signature verification failed:", err?.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = adminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription" || !session.subscription) break;
        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;
        const subscription = await stripe.subscriptions.retrieve(subId);
        await activate(supabase, subscription, session.metadata?.userId);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = extractSubscriptionId(invoice);
        if (!subId) break;
        const subscription = await stripe.subscriptions.retrieve(subId);
        await activate(supabase, subscription);
        await recordPayment(supabase, subscription, invoice);
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        if (["active", "trialing", "past_due"].includes(sub.status)) {
          await activate(supabase, sub);
        } else if (
          ["canceled", "unpaid", "incomplete_expired"].includes(sub.status)
        ) {
          await revertToFree(supabase, sub);
        }
        break;
      }

      case "customer.subscription.deleted": {
        await revertToFree(supabase, event.data.object as Stripe.Subscription);
        break;
      }
    }
  } catch (err) {
    // Always ack so Stripe doesn't hammer retries on a transient failure.
    console.error(`Stripe webhook handler error (${event.type}):`, err);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
