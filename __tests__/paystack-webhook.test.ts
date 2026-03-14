/**
 * Tests for app/api/paystack/webhook/route.ts — Paystack Webhook Handler
 *
 * Verifies HMAC signature validation, plan upgrade logic, and payment history.
 */

import crypto from "crypto";

// --- Mock environment ---
const MOCK_SECRET = "pk_test_secret_key_123";
process.env.PAYSTACK_SECRET_KEY = MOCK_SECRET;
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";

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
        return {
          insert: mockInsert.mockResolvedValue({ error: null }),
        };
      }
      return {};
    }),
  })),
}));

// Helper: create a valid Paystack webhook request
function createWebhookRequest(body: object, secret: string = MOCK_SECRET) {
  const rawBody = JSON.stringify(body);
  const signature = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");

  return {
    text: async () => rawBody,
    headers: {
      get: (name: string) => {
        if (name === "x-paystack-signature") return signature;
        return null;
      },
    },
  } as any;
}

// Import after mocks are set up
import { POST } from "@/app/api/paystack/webhook/route";

// =============================================================================
// 1. SIGNATURE VALIDATION
// =============================================================================

describe("Paystack Webhook - Signature Validation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects requests with invalid signature", async () => {
    const body = { event: "charge.success", data: {} };
    const rawBody = JSON.stringify(body);

    const req = {
      text: async () => rawBody,
      headers: {
        get: (name: string) => {
          if (name === "x-paystack-signature") return "invalid_signature";
          return null;
        },
      },
    } as any;

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe("Invalid signature");
  });

  it("rejects requests with missing signature header", async () => {
    const body = { event: "charge.success", data: {} };
    const rawBody = JSON.stringify(body);

    const req = {
      text: async () => rawBody,
      headers: {
        get: () => null, // no signature at all
      },
    } as any;

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe("Invalid signature");
  });

  it("accepts requests with valid signature", async () => {
    const body = { event: "some.other.event", data: {} };
    const req = createWebhookRequest(body);

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.received).toBe(true);
  });
});

// =============================================================================
// 2. CHARGE SUCCESS HANDLING
// =============================================================================

describe("Paystack Webhook - charge.success", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updates user plan on successful monthly payment", async () => {
    const body = {
      event: "charge.success",
      data: {
        status: "success",
        reference: "ref_123",
        amount: 500000,
        currency: "NGN",
        metadata: {
          plan: "monthly",
          userId: "user-123",
        },
      },
    };

    const req = createWebhookRequest(body);
    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.received).toBe(true);

    // Verify profile was updated with correct plan
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        plan: "monthly",
        plan_reference: "ref_123",
      })
    );

    // Verify payment history was inserted
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-123",
        reference: "ref_123",
        plan: "monthly",
        amount: 500000,
        currency: "NGN",
      })
    );
  });

  it("handles yearly plan correctly", async () => {
    const body = {
      event: "charge.success",
      data: {
        status: "success",
        reference: "ref_yearly",
        amount: 5000000,
        currency: "NGN",
        metadata: {
          plan: "yearly",
          userId: "user-456",
        },
      },
    };

    const req = createWebhookRequest(body);
    await POST(req);

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ plan: "yearly" })
    );
  });

  it("handles 6month plan correctly", async () => {
    const body = {
      event: "charge.success",
      data: {
        status: "success",
        reference: "ref_6m",
        amount: 2500000,
        currency: "NGN",
        metadata: {
          plan: "6month",
          userId: "user-789",
        },
      },
    };

    const req = createWebhookRequest(body);
    await POST(req);

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ plan: "6month" })
    );
  });

  it("ignores charge.success with invalid plan type", async () => {
    const body = {
      event: "charge.success",
      data: {
        status: "success",
        reference: "ref_bad",
        metadata: {
          plan: "enterprise", // not a valid plan
          userId: "user-123",
        },
      },
    };

    const req = createWebhookRequest(body);
    const response = await POST(req);

    expect(response.status).toBe(200);
    // Should NOT update the profile
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("ignores charge.success with failed status", async () => {
    const body = {
      event: "charge.success",
      data: {
        status: "failed",
        reference: "ref_fail",
        metadata: {
          plan: "monthly",
          userId: "user-123",
        },
      },
    };

    const req = createWebhookRequest(body);
    await POST(req);

    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("ignores non-charge events", async () => {
    const body = {
      event: "transfer.success",
      data: { status: "success" },
    };

    const req = createWebhookRequest(body);
    const response = await POST(req);

    expect(response.status).toBe(200);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("ignores charge.success when metadata is missing", async () => {
    const body = {
      event: "charge.success",
      data: {
        status: "success",
        reference: "ref_no_meta",
      },
    };

    const req = createWebhookRequest(body);
    const response = await POST(req);

    expect(response.status).toBe(200);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("ignores charge.success when metadata.plan is missing", async () => {
    const body = {
      event: "charge.success",
      data: {
        status: "success",
        reference: "ref_no_plan",
        metadata: {
          userId: "user-123",
        },
      },
    };

    const req = createWebhookRequest(body);
    const response = await POST(req);

    expect(response.status).toBe(200);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("still returns 200 when profile update fails (webhook must always ack)", async () => {
    mockEq.mockResolvedValueOnce({ error: { message: "Profile update failed" } });

    const body = {
      event: "charge.success",
      data: {
        status: "success",
        reference: "ref_err",
        amount: 500000,
        currency: "NGN",
        metadata: {
          plan: "monthly",
          userId: "user-123",
        },
      },
    };

    const req = createWebhookRequest(body);
    const response = await POST(req);

    // Webhook should ALWAYS return 200 to prevent Paystack retries
    expect(response.status).toBe(200);
  });

  it("still returns 200 when payment history insert fails", async () => {
    mockInsert.mockResolvedValueOnce({ error: { message: "Insert failed" } });

    const body = {
      event: "charge.success",
      data: {
        status: "success",
        reference: "ref_hist_err",
        amount: 500000,
        currency: "NGN",
        metadata: {
          plan: "monthly",
          userId: "user-123",
        },
      },
    };

    const req = createWebhookRequest(body);
    const response = await POST(req);

    expect(response.status).toBe(200);
  });
});
