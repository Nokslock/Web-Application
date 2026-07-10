/**
 * Payment mode switch.
 *
 * The client currently collects payment through the mobile apps, so the web
 * app routes "subscribe / upgrade" CTAs to the app-store download page instead
 * of Stripe. All Stripe code (routes, components, lib/stripe) is left intact —
 * flip NEXT_PUBLIC_PAYMENTS_MODE to "stripe" to restore web checkout.
 */
export type PaymentsMode = "app" | "stripe";

export const PAYMENTS_MODE: PaymentsMode =
  process.env.NEXT_PUBLIC_PAYMENTS_MODE === "stripe" ? "stripe" : "app";

/** True when web-based Stripe checkout should be used. */
export const isStripeEnabled = PAYMENTS_MODE === "stripe";

/** Store URLs — set these in the environment once the apps are published. */
export const APP_STORE_URL = process.env.NEXT_PUBLIC_APP_STORE_URL || "#";
export const PLAY_STORE_URL = process.env.NEXT_PUBLIC_PLAY_STORE_URL || "#";
