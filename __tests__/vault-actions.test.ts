/**
 * Tests for lib/vault-actions.ts — Vault CRUD Server Actions
 *
 * These tests mock Supabase to verify the vault logic works correctly
 * without hitting a real database.
 */

// --- Mock Supabase before importing the module ---
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockOrder = jest.fn();
const mockGetUser = jest.fn();

// Build chainable query mock
function createChainableMock(terminal?: { data?: any; error?: any }) {
  const chain: any = {};
  chain.insert = jest.fn().mockReturnValue(chain);
  chain.update = jest.fn().mockReturnValue(chain);
  chain.select = jest.fn().mockReturnValue(chain);
  chain.eq = jest.fn().mockReturnValue(chain);
  chain.single = jest.fn().mockResolvedValue(terminal ?? { data: null, error: null });
  chain.order = jest.fn().mockResolvedValue(terminal ?? { data: [], error: null });
  return chain;
}

let vaultChain: any;
let vaultItemsChain: any;

jest.mock("@/lib/supabase/server-client", () => ({
  createSupabaseServerClient: jest.fn().mockImplementation(async () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: jest.fn((table: string) => {
      if (table === "vaults") return vaultChain;
      if (table === "vault_items") return vaultItemsChain;
      return createChainableMock();
    }),
  })),
}));

// Mock bcryptjs
jest.mock("bcryptjs", () => ({
  hash: jest.fn(async (value: string) => `hashed_${value}`),
  compare: jest.fn(async (plain: string, hash: string) => hash === `hashed_${plain}`),
}));

import { createVault, updateVaultSettings, verifyVaultPin } from "@/lib/vault-actions";

// =============================================================================
// 1. CREATE VAULT
// =============================================================================

describe("createVault", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    vaultChain = createChainableMock();
    vaultItemsChain = createChainableMock();
  });

  it("creates a vault successfully for authenticated user", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    // Make insert → select → single return vault ID
    vaultChain.insert.mockReturnValue(vaultChain);
    vaultChain.select.mockReturnValue(vaultChain);
    vaultChain.single.mockResolvedValue({
      data: { id: "vault-456" },
      error: null,
    });

    const result = await createVault({
      name: "My Vault",
      description: "Test vault",
      isLocked: false,
      lockCode: "",
      shareWithNok: false,
    });

    expect(result).toEqual({ success: true, vaultId: "vault-456" });
    expect(vaultChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-123",
        name: "My Vault",
        description: "Test vault",
        is_locked: false,
        lock_code: null,
        share_with_nok: false,
      })
    );
  });

  it("hashes the lock code when vault is locked", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    vaultChain.insert.mockReturnValue(vaultChain);
    vaultChain.select.mockReturnValue(vaultChain);
    vaultChain.single.mockResolvedValue({
      data: { id: "vault-789" },
      error: null,
    });

    const result = await createVault({
      name: "Locked Vault",
      description: "",
      isLocked: true,
      lockCode: "1234",
      shareWithNok: false,
    });

    expect(result.success).toBe(true);
    // Verify bcrypt.hash was called
    expect(vaultChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        is_locked: true,
        lock_code: "hashed_1234",
      })
    );
  });

  it("returns error when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
    });

    const result = await createVault({
      name: "Test",
      description: "",
      isLocked: false,
      lockCode: "",
      shareWithNok: false,
    });

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns error when database insert fails", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    vaultChain.insert.mockReturnValue(vaultChain);
    vaultChain.select.mockReturnValue(vaultChain);
    vaultChain.single.mockResolvedValue({
      data: null,
      error: { message: "Database error" },
    });

    const result = await createVault({
      name: "Test",
      description: "",
      isLocked: false,
      lockCode: "",
      shareWithNok: false,
    });

    expect(result).toEqual({ success: false, error: "Database error" });
  });
});

// =============================================================================
// 2. UPDATE VAULT SETTINGS
// =============================================================================

