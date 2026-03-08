"use client";

import { useState, useCallback } from "react";
import {
  FaShieldHalved,
  FaGlobe,
  FaCreditCard,
  FaWallet,
  FaFile,
  FaEye,
  FaEyeSlash,
  FaCopy,
  FaCheck,
  FaTriangleExclamation,
  FaCircleCheck,
  FaArrowRotateLeft,
  FaSpinner,
  FaLock,
  FaDownload,
} from "react-icons/fa6";
import {
  fetchTriggeredVault,
  type FetchedVaultItem,
} from "@/lib/dead-man-actions";
import { unwrapMasterVaultKey } from "@/lib/emergency-key";
import { decryptData } from "@/lib/crypto";

// ── Types ──────────────────────────────────────────────────────

type ClaimState = "idle" | "loading" | "done";
type LoadingStep = "fetching" | "deriving" | "decrypting";

interface DecryptedItem {
  id: string;
  type: string;
  name: string;
  fields: Record<string, unknown>;
}

// ── Static Config ──────────────────────────────────────────────

interface FieldDef {
  label: string;
  sensitive: boolean;
}

const FIELD_CONFIG: Record<string, Record<string, FieldDef>> = {
  password: {
    url: { label: "Website URL", sensitive: false },
    username: { label: "Username / Email", sensitive: false },
    password: { label: "Password", sensitive: true },
  },
  card: {
    cardholder: { label: "Cardholder Name", sensitive: false },
    number: { label: "Card Number", sensitive: true },
    expiry: { label: "Expiry Date", sensitive: false },
    cvv: { label: "CVV", sensitive: true },
    pin: { label: "PIN", sensitive: true },
  },
  crypto: {
    network: { label: "Network", sensitive: false },
    address: { label: "Wallet Address", sensitive: false },
    seed_phrase: { label: "Seed Phrase", sensitive: true },
  },
  file: {
    fileName: { label: "File Name", sensitive: false },
    fileSize: { label: "File Size", sensitive: false },
  },
};

interface TypeMeta {
  label: string;
  icon: React.ReactNode;
  iconClass: string;
}

const TYPE_META: Record<string, TypeMeta> = {
  password: {
    label: "Login Credential",
    icon: <FaGlobe size={14} />,
    iconClass: "text-blue-600 bg-blue-50 border-blue-100",
  },
  card: {
    label: "Payment Card",
    icon: <FaCreditCard size={14} />,
    iconClass: "text-purple-600 bg-purple-50 border-purple-100",
  },
  crypto: {
    label: "Crypto Wallet",
    icon: <FaWallet size={14} />,
    iconClass: "text-amber-600 bg-amber-50 border-amber-100",
  },
  file: {
    label: "File Reference",
    icon: <FaFile size={14} />,
    iconClass: "text-slate-500 bg-slate-50 border-slate-100",
  },
};

const LOADING_COPY: Record<LoadingStep, { title: string; subtitle: string }> = {
  fetching: {
    title: "Contacting secure server…",
    subtitle: "Verifying inheritance claim status.",
  },
  deriving: {
    title: "Deriving vault key…",
    subtitle:
      "This uses 600,000 key derivation rounds for security. It may take a few seconds.",
  },
  decrypting: {
    title: "Decrypting vault items…",
    subtitle: "Unlocking your inherited data.",
  },
};

// ── Helpers ────────────────────────────────────────────────────

