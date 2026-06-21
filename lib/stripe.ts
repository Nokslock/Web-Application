import Stripe from "stripe";

/**
 * Lazily-initialized Stripe client. Constructing eagerly would throw at module
 * load time (and break `next build`) whenever STRIPE_SECRET_KEY is absent, so
 * the real client is created on first use. Uses the account's default API
 * version. Call sites use `stripe.<resource>` exactly as if it were a client.
 */
let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const client = getStripe();
    const value = client[prop as keyof Stripe];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export type PlanType = "monthly" | "6month" | "yearly";

export const VALID_PLANS: PlanType[] = ["monthly", "6month", "yearly"];

/**
 * Maps an internal plan type to its configured Stripe Price ID.
 * Each price must be a recurring price created in the Stripe dashboard:
 *   - monthly: every 1 month
 *   - 6month:  every 6 months
 *   - yearly:  every 1 year
 */
export function priceIdForPlan(plan: PlanType): string {
  const map: Record<PlanType, string | undefined> = {
    monthly: process.env.STRIPE_PRICE_MONTHLY,
    "6month": process.env.STRIPE_PRICE_6MONTH,
    yearly: process.env.STRIPE_PRICE_YEARLY,
  };
  const priceId = map[plan];
  if (!priceId) {
    throw new Error(`No Stripe price configured for plan "${plan}"`);
  }
  return priceId;
}

/**
 * Reverse lookup: resolves a Stripe Price ID back to an internal plan type.
 * Returns null if the price isn't one of our configured plans.
 */
export function planForPriceId(priceId: string | null | undefined): PlanType | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_MONTHLY) return "monthly";
  if (priceId === process.env.STRIPE_PRICE_6MONTH) return "6month";
  if (priceId === process.env.STRIPE_PRICE_YEARLY) return "yearly";
  return null;
}
