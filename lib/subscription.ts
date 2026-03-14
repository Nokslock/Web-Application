/**
 * Returns true if the user currently has an active paid plan.
 */
export function isSubscriptionActive(planExpiresAt: string | null): boolean {
  if (!planExpiresAt) return false;
  return new Date(planExpiresAt) > new Date();
}

/**
 * Returns the number of days remaining in the subscription.
 * Returns 0 if expired or no expiry set.
 */
export function daysRemaining(planExpiresAt: string | null): number {
  if (!planExpiresAt) return 0;
  const diff = new Date(planExpiresAt).getTime() - Date.now();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Returns a human-readable label for the plan type.
 */
export function planLabel(plan: string | null): string {
  switch (plan) {
    case "monthly": return "Monthly Plan";
    case "6month": return "6-Month Plan";
    case "yearly": return "Yearly Plan";
    default: return "Free Plan";
  }
}
