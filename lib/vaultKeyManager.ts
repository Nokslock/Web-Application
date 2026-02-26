// =============================================================================
// lib/vaultKeyManager.ts — Session-Scoped Vault Key Manager
//
// Manages the in-memory lifecycle of the unwrapped Vault Key.
// The raw Vault Key never leaves the browser's memory and is never persisted.
// =============================================================================

"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import {
    generateUserSalt,
    deriveMasterKey,
    generateVaultKey,
    wrapVaultKey,
    unwrapVaultKey,
} from "@/lib/crypto";

// In-memory store — cleared on page refresh or explicit logout
let vaultKey: CryptoKey | null = null;

// =============================================================================
// REGISTRATION: Initialize keys for a brand-new user
// =============================================================================

/**
 * Called during registration after `supabase.auth.signUp()` succeeds.
 *
 * 1. Generate a unique salt
 * 2. Derive the Master Key from (password + salt)
 * 3. Generate a random Vault Key
 * 4. Wrap the Vault Key with the Master Key
 * 5. Persist { user_salt, encrypted_vault_key } to Supabase
 * 6. Store the raw Vault Key in memory
 */
export async function initializeVaultKey(
    password: string,
    userId: string,
): Promise<void> {
    const supabase = getSupabaseBrowserClient();

    // Step 1: Generate salt
    const saltBase64 = generateUserSalt();

    // Step 2: Derive Master Key
    const masterKey = await deriveMasterKey(password, saltBase64);

    // Step 3: Generate Vault Key
    const newVaultKey = await generateVaultKey();

    // Step 4: Wrap Vault Key
    const encryptedVaultKey = await wrapVaultKey(newVaultKey, masterKey);

    // Step 5: Persist to Supabase
    const { error } = await (supabase.from("user_encryption_keys") as any).insert(
        {
            user_id: userId,
            user_salt: saltBase64,
            encrypted_vault_key: encryptedVaultKey,
        },
    );

    if (error) {
        throw new Error(`Failed to save encryption keys: ${error.message}`);
    }

    // Step 6: Store in memory
    vaultKey = newVaultKey;
}

// =============================================================================
// LOGIN: Unlock the vault for a returning user
// =============================================================================

/**
 * Called during login after `supabase.auth.signInWithPassword()` succeeds.
 *
 * 1. Fetch { user_salt, encrypted_vault_key } from Supabase
 * 2. Derive the Master Key from (password + salt)
 * 3. Unwrap the Vault Key
 * 4. Store the raw Vault Key in memory
 */
export async function unlockVault(
    password: string,
    userId: string,
): Promise<void> {
    const supabase = getSupabaseBrowserClient();

    // Step 1: Fetch key material
    const { data, error } = await (
        supabase.from("user_encryption_keys") as any
    )
        .select("user_salt, encrypted_vault_key")
        .eq("user_id", userId)
        .single();

    if (error || !data) {
        throw new Error(
            "Encryption keys not found. This account may not have vault encryption set up.",
        );
    }

    // Step 2: Derive Master Key
    const masterKey = await deriveMasterKey(password, data.user_salt);

    // Step 3: Unwrap Vault Key
    try {
        vaultKey = await unwrapVaultKey(data.encrypted_vault_key, masterKey);
    } catch {
        throw new Error(
            "Failed to unlock vault. The password may be incorrect or the key data is corrupted.",
        );
    }
}

// =============================================================================
// ACCESSORS
// =============================================================================

/**
 * Get the in-memory Vault Key. Throws if the vault has not been unlocked.
 *
 * Components call this before encrypting/decrypting data.
 */
export function getVaultKey(): CryptoKey {
    if (!vaultKey) {
        throw new Error(
            "Vault is locked. Please log in again to unlock your vault.",
        );
    }
    return vaultKey;
}

/**
 * Check if the Vault Key is currently in memory (non-throwing).
 * Used by the dashboard to decide whether to show the vault-locked overlay.
 */
export function isVaultUnlocked(): boolean {
    return vaultKey !== null;
}

/**
 * Clear the in-memory Vault Key. Called on logout or session timeout.
 */
export function clearVaultKey(): void {
    vaultKey = null;
}