describe("updateVaultSettings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    vaultChain = createChainableMock();
    vaultItemsChain = createChainableMock();
  });

  it("updates vault settings successfully", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    vaultChain.update.mockReturnValue(vaultChain);
    vaultChain.eq.mockReturnValue(vaultChain);
    // The second .eq() resolves the promise
    vaultChain.eq.mockReturnValueOnce(vaultChain).mockResolvedValueOnce({
      error: null,
    });

    const result = await updateVaultSettings({
      vaultId: "vault-456",
      name: "Updated Name",
      description: "Updated desc",
      isLocked: false,
      lockCode: "",
      shareWithNok: false,
      previousShareWithNok: false,
    });

    expect(result).toEqual({ success: true });
  });

  it("returns error when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
    });

    const result = await updateVaultSettings({
      vaultId: "vault-456",
      name: "Test",
      description: "",
      isLocked: false,
      lockCode: "",
      shareWithNok: false,
      previousShareWithNok: false,
    });

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("revokes NOK sharing on all items when shareWithNok toggled off", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    // Vault update succeeds
    vaultChain.update.mockReturnValue(vaultChain);
    vaultChain.eq.mockReturnValue(vaultChain);
    vaultChain.eq.mockReturnValueOnce(vaultChain).mockResolvedValueOnce({
      error: null,
    });

    // vault_items update for NOK revoke
    vaultItemsChain.update.mockReturnValue(vaultItemsChain);
    vaultItemsChain.eq.mockResolvedValue({ error: null });

    const result = await updateVaultSettings({
      vaultId: "vault-456",
      name: "My Vault",
      description: "",
      isLocked: false,
      lockCode: "",
      shareWithNok: false,
      previousShareWithNok: true, // was true, now false → revoke
    });

    expect(result).toEqual({ success: true });
  });

  it("returns nokRevokeFailed when vault updates but NOK item revoke fails", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    vaultChain.update.mockReturnValue(vaultChain);
    vaultChain.eq.mockReturnValue(vaultChain);
    vaultChain.eq.mockReturnValueOnce(vaultChain).mockResolvedValueOnce({
      error: null,
    });

    vaultItemsChain.update.mockReturnValue(vaultItemsChain);
    vaultItemsChain.eq.mockResolvedValue({ error: { message: "Items update failed" } });

    const result = await updateVaultSettings({
      vaultId: "vault-456",
      name: "My Vault",
      description: "",
      isLocked: false,
      lockCode: "",
      shareWithNok: false,
      previousShareWithNok: true,
    });

    expect(result).toEqual({ success: true, nokRevokeFailed: true });
  });

  it("returns error when vault update itself fails", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    vaultChain.update.mockReturnValue(vaultChain);
    vaultChain.eq.mockReturnValue(vaultChain);
    vaultChain.eq.mockReturnValueOnce(vaultChain).mockResolvedValueOnce({
      error: { message: "Update failed" },
    });

    const result = await updateVaultSettings({
      vaultId: "vault-456",
      name: "Test",
      description: "",
      isLocked: false,
      lockCode: "",
      shareWithNok: false,
      previousShareWithNok: false,
    });

    expect(result).toEqual({ success: false, error: "Update failed" });
  });

  it("clears lock_code when isLocked is set to false", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    vaultChain.update.mockReturnValue(vaultChain);
    vaultChain.eq.mockReturnValue(vaultChain);
    vaultChain.eq.mockReturnValueOnce(vaultChain).mockResolvedValueOnce({
      error: null,
    });

    await updateVaultSettings({
      vaultId: "vault-456",
      name: "Unlocked Vault",
      description: "",
      isLocked: false,
      lockCode: "",
      shareWithNok: false,
      previousShareWithNok: false,
    });

    expect(vaultChain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        is_locked: false,
        lock_code: null,
      })
    );
  });

  it("keeps existing lock_code when isLocked is true but lockCode is empty", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    vaultChain.update.mockReturnValue(vaultChain);
    vaultChain.eq.mockReturnValue(vaultChain);
    vaultChain.eq.mockReturnValueOnce(vaultChain).mockResolvedValueOnce({
      error: null,
    });

    await updateVaultSettings({
      vaultId: "vault-456",
      name: "Still Locked",
      description: "",
      isLocked: true,
      lockCode: "",  // empty = keep existing
      shareWithNok: false,
      previousShareWithNok: false,
    });

    const updateArg = vaultChain.update.mock.calls[0][0];
    expect(updateArg).not.toHaveProperty("lock_code");
    expect(updateArg.is_locked).toBe(true);
  });
});

