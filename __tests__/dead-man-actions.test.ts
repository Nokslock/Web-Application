/**
 * Tests for lib/dead-man-actions.ts — Dead Man's Switch Server Actions
 *
 * Tests the setup flow and claim portal logic with mocked Supabase + crypto.
 */

// --- Mock environment ---
process.env.SERVER_ESCROW_KEY = "a".repeat(64); // 32 bytes hex
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";

// --- Mock Supabase server client ---
const mockGetUser = jest.fn();
const mockUpsert = jest.fn();

function createServerChainMock() {
  const chain: any = {};
  chain.upsert = mockUpsert;
  chain.select = jest.fn().mockReturnValue(chain);
  chain.eq = jest.fn().mockReturnValue(chain);
  chain.ilike = jest.fn().mockReturnValue(chain);
  chain.single = jest.fn().mockResolvedValue({ data: null, error: null });
  return chain;
}

jest.mock("@/lib/supabase/server-client", () => ({
  createSupabaseServerClient: jest.fn().mockImplementation(async () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: jest.fn(() => createServerChainMock()),
  })),
}));

// --- Mock Supabase admin client ---
const mockAdminFrom = jest.fn();

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    from: mockAdminFrom,
  })),
}));

import {
  setupDeadManSwitch,
  fetchTriggeredVault,
  type SetupDeadManSwitchPayload,
} from "@/lib/dead-man-actions";

// =============================================================================
// 1. SETUP DEAD MAN'S SWITCH
// =============================================================================

describe("setupDeadManSwitch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns error when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
    });

    const result = await setupDeadManSwitch({
      nokEmail: "nok@example.com",
      emergencyKey: "word ".repeat(16).trim(),
      wrappedVaultKey: "salt:iv:ciphertext",
      inactivityThresholdDays: 30,
    });

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns error when required fields are missing", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123", email: "user@test.com" } },
    });

    const result = await setupDeadManSwitch({
      nokEmail: "",
      emergencyKey: "test",
      wrappedVaultKey: "test",
      inactivityThresholdDays: 30,
    });

    expect(result).toEqual({ success: false, error: "Missing required fields" });
  });

  it("returns error when inactivity threshold is out of range", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123", email: "user@test.com" } },
    });

    const tooLow = await setupDeadManSwitch({
      nokEmail: "nok@example.com",
      emergencyKey: "word ".repeat(16).trim(),
      wrappedVaultKey: "salt:iv:ciphertext",
      inactivityThresholdDays: 0,
    });
    expect(tooLow).toEqual({ success: false, error: "Invalid inactivity threshold" });

    const tooHigh = await setupDeadManSwitch({
      nokEmail: "nok@example.com",
      emergencyKey: "word ".repeat(16).trim(),
      wrappedVaultKey: "salt:iv:ciphertext",
      inactivityThresholdDays: 400,
    });
    expect(tooHigh).toEqual({ success: false, error: "Invalid inactivity threshold" });
  });

  it("succeeds with valid payload and authenticated user", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123", email: "user@test.com" } },
    });

    mockUpsert.mockResolvedValue({ error: null });

    const payload: SetupDeadManSwitchPayload = {
      nokEmail: "nok@example.com",
      emergencyKey: "word ".repeat(16).trim(),
      wrappedVaultKey: "salt:iv:ciphertext",
      inactivityThresholdDays: 30,
    };

    const result = await setupDeadManSwitch(payload);

    expect(result).toEqual({ success: true });
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-123",
        owner_email: "user@test.com",
        status: "active",
        inactivity_threshold_days: 30,
        wrapped_vault_key: "salt:iv:ciphertext",
      }),
      { onConflict: "user_id" }
    );

    // Verify NOK email and emergency key are escrowed (encrypted, not plaintext)
    const upsertArg = mockUpsert.mock.calls[0][0];
    expect(upsertArg.nok_email_escrowed).not.toBe("nok@example.com");
    expect(upsertArg.nok_email_escrowed).toContain(":"); // iv:ciphertext format
    expect(upsertArg.emergency_key_escrowed).not.toBe(payload.emergencyKey);
    expect(upsertArg.emergency_key_escrowed).toContain(":");
  });

  it("returns error when database upsert fails", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123", email: "user@test.com" } },
    });

    mockUpsert.mockResolvedValue({
      error: { message: "DB constraint violated" },
    });

    const result = await setupDeadManSwitch({
      nokEmail: "nok@example.com",
      emergencyKey: "word ".repeat(16).trim(),
      wrappedVaultKey: "salt:iv:ciphertext",
      inactivityThresholdDays: 30,
    });

    expect(result).toEqual({ success: false, error: "DB constraint violated" });
  });

  it("returns server configuration error when SERVER_ESCROW_KEY is invalid", async () => {
    // Temporarily break the escrow key
    const originalKey = process.env.SERVER_ESCROW_KEY;
    process.env.SERVER_ESCROW_KEY = "too-short";

    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123", email: "user@test.com" } },
    });

    const result = await setupDeadManSwitch({
      nokEmail: "nok@example.com",
      emergencyKey: "word ".repeat(16).trim(),
      wrappedVaultKey: "salt:iv:ciphertext",
      inactivityThresholdDays: 30,
    });

    expect(result).toEqual({ success: false, error: "Server configuration error" });

    // Restore
    process.env.SERVER_ESCROW_KEY = originalKey;
  });

  it("returns server configuration error when SERVER_ESCROW_KEY is missing", async () => {
    const originalKey = process.env.SERVER_ESCROW_KEY;
    delete process.env.SERVER_ESCROW_KEY;

    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123", email: "user@test.com" } },
    });

    const result = await setupDeadManSwitch({
      nokEmail: "nok@example.com",
      emergencyKey: "word ".repeat(16).trim(),
      wrappedVaultKey: "salt:iv:ciphertext",
      inactivityThresholdDays: 30,
    });

    expect(result).toEqual({ success: false, error: "Server configuration error" });

    process.env.SERVER_ESCROW_KEY = originalKey;
  });
});

