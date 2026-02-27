"use server";

import bcrypt from "bcryptjs";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

// ── Create Vault ──────────────────────────────────────────────
export async function createVault(formData: {
    name: string;
    description: string;
    isLocked: boolean;
    lockCode: string;
    shareWithNok: boolean;
}) {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    let hashedCode: string | null = null;
    if (formData.isLocked && formData.lockCode) {
        hashedCode = await bcrypt.hash(formData.lockCode, 10);
    }

    const { data, error } = await (supabase.from("vaults") as any).insert({
        user_id: user.id,
        name: formData.name,
        description: formData.description,
        is_locked: formData.isLocked,
        lock_code: hashedCode,
        share_with_nok: formData.shareWithNok,
    }).select("id").single();

    if (error) return { success: false, error: error.message };
    return { success: true, vaultId: data.id };
}

// ── Update Vault Settings ─────────────────────────────────────
export async function updateVaultSettings(formData: {
    vaultId: string;
    name: string;
    description: string;
    isLocked: boolean;
    lockCode: string; // new code (empty string = no change)
    shareWithNok: boolean;
    previousShareWithNok: boolean; // to detect NOK revoke
}) {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // Build the update payload
    const updatePayload: Record<string, any> = {
        name: formData.name,
        description: formData.description,
        is_locked: formData.isLocked,
        share_with_nok: formData.shareWithNok,
    };

    // Only update lock_code if a new one was provided
    if (formData.isLocked && formData.lockCode) {
        updatePayload.lock_code = await bcrypt.hash(formData.lockCode, 10);
    } else if (!formData.isLocked) {
        updatePayload.lock_code = null;
    }
    // If isLocked is true but lockCode is empty, we keep the existing hash (no change)

    const { error } = await (supabase.from("vaults") as any)
        .update(updatePayload)
        .eq("id", formData.vaultId)
        .eq("user_id", user.id); // scope to owner

    if (error) return { success: false, error: error.message };

    // Handle NOK revoke: unshare all items in this vault
    if (formData.previousShareWithNok && !formData.shareWithNok) {
        const { error: itemsError } = await (supabase.from("vault_items") as any)
            .update({ share_with_nok: false })
            .eq("vault_id", formData.vaultId);

        if (itemsError) {
            console.error("Failed to revoke items NOK status", itemsError);
            return { success: true, nokRevokeFailed: true };
        }
    }

    return { success: true };
}

// ── Verify Vault PIN & Return Items ───────────────────────────
export async function verifyVaultPin(vaultId: string, pin: string) {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // 1. Fetch the hashed lock_code (server-only — never sent to client)
    const { data: vault, error: vaultError } = await supabase
        .from("vaults")
        .select("lock_code")
        .eq("id", vaultId)
        .eq("user_id", user.id)
        .single();

    if (vaultError || !vault) {
        return { success: false, error: "Vault not found" };
    }

    if (!vault.lock_code) {
        return { success: false, error: "Vault has no lock code" };
    }

    // 2. Compare with bcrypt
    const isMatch = await bcrypt.compare(pin, vault.lock_code);
    if (!isMatch) {
        return { success: false, error: "Incorrect PIN" };
    }

    // 3. PIN correct — fetch and return items
    const { data: items, error: itemsError } = await supabase
        .from("vault_items")
        .select("id, type, name, ciphertext, created_at, share_with_nok, vault_id, is_locked")
        .eq("vault_id", vaultId)
        .order("created_at", { ascending: false });

    if (itemsError) {
        return { success: false, error: "Failed to fetch items" };
    }

    return { success: true, items: items || [] };
}
