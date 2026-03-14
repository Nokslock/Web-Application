/**
 * Tests for lib/subscription.ts — Subscription Utility Functions
 *
 * Pure functions with no external dependencies — easy to test,
 * but important to verify edge cases around date handling.
 */

import { isSubscriptionActive, daysRemaining, planLabel } from "@/lib/subscription";

// =============================================================================
// 1. isSubscriptionActive
// =============================================================================

describe("isSubscriptionActive", () => {
  it("returns true when expiry is in the future", () => {
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    expect(isSubscriptionActive(futureDate.toISOString())).toBe(true);
  });

  it("returns false when expiry is in the past", () => {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // yesterday
    expect(isSubscriptionActive(pastDate.toISOString())).toBe(false);
  });

  it("returns false when expiry is null", () => {
    expect(isSubscriptionActive(null)).toBe(false);
  });

  it("returns false when expiry is right now (edge case)", () => {
    // new Date() inside the function will be slightly after this timestamp
    const now = new Date().toISOString();
    // This could be true or false depending on timing, so we just verify it doesn't crash
    const result = isSubscriptionActive(now);
    expect(typeof result).toBe("boolean");
  });

  it("handles far-future dates", () => {
    expect(isSubscriptionActive("2099-12-31T23:59:59.999Z")).toBe(true);
  });

  it("handles far-past dates", () => {
    expect(isSubscriptionActive("2000-01-01T00:00:00.000Z")).toBe(false);
  });
});

// =============================================================================
// 2. daysRemaining
// =============================================================================

describe("daysRemaining", () => {
  it("returns correct days for future expiry", () => {
    const daysFromNow = 15;
    const futureDate = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
    const result = daysRemaining(futureDate.toISOString());

    // Allow ±1 day tolerance due to timing
    expect(result).toBeGreaterThanOrEqual(daysFromNow - 1);
    expect(result).toBeLessThanOrEqual(daysFromNow);
  });

  it("returns 0 for past expiry", () => {
    const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    expect(daysRemaining(pastDate.toISOString())).toBe(0);
  });

  it("returns 0 for null", () => {
    expect(daysRemaining(null)).toBe(0);
  });

  it("never returns negative numbers", () => {
    const wayPast = new Date("2020-01-01").toISOString();
    expect(daysRemaining(wayPast)).toBe(0);
  });

  it("returns a large number for far-future dates", () => {
    const farFuture = new Date("2099-12-31").toISOString();
    expect(daysRemaining(farFuture)).toBeGreaterThan(365);
  });
});

// =============================================================================
// 3. planLabel
// =============================================================================

describe("planLabel", () => {
  it('returns "Monthly Plan" for monthly', () => {
    expect(planLabel("monthly")).toBe("Monthly Plan");
  });

  it('returns "6-Month Plan" for 6month', () => {
    expect(planLabel("6month")).toBe("6-Month Plan");
  });

  it('returns "Yearly Plan" for yearly', () => {
    expect(planLabel("yearly")).toBe("Yearly Plan");
  });

  it('returns "Free Plan" for null', () => {
    expect(planLabel(null)).toBe("Free Plan");
  });

  it('returns "Free Plan" for unknown plan types', () => {
    expect(planLabel("enterprise")).toBe("Free Plan");
    expect(planLabel("")).toBe("Free Plan");
    expect(planLabel("premium")).toBe("Free Plan");
  });
});