// =============================================================================
// 2. FETCH TRIGGERED VAULT (Claim Portal)
// =============================================================================

describe("fetchTriggeredVault", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns error for invalid email", async () => {
    const result = await fetchTriggeredVault("");
    expect(result.success).toBe(false);

    const result2 = await fetchTriggeredVault("not-an-email");
    expect(result2.success).toBe(false);
  });

  it("returns generic error when no triggered switch found", async () => {
    const switchChain: any = {};
    switchChain.select = jest.fn().mockReturnValue(switchChain);
    switchChain.eq = jest.fn().mockReturnValue(switchChain);
    switchChain.ilike = jest.fn().mockReturnValue(switchChain);
    switchChain.single = jest.fn().mockResolvedValue({
      data: null,
      error: { message: "Not found" },
    });

    mockAdminFrom.mockReturnValue(switchChain);

    const result = await fetchTriggeredVault("unknown@example.com");

    expect(result.success).toBe(false);
    if (!result.success) {
      // Should NOT reveal whether email exists (anti-enumeration)
      expect(result.error).toContain("No active inheritance claim");
    }
  });

  it("returns wrapped vault key and NOK items on valid triggered switch", async () => {
    const mockItems = [
      { id: "item-1", type: "login", name: "Gmail", ciphertext: "encrypted..." },
      { id: "item-2", type: "card", name: "Visa", ciphertext: "encrypted..." },
    ];

    // First call: dead_man_switches query
    const switchChain: any = {};
    switchChain.select = jest.fn().mockReturnValue(switchChain);
    switchChain.eq = jest.fn().mockReturnValue(switchChain);
    switchChain.ilike = jest.fn().mockReturnValue(switchChain);
    switchChain.single = jest.fn().mockResolvedValue({
      data: {
        id: "switch-1",
        user_id: "user-123",
        wrapped_vault_key: "salt:iv:encrypted_vk",
      },
      error: null,
    });

    // Second call: vault_items query
    const itemsChain: any = {};
    itemsChain.select = jest.fn().mockReturnValue(itemsChain);
    itemsChain.eq = jest.fn().mockReturnValue(itemsChain);
    // Resolve on second .eq() call
    itemsChain.eq
      .mockReturnValueOnce(itemsChain)
      .mockResolvedValueOnce({ data: mockItems, error: null });

    mockAdminFrom
      .mockReturnValueOnce(switchChain)
      .mockReturnValueOnce(itemsChain);

    const result = await fetchTriggeredVault("owner@example.com");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.switch_id).toBe("switch-1");
      expect(result.wrappedVaultKey).toBe("salt:iv:encrypted_vk");
      expect(result.items).toEqual(mockItems);
      expect(result.items).toHaveLength(2);
    }
  });

  it("returns empty items array when items query returns null", async () => {
    const switchChain: any = {};
    switchChain.select = jest.fn().mockReturnValue(switchChain);
    switchChain.eq = jest.fn().mockReturnValue(switchChain);
    switchChain.ilike = jest.fn().mockReturnValue(switchChain);
    switchChain.single = jest.fn().mockResolvedValue({
      data: {
        id: "switch-1",
        user_id: "user-123",
        wrapped_vault_key: "salt:iv:encrypted_vk",
      },
      error: null,
    });

    const itemsChain: any = {};
    itemsChain.select = jest.fn().mockReturnValue(itemsChain);
    itemsChain.eq = jest.fn().mockReturnValue(itemsChain);
    itemsChain.eq
      .mockReturnValueOnce(itemsChain)
      .mockResolvedValueOnce({ data: null, error: null });

    mockAdminFrom
      .mockReturnValueOnce(switchChain)
      .mockReturnValueOnce(itemsChain);

    const result = await fetchTriggeredVault("owner@example.com");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.items).toEqual([]);
    }
  });

  it("returns error when vault items fetch fails", async () => {
    const switchChain: any = {};
    switchChain.select = jest.fn().mockReturnValue(switchChain);
    switchChain.eq = jest.fn().mockReturnValue(switchChain);
    switchChain.ilike = jest.fn().mockReturnValue(switchChain);
    switchChain.single = jest.fn().mockResolvedValue({
      data: {
        id: "switch-1",
        user_id: "user-123",
        wrapped_vault_key: "salt:iv:encrypted_vk",
      },
      error: null,
    });

    const itemsChain: any = {};
    itemsChain.select = jest.fn().mockReturnValue(itemsChain);
    itemsChain.eq = jest.fn().mockReturnValue(itemsChain);
    itemsChain.eq
      .mockReturnValueOnce(itemsChain)
      .mockResolvedValueOnce({ data: null, error: { message: "DB error" } });

    mockAdminFrom
      .mockReturnValueOnce(switchChain)
      .mockReturnValueOnce(itemsChain);

    const result = await fetchTriggeredVault("owner@example.com");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Failed to retrieve vault data");
    }
  });

  it("returns error when admin client initialization fails", async () => {
    // Temporarily remove env vars to make createAdminClient throw
    const origUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const origKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Need to re-mock createClient to actually throw
    const { createClient } = require("@supabase/supabase-js");
    createClient.mockImplementationOnce(() => {
      throw new Error("Missing Supabase service-role credentials.");
    });

    const result = await fetchTriggeredVault("test@example.com");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Service unavailable");
    }

    process.env.NEXT_PUBLIC_SUPABASE_URL = origUrl;
    process.env.SUPABASE_SERVICE_ROLE_KEY = origKey;
  });
});
