# Security Audit: Standalone Vaults Feature

## Audit Scope

Traced all code paths for vault creation, locking/unlocking, data fetching, and encryption across 8 files.

---

## 1. Data Fetching & Leakage

> [!CAUTION]
> **All vault items are fetched from Supabase regardless of lock state.** The "hidden" contents are only hidden via client-side JavaScript filtering — the data is fully present in the server response and browser memory.

### Main Dashboard ([dashboard/page.tsx](file:///Users/dwayne/Documents/dev/Web-Application/app/dashboard/page.tsx#L19-L54))

The server component fetches **every** `vault_item` for the user on page load, including items inside locked vaults:

```typescript
// Line 19-22: Fetches ALL items — no vault_id or is_locked filter
const { data: items } = await supabase
  .from("vault_items")
  .select("id, type, name, ciphertext, created_at, share_with_nok, vault_id, is_locked")
```

Then filters client-side at lines 49-54:

```typescript
// Items inside locked vaults are removed from the JS array — NOT from the network response
const visibleItems = (items || []).filter((item: any) => {
  if (item.vault_id && lockedVaultIds.has(item.vault_id)) return false;
  return true;
});
```

**Impact:** An attacker with browser DevTools can see all items (including ciphertext) in the Next.js server component payload.

### Vault Detail Page ([vault/\[id\]/page.tsx](file:///Users/dwayne/Documents/dev/Web-Application/app/dashboard/vault/%5Bid%5D/page.tsx#L29-L36))

Even more explicit — the comment at line 31 acknowledges the issue:

```typescript
// Note: We are fetching ciphertext here... the client "Gatekeeper" UI 
// prevents viewing them until unlocked.
const { data: items } = await supabase
  .from("vault_items")
  .select("*")
  .eq("vault_id", id)
```

**All items (with ciphertext) are passed as props to the client component regardless of lock state.**

---

## 2. The Lock Mechanism

> [!CAUTION]
> **The lock is a purely cosmetic, client-side string comparison.** The `lock_code` is stored in **plaintext** in the database and sent to the browser.

### Lock Storage ([CreateVaultModal.tsx](file:///Users/dwayne/Documents/dev/Web-Application/components/vault/CreateVaultModal.tsx#L41-L48))

When creating a vault, the lock code is written directly to the `vaults` table:

```typescript
const { error } = await supabase.from("vaults").insert({
  lock_code: isLocked ? lockCode : null,  // Plaintext in DB
});
```

### Lock Verification ([VaultDetailClient.tsx](file:///Users/dwayne/Documents/dev/Web-Application/components/vault/VaultDetailClient.tsx#L26-L35))

The "unlock" is a simple React state toggle based on a string comparison:

```typescript
const handleUnlock = (e: React.FormEvent) => {
  if (pin === vault.lock_code) {  // vault.lock_code is sent from server in props
    setIsUnlocked(true);          // Just flips a boolean — no crypto involved
  }
};
```

**This is NOT a `signInWithPassword()` check.** It's even simpler than that — it's a direct string equality check in the browser against a plaintext value that was already sent to the client in the page props.

### Settings Exposure ([VaultSettingsModal.tsx](file:///Users/dwayne/Documents/dev/Web-Application/components/vault/VaultSettingsModal.tsx#L20))

The settings modal pre-populates the lock code input field, making it visible to the user in the DOM:

```typescript
const [lockCode, setLockCode] = useState(vault.lock_code || "");
```

---

## 3. Cryptographic Layer

> [!IMPORTANT]
> Items inside standalone vaults use the **same encryption** as all other vault items. There is no additional crypto layer for the standalone vault feature itself.

- Vault items are encrypted with `encryptData(data, vaultKey)` via [DashboardFab.tsx](file:///Users/dwayne/Documents/dev/Web-Application/components/DashboardFab.tsx), which passes the shared Vault Key.
- Decryption uses `decryptData(ciphertext, vaultKey)` via [ItemDetailModal.tsx](file:///Users/dwayne/Documents/dev/Web-Application/components/dashboard/ItemDetailModal.tsx).
- The `vaults` table itself stores no encrypted data — only metadata (`name`, `description`, `is_locked`, `lock_code`).
- The `lock_code` is a **UI convenience feature**, not a cryptographic mechanism. It does not participate in key derivation or wrapping.

---

## 4. Integration with Zero-Knowledge Architecture

### Database Structure

The relationship is straightforward:

```
vaults (id, user_id, name, is_locked, lock_code, ...)
  └── vault_items (id, vault_id, ciphertext, ...)  — foreign key
```

Items inside a standalone vault use the same `vault_items` table as loose items, differentiated only by a non-null `vault_id`.

### Recommendation: Shared Vault Key

> [!TIP]
> **Standalone vaults should share the primary Vault Key.** Separate per-vault keys are unnecessary and would create significant complexity with no security benefit.

**Rationale:**
- The standalone vault "lock" is an **organizational/privacy UI feature**, not a security boundary. It's analogous to a folder with a PIN — the data inside is already encrypted at rest by the Vault Key.
- Since the ciphertext is already encrypted with AES-GCM under the user's Vault Key, the data is cryptographically secure even if the vault lock is bypassed.
- Per-vault keys would require separate key derivation, separate wrapping, and would make the upcoming Next of Kin feature vastly more complex.

**What DOES need fixing:**
1. **Remove `lock_code` from the database** and the `select("*")` queries that expose it.
2. **Stop over-fetching** — don't send locked vault items to the client until the vault is unlocked.
3. **Replace the plaintext PIN** with a server-side check (e.g., Supabase `signInWithPassword()` re-auth) or remove the lock entirely and rely on the master vault lock, since the data is already encrypted.

---

## Summary of Findings

| # | Finding | Severity | File |
|---|---------|----------|------|
| 1 | All vault items fetched regardless of lock state | 🔴 Critical | `dashboard/page.tsx`, `vault/[id]/page.tsx` |
| 2 | `lock_code` stored in plaintext in DB | 🔴 Critical | `CreateVaultModal.tsx`, `VaultSettingsModal.tsx` |
| 3 | Lock is client-side string comparison | 🔴 Critical | `VaultDetailClient.tsx` |
| 4 | Lock code sent to browser in page props | 🔴 Critical | `vault/[id]/page.tsx` → `VaultDetailClient` |
| 5 | Settings modal exposes lock code in DOM | 🟡 Medium | `VaultSettingsModal.tsx` |
| 6 | No additional crypto layer for vault lock | ℹ️ Info | By design — acceptable if lock is cosmetic |