/** base64 → ArrayBuffer (not exported from lib/crypto.ts, so inlined here). */
function base642ab(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function formatFileSize(raw: unknown): string {
  const n = Number(raw);
  if (isNaN(n)) return String(raw ?? "");
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

const SENSITIVE_MASK = "••••••••";

// ── Main Page ──────────────────────────────────────────────────

export default function ClaimPage() {
  const [claimState, setClaimState] = useState<ClaimState>("idle");
  const [loadingStep, setLoadingStep] = useState<LoadingStep>("fetching");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [emergencyKey, setEmergencyKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [decryptedItems, setDecryptedItems] = useState<DecryptedItem[]>([]);
  const [switchId, setSwitchId] = useState<string | null>(null);
  const [revealedFields, setRevealedFields] = useState<Set<string>>(new Set());
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const wordCount = emergencyKey.trim().split(/\s+/).filter(Boolean).length;

  const toggleReveal = useCallback((key: string) => {
    setRevealedFields((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }, []);

  const handleCopy = useCallback(async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(key);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Clipboard access denied — silently ignore
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setClaimState("loading");
    setLoadingStep("fetching");

    try {
      // ── Step 1: Server — verify triggered status, return encrypted items
      const result = await fetchTriggeredVault(ownerEmail.trim());
      if (!result.success) {
        setError(result.error);
        setClaimState("idle");
        return;
      }

      const { switch_id, wrappedVaultKey, items } = result;
      setSwitchId(switch_id);

      // ── Step 2: Browser — PBKDF2 key derivation (intentionally slow)
      setLoadingStep("deriving");
      const rawKeyB64 = await unwrapMasterVaultKey(
        wrappedVaultKey,
        emergencyKey.trim()
      );
      const vaultKey = await crypto.subtle.importKey(
        "raw",
        base642ab(rawKeyB64),
        { name: "AES-GCM", length: 256 },
        true,
        ["decrypt"]
      );

      // ── Step 3: Browser — AES-GCM decrypt each item
      setLoadingStep("decrypting");
      const decrypted: DecryptedItem[] = [];
      for (const item of items) {
        try {
          const fields = await decryptData(item.ciphertext, vaultKey);
          decrypted.push({
            id: item.id,
            type: item.type,
            name: item.name,
            fields:
              typeof fields === "object" && fields !== null
                ? (fields as Record<string, unknown>)
                : {},
          });
        } catch {
          decrypted.push({
            id: item.id,
            type: item.type,
            name: item.name,
            fields: { _error: "This item could not be decrypted." },
          });
        }
      }

      setDecryptedItems(decrypted);
      setClaimState("done");
    } catch (err: unknown) {
      const isDomException = err instanceof DOMException;
      setError(
        isDomException
          ? "Invalid Emergency Recovery Key. Please check the key from your email and try again."
          : err instanceof Error
            ? err.message
            : "An unexpected error occurred. Please try again."
      );
      setClaimState("idle");
    }
  };

  const handleReset = () => {
    setDecryptedItems([]);
    setSwitchId(null);
    setRevealedFields(new Set());
    setCopiedField(null);
    setOwnerEmail("");
    setEmergencyKey("");
    setError(null);
    setClaimState("idle");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Header ───────────────────────────────────────────── */}
      <header className="bg-slate-900 px-4 py-8 text-center">
        <p className="text-white text-xl font-bold tracking-tight">Nokslock</p>
        <p className="text-slate-400 text-sm mt-1">
          Secure Inheritance Claim Portal
        </p>
      </header>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          {claimState === "idle" && (
            <FormPanel
              ownerEmail={ownerEmail}
              setOwnerEmail={setOwnerEmail}
              emergencyKey={emergencyKey}
              setEmergencyKey={setEmergencyKey}
              wordCount={wordCount}
              error={error}
              onSubmit={handleSubmit}
            />
          )}

          {claimState === "loading" && (
            <LoadingPanel step={loadingStep} />
          )}

          {claimState === "done" && (
            <ResultsPanel
              items={decryptedItems}
              switchId={switchId ?? ""}
              revealedFields={revealedFields}
              copiedField={copiedField}
              onToggleReveal={toggleReveal}
              onCopy={handleCopy}
              onReset={handleReset}
            />
          )}
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="py-6 text-center">
        <p className="text-xs text-gray-400">
          Nokslock · End-to-end encrypted digital vault
        </p>
      </footer>
    </div>
  );
}

// ── Form Panel ─────────────────────────────────────────────────

function FormPanel({
  ownerEmail,
  setOwnerEmail,
  emergencyKey,
  setEmergencyKey,
  wordCount,
  error,
  onSubmit,
}: {
  ownerEmail: string;
  setOwnerEmail: (v: string) => void;
  emergencyKey: string;
  setEmergencyKey: (v: string) => void;
  wordCount: number;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const isReady = ownerEmail.includes("@") && wordCount === 16;

  const inputClass =
    "w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 transition";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="bg-slate-50 border-b border-gray-100 px-6 py-5 flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shrink-0">
          <FaShieldHalved size={17} />
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-900">
            Claim Inheritance
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Authorised next-of-kin access only
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="px-6 py-6 space-y-5">
        <p className="text-sm text-gray-600 leading-relaxed">
          Enter the email address of the person who designated you, and the{" "}
          <strong className="text-gray-800">Emergency Recovery Key</strong>{" "}
          from the notification email you received.
        </p>

        {error && (
          <div className="flex items-start gap-3 px-4 py-3.5 bg-red-50 border border-red-200 rounded-xl">
            <FaTriangleExclamation
              className="text-red-500 mt-0.5 shrink-0"
              size={14}
            />
            <p className="text-sm text-red-700 leading-snug">{error}</p>
          </div>
        )}

        {/* Owner email */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Vault Owner&apos;s Email Address
          </label>
          <input
            type="email"
            required
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
            placeholder="their.email@example.com"
            className={inputClass}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        </div>

        {/* Emergency key */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Emergency Recovery Key
          </label>
          <textarea
            required
            value={emergencyKey}
            onChange={(e) => setEmergencyKey(e.target.value)}
            placeholder="Paste your 16-word recovery key here…"
            rows={4}
            className={`${inputClass} resize-none font-mono leading-relaxed`}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          <p
            className={`text-xs font-medium tabular-nums ${
              wordCount === 0
                ? "text-gray-400"
                : wordCount === 16
                  ? "text-green-600"
                  : "text-amber-500"
            }`}
          >
            {wordCount === 0
              ? "16 words required"
              : wordCount === 16
                ? "✓ 16 words entered"
                : `${wordCount} / 16 words`}
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isReady}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white text-sm font-semibold py-3.5 rounded-xl hover:bg-slate-800 active:bg-slate-950 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <FaLock size={12} />
          Unlock Inheritance
        </button>

        {/* Security note */}
        <div className="flex items-start gap-2.5 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl">
          <FaShieldHalved className="text-slate-400 mt-0.5 shrink-0" size={13} />
          <p className="text-xs text-slate-500 leading-relaxed">
            Your recovery key is{" "}
            <strong className="text-slate-700">never sent to the server</strong>.
            All decryption runs entirely inside your browser.
          </p>
        </div>
      </form>
    </div>
  );
}

// ── Loading Panel ──────────────────────────────────────────────

function LoadingPanel({ step }: { step: LoadingStep }) {
  const { title, subtitle } = LOADING_COPY[step];
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-16 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-50 border border-slate-100 mb-6">
        <FaSpinner className="animate-spin text-slate-500" size={22} />
      </div>
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto leading-relaxed">
        {subtitle}
      </p>
    </div>
  );
}

// ── Results Panel ──────────────────────────────────────────────

function ResultsPanel({
  items,
  switchId,
  revealedFields,
  copiedField,
  onToggleReveal,
  onCopy,
  onReset,
}: {
  items: DecryptedItem[];
  switchId: string;
  revealedFields: Set<string>;
  copiedField: string | null;
  onToggleReveal: (key: string) => void;
  onCopy: (value: string, key: string) => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Success header + security notice */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 border border-green-100 rounded-xl flex items-center justify-center shrink-0">
            <FaCircleCheck className="text-green-600" size={17} />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {items.length === 1
                ? "1 item recovered"
                : `${items.length} items recovered`}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Vault decrypted successfully
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 px-4 py-3.5 bg-amber-50 border border-amber-200 rounded-xl">
          <FaTriangleExclamation
            className="text-amber-500 mt-0.5 shrink-0"
            size={14}
          />
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Session-only.</strong> This data is held in your
            browser&apos;s memory only. It is not saved or transmitted
            anywhere. Closing or refreshing this tab will permanently clear it.
          </p>
        </div>
      </div>

      {/* Item cards */}
      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-10 text-center">
          <p className="text-sm text-gray-500">
            No items were marked for inheritance sharing.
          </p>
        </div>
      ) : (
        items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            switchId={switchId}
            revealedFields={revealedFields}
            copiedField={copiedField}
            onToggleReveal={onToggleReveal}
            onCopy={onCopy}
          />
        ))
      )}

      {/* Reset */}
      <button
        onClick={onReset}
        className="w-full flex items-center justify-center gap-2 text-gray-500 text-sm font-medium py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition"
      >
        <FaArrowRotateLeft size={12} />
        Clear and Start Over
      </button>
    </div>
  );
}