// =============================================================================
// 3. VERIFY VAULT PIN
// =============================================================================

describe("verifyVaultPin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    vaultChain = createChainableMock();
    vaultItemsChain = createChainableMock();
  });

  it("returns error when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
    });

    const result = await verifyVaultPin("vault-123", "1234");

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns error when vault is not found", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    vaultChain.select.mockReturnValue(vaultChain);
    vaultChain.eq.mockReturnValue(vaultChain);
    vaultChain.single.mockResolvedValue({
      data: null,
      error: { message: "Not found" },
    });

    const result = await verifyVaultPin("vault-999", "1234");

    expect(result).toEqual({ success: false, error: "Vault not found" });
  });

  it("returns error when vault has no lock code", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    vaultChain.select.mockReturnValue(vaultChain);
    vaultChain.eq.mockReturnValue(vaultChain);
    vaultChain.single.mockResolvedValue({
      data: { lock_code: null },
      error: null,
    });

    const result = await verifyVaultPin("vault-123", "1234");

    expect(result).toEqual({ success: false, error: "Vault has no lock code" });
  });

  it("returns error for incorrect PIN", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    vaultChain.select.mockReturnValue(vaultChain);
    vaultChain.eq.mockReturnValue(vaultChain);
    vaultChain.single.mockResolvedValue({
      data: { lock_code: "hashed_5678" },
      error: null,
    });

    const result = await verifyVaultPin("vault-123", "wrong-pin");

    expect(result).toEqual({ success: false, error: "Incorrect PIN" });
  });

  it("returns items on correct PIN", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    // Vault fetch returns hashed code
    vaultChain.select.mockReturnValue(vaultChain);
    vaultChain.eq.mockReturnValue(vaultChain);
    vaultChain.single.mockResolvedValue({
      data: { lock_code: "hashed_1234" },
      error: null,
    });

    // Items fetch returns items
    const mockItems = [
      { id: "item-1", type: "login", name: "Gmail", ciphertext: "enc...", created_at: "2024-01-01", share_with_nok: false, vault_id: "vault-123", is_locked: true },
    ];
    vaultItemsChain.select.mockReturnValue(vaultItemsChain);
    vaultItemsChain.eq.mockReturnValue(vaultItemsChain);
    vaultItemsChain.order.mockResolvedValue({ data: mockItems, error: null });

    const result = await verifyVaultPin("vault-123", "1234");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.items).toEqual(mockItems);
    }
  });

  it("returns empty array when items query returns null", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    vaultChain.select.mockReturnValue(vaultChain);
    vaultChain.eq.mockReturnValue(vaultChain);
    vaultChain.single.mockResolvedValue({
      data: { lock_code: "hashed_1234" },
      error: null,
    });

    vaultItemsChain.select.mockReturnValue(vaultItemsChain);
    vaultItemsChain.eq.mockReturnValue(vaultItemsChain);
    vaultItemsChain.order.mockResolvedValue({ data: null, error: null });

    const result = await verifyVaultPin("vault-123", "1234");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.items).toEqual([]);
    }
  });

  it("returns error when items fetch fails after PIN verification", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    vaultChain.select.mockReturnValue(vaultChain);
    vaultChain.eq.mockReturnValue(vaultChain);
    vaultChain.single.mockResolvedValue({
      data: { lock_code: "hashed_1234" },
      error: null,
    });

    vaultItemsChain.select.mockReturnValue(vaultItemsChain);
    vaultItemsChain.eq.mockReturnValue(vaultItemsChain);
    vaultItemsChain.order.mockResolvedValue({ data: null, error: { message: "Query failed" } });

    const result = await verifyVaultPin("vault-123", "1234");

    expect(result).toEqual({ success: false, error: "Failed to fetch items" });
  });
});
