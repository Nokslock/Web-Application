/**
 * Tests for app/api/stripe/webhook/route.ts — Stripe Webhook Handler
 *
 * Verifies signature validation, subscription activation, renewal payment
 * recording, cancellation sync, and that the endpoint always acks with 200.
 */

process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_123";
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";

// --- Mock the Stripe client (signature verification + subscription retrieval) ---
const mockConstructEvent = jest.fn();
const mockRetrieve = jest.fn();

jest.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: { constructEvent: (...args: unknown[]) => mockConstructEvent(...args) },
    subscriptions: { retrieve: (...args: unknown[]) => mockRetrieve(...args) },
  },
  planForPriceId: () => null,
  VALID_PLANS: ["monthly", "6month", "yearly"],
}));

// --- Mock Supabase ---
const mockUpdate = jest.fn();
const mockInsert = jest.fn();
const mockEq = jest.fn();

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn((table: string) => {
      if (table === "profiles") {
        return {
          update: mockUpdate.mockReturnValue({
            eq: mockEq.mockResolvedValue({ error: null }),
          }),
        };
      }
      if (table === "payment_history") {
        return { insert: mockInsert.mockResolvedValue({ error: null }) };
      }
      return {};
    }),
  })),
}));

import { POST } from "@/app/api/stripe/webhook/route";

const NOW = Math.floor(Date.now() / 1000);

function makeSubscription(overrides: Record<string, any> = {}) {
  return {
    id: "sub_123",
    status: "active",
    start_date: NOW,
    current_period_end: NOW + 30 * 24 * 60 * 60,
    cancel_at_period_end: false,
    customer: "cus_123",
    metadata: { userId: "user-123", plan: "monthly" },
    items: { data: [{ price: { id: "price_monthly" } }] },
    ...overrides,
  };
}

function makeRequest(rawBody = "{}") {
  return {
    text: async () => rawBody,
    headers: { get: () => "sig_123" },
  } as any;
}

beforeEach(() => {
  jest.clearAllMocks();
});

// =============================================================================
// 1. SIGNATURE VALIDATION
// =============================================================================

describe("Stripe Webhook - Signature Validation", () => {
  it("rejects requests with an invalid signature", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("No signatures found matching the expected signature");
    });

    const res = await POST(makeRequest());
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe("Invalid signature");
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

// =============================================================================
// 2. CHECKOUT COMPLETION (activation)
// =============================================================================

describe("Stripe Webhook - checkout.session.completed", () => {
  it("activates the subscription on the user profile", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          mode: "subscription",
          subscription: "sub_123",
          metadata: { userId: "user-123", plan: "monthly" },
        },
      },
    });
    mockRetrieve.mockResolvedValue(makeSubscription());

    const res = await POST(makeRequest());
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.received).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        plan: "monthly",
        stripe_subscription_id: "sub_123",
        plan_reference: "sub_123",
        plan_cancelled: false,
      })
    );
    expect(mockEq).toHaveBeenCalledWith("id", "user-123");
  });

  it("ignores non-subscription checkout sessions", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: { object: { mode: "payment", subscription: null } },
    });

    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

// =============================================================================
// 3. INVOICE PAID (activation + payment history)
// =============================================================================

describe("Stripe Webhook - invoice.paid", () => {
  it("records a payment and refreshes the plan expiry", async () => {
    mockConstructEvent.mockReturnValue({
      type: "invoice.paid",
      data: {
        object: {
          id: "in_123",
          amount_paid: 500,
          currency: "usd",
          subscription: "sub_123",
        },
      },
    });
    mockRetrieve.mockResolvedValue(makeSubscription());

    const res = await POST(makeRequest());
    expect(res.status).toBe(200);

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ plan: "monthly" })
    );
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-123",
        reference: "in_123",
        plan: "monthly",
        amount: 500,
        currency: "USD",
      })
    );
  });
});

// =============================================================================
// 4. SUBSCRIPTION UPDATED (cancel-at-period-end sync)
// =============================================================================

describe("Stripe Webhook - customer.subscription.updated", () => {
  it("flags plan_cancelled when cancel_at_period_end is set", async () => {
    mockConstructEvent.mockReturnValue({
      type: "customer.subscription.updated",
      data: { object: makeSubscription({ cancel_at_period_end: true }) },
    });

    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ plan_cancelled: true })
    );
  });

  it("reverts to free when the subscription is canceled", async () => {
    mockConstructEvent.mockReturnValue({
      type: "customer.subscription.updated",
      data: { object: makeSubscription({ status: "canceled" }) },
    });

    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ plan: "free", stripe_subscription_id: null })
    );
  });
});

// =============================================================================
// 5. SUBSCRIPTION DELETED (revert to free)
// =============================================================================

describe("Stripe Webhook - customer.subscription.deleted", () => {
  it("reverts the user to the free plan", async () => {
    mockConstructEvent.mockReturnValue({
      type: "customer.subscription.deleted",
      data: { object: makeSubscription({ status: "canceled" }) },
    });

    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ plan: "free" })
    );
  });
});

// =============================================================================
// 6. RESILIENCE
// =============================================================================

describe("Stripe Webhook - Resilience", () => {
  it("ignores unrelated events", async () => {
    mockConstructEvent.mockReturnValue({
      type: "payment_intent.created",
      data: { object: {} },
    });

    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("still returns 200 when the profile update fails", async () => {
    mockConstructEvent.mockReturnValue({
      type: "customer.subscription.deleted",
      data: { object: makeSubscription({ status: "canceled" }) },
    });
    mockEq.mockResolvedValueOnce({ error: { message: "DB down" } });

    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
  });
});