// ── Item Card ──────────────────────────────────────────────────

function ItemCard({
  item,
  switchId,
  revealedFields,
  copiedField,
  onToggleReveal,
  onCopy,
}: {
  item: DecryptedItem;
  switchId: string;
  revealedFields: Set<string>;
  copiedField: string | null;
  onToggleReveal: (key: string) => void;
  onCopy: (value: string, key: string) => void;
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownload = async () => {
    const storagePath = item.fields.storagePath as string | undefined;
    const fileName = item.fields.fileName as string | undefined;
    if (!storagePath) return;

    setIsDownloading(true);
    setDownloadError(null);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const res = await fetch(
        `${supabaseUrl}/functions/v1/download-claim-file`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: anonKey,
          },
          body: JSON.stringify({
            switch_id: switchId,
            file_path: storagePath,
            bucket_name: "vault-files",
          }),
        }
      );
      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error ?? "Failed to generate download link.");
      }
      // Trigger browser download
      const a = document.createElement("a");
      a.href = json.signedUrl;
      a.download = fileName ?? "file";
      a.click();
    } catch (err: unknown) {
      setDownloadError(
        err instanceof Error ? err.message : "Download failed. Please try again."
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const meta = TYPE_META[item.type] ?? {
    label: item.type,
    icon: <FaFile size={14} />,
    iconClass: "text-slate-500 bg-slate-50 border-slate-100",
  };
  const fieldCfg = FIELD_CONFIG[item.type] ?? {};
  const hasError = "_error" in item.fields;

  // Exclude internal/non-displayable fields
  const displayFields = Object.entries(item.fields).filter(
    ([k]) => k !== "storagePath" && k !== "_error"
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <div
          className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${meta.iconClass}`}
        >
          {meta.icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {item.name}
          </p>
          <p className="text-xs text-gray-400">{meta.label}</p>
        </div>
      </div>

      {/* Fields */}
      <div className="divide-y divide-gray-50">
        {hasError ? (
          <div className="px-5 py-3">
            <p className="text-xs text-red-500">
              {String(item.fields._error)}
            </p>
          </div>
        ) : displayFields.length === 0 ? (
          <div className="px-5 py-3">
            <p className="text-xs text-gray-400">No fields.</p>
          </div>
        ) : (
          displayFields.map(([key, rawValue]) => {
            const cfg = fieldCfg[key];
            const label =
              cfg?.label ??
              key
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase());
            const isSensitive = cfg?.sensitive ?? false;
            const fieldKey = `${item.id}_${key}`;
            const isRevealed = revealedFields.has(fieldKey);
            const isCopied = copiedField === fieldKey;

            const displayValue =
              key === "fileSize"
                ? formatFileSize(rawValue)
                : String(rawValue ?? "");

            return (
              <div
                key={key}
                className="flex items-center justify-between gap-4 px-5 py-3.5"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p
                    className={`text-sm text-gray-900 break-all ${
                      isSensitive ? "font-mono" : ""
                    }`}
                  >
                    {isSensitive && !isRevealed
                      ? SENSITIVE_MASK
                      : displayValue}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {isSensitive && (
                    <button
                      type="button"
                      onClick={() => onToggleReveal(fieldKey)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                      title={isRevealed ? "Hide" : "Reveal"}
                      aria-label={isRevealed ? "Hide field" : "Reveal field"}
                    >
                      {isRevealed ? (
                        <FaEyeSlash size={13} />
                      ) : (
                        <FaEye size={13} />
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onCopy(displayValue, fieldKey)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                    title="Copy to clipboard"
                    aria-label={`Copy ${label}`}
                  >
                    {isCopied ? (
                      <FaCheck size={12} className="text-green-500" />
                    ) : (
                      <FaCopy size={12} />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}

        {/* File download */}
        {item.type === "file" && !hasError && Boolean(item.fields.storagePath) && (
          <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 space-y-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition"
            >
              {isDownloading ? (
                <FaSpinner className="animate-spin" size={13} />
              ) : (
                <FaDownload size={13} />
              )}
              {isDownloading ? "Generating link…" : "Download File"}
            </button>
            {downloadError && (
              <p className="text-xs text-red-600 leading-snug">{downloadError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
