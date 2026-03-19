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
  FaFileMedical,
  FaXmark,
} from "react-icons/fa6";
import {
  fetchTriggeredVault,
  uploadDeathCertificate,
  type FetchedVaultItem,
} from "@/lib/dead-man-actions";
import { unwrapMasterVaultKey } from "@/lib/emergency-key";
import { decryptData } from "@/lib/crypto";
import AuthNavbar from "@/components/AuthNavbar";
import { toast } from "sonner";

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
    iconClass:
      "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30",
  },
  card: {
    label: "Payment Card",
    icon: <FaCreditCard size={14} />,
    iconClass:
      "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/30",
  },
  crypto: {
    label: "Crypto Wallet",
    icon: <FaWallet size={14} />,
    iconClass:
      "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30",
  },
  file: {
    label: "File Reference",
    icon: <FaFile size={14} />,
    iconClass:
      "text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
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
  const [certFile, setCertFile] = useState<File | null>(null);
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
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Clipboard access denied");
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

      // ── Step 1b: Upload death certificate (non-blocking on decryption)
      if (certFile) {
        const fd = new FormData();
        fd.append("file", certFile);
        fd.append("switch_id", switch_id);
        await uploadDeathCertificate(fd);
      }

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
      toast.success(`${decrypted.length} item${decrypted.length !== 1 ? "s" : ""} decrypted successfully`);
    } catch (err: unknown) {
      const isDomException = err instanceof DOMException;
      const msg = isDomException
        ? "Invalid Emergency Recovery Key. Please check the key from your email and try again."
        : err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again.";
      setError(msg);
      toast.error(msg);
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
    setCertFile(null);
    setError(null);
    setClaimState("idle");
    toast.info("Session cleared");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col transition-colors duration-300">
      <AuthNavbar />

      <main className="flex-1 flex items-start justify-center px-4 sm:px-6 py-10">
        <div className="w-full max-w-lg">
          {claimState === "idle" && (
            <FormPanel
              ownerEmail={ownerEmail}
              setOwnerEmail={setOwnerEmail}
              emergencyKey={emergencyKey}
              setEmergencyKey={setEmergencyKey}
              wordCount={wordCount}
              certFile={certFile}
              setCertFile={setCertFile}
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

      <footer className="py-6 px-8 flex justify-between items-center border-t border-gray-100 dark:border-gray-900">
        <p className="text-xs font-medium text-gray-400">&copy; Nokslock 2025</p>
        <p className="text-xs text-gray-400">End-to-end encrypted digital vault</p>
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
  certFile,
  setCertFile,
  error,
  onSubmit,
}: {
  ownerEmail: string;
  setOwnerEmail: (v: string) => void;
  emergencyKey: string;
  setEmergencyKey: (v: string) => void;
  wordCount: number;
  certFile: File | null;
  setCertFile: (f: File | null) => void;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const isReady = ownerEmail.includes("@") && wordCount === 16 && certFile !== null;

  const inputClass =
    "w-full p-3 rounded-lg border transition-all text-sm outline-none bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

  return (
    <div>
      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter mb-2">
          Claim Inheritance
        </h1>
        <p className="text-base text-gray-500 dark:text-gray-400">
          Authorised next-of-kin access only.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Card header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg text-blue-600 dark:text-blue-400">
            <FaShieldHalved size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Secure Access Portal
            </h2>
            <p className="text-xs text-gray-400 font-medium">
              Enter the details from your notification email
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="px-6 py-6 space-y-5">
          {error && (
            <div className="flex items-start gap-3 px-4 py-3.5 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/40 rounded-lg">
              <FaTriangleExclamation
                className="text-red-500 dark:text-red-400 mt-0.5 shrink-0"
                size={14}
              />
              <p className="text-sm text-red-700 dark:text-red-400 leading-snug">{error}</p>
            </div>
          )}

          {/* Owner email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
              className={`text-xs font-semibold tabular-nums ${
                wordCount === 0
                  ? "text-gray-400 dark:text-gray-600"
                  : wordCount === 16
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-orange-500 dark:text-orange-400"
              }`}
            >
              {wordCount === 0
                ? "16 words required"
                : wordCount === 16
                  ? "✓ 16 words entered"
                  : `${wordCount} / 16 words`}
            </p>
          </div>

          {/* Death certificate upload */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Death Certificate <span className="text-red-500">*</span>
            </label>
            {certFile ? (
              <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/40 rounded-lg">
                <FaFileMedical className="text-emerald-500 shrink-0" size={14} />
                <p className="text-sm text-emerald-800 dark:text-emerald-300 font-medium flex-1 truncate">
                  {certFile.name}
                </p>
                <button
                  type="button"
                  onClick={() => setCertFile(null)}
                  className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200 shrink-0"
                  aria-label="Remove file"
                >
                  <FaXmark size={13} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-2 px-4 py-5 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors">
                <FaFileMedical className="text-gray-400 dark:text-gray-600" size={20} />
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Click to upload death certificate
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-600">
                  PDF, JPG or PNG — max 10 MB
                </span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="sr-only"
                  onChange={(e) => setCertFile(e.target.files?.[0] ?? null)}
                />
              </label>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isReady}
            className="w-full flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black text-sm font-bold py-3 rounded-lg hover:opacity-90 active:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            <FaLock size={12} />
            Unlock Inheritance
          </button>

          {/* Security note */}
          <div className="flex items-start gap-2.5 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-lg">
            <FaShieldHalved className="text-gray-400 mt-0.5 shrink-0" size={13} />
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Your recovery key is{" "}
              <strong className="text-gray-700 dark:text-gray-200">never sent to the server</strong>.
              All decryption runs entirely inside your browser.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Loading Panel ──────────────────────────────────────────────

const LOADING_ORDER: LoadingStep[] = ["fetching", "deriving", "decrypting"];

function LoadingPanel({ step }: { step: LoadingStep }) {
  const { title, subtitle } = LOADING_COPY[step];
  const currentIdx = LOADING_ORDER.indexOf(step);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 px-6 py-10 space-y-8">
      {/* Spinner + message */}
      <div className="flex flex-col items-center text-center gap-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <FaSpinner className="animate-spin text-gray-500 dark:text-gray-400" size={22} />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Progress steps */}
      <div className="space-y-2">
        {LOADING_ORDER.map((s, idx) => {
          const isDone = idx < currentIdx;
          const isActive = idx === currentIdx;
          return (
            <div
              key={s}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30"
                  : isDone
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-gray-400 dark:text-gray-600"
              }`}
            >
              {isDone ? (
                <FaCircleCheck size={13} />
              ) : isActive ? (
                <FaSpinner className="animate-spin" size={13} />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-current inline-block shrink-0" />
              )}
              {LOADING_COPY[s].title}
            </div>
          );
        })}
      </div>
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
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 px-6 py-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg text-emerald-600 dark:text-emerald-400">
            <FaCircleCheck size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              {items.length === 1
                ? "1 item recovered"
                : `${items.length} items recovered`}
            </h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Vault decrypted successfully
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 px-4 py-3.5 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/40 rounded-lg">
          <FaTriangleExclamation
            className="text-orange-500 dark:text-orange-400 mt-0.5 shrink-0"
            size={14}
          />
          <p className="text-xs text-orange-800 dark:text-orange-300 leading-relaxed">
            <strong>Session-only.</strong> This data is held in your
            browser&apos;s memory only. It is not saved or transmitted
            anywhere. Closing or refreshing this tab will permanently clear it.
          </p>
        </div>
      </div>

      {/* Item cards */}
      {items.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 px-6 py-10 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
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
        className="w-full flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300 text-sm font-semibold py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
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
      toast.success("Download started");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Download failed. Please try again.";
      setDownloadError(msg);
      toast.error(msg);
    } finally {
      setIsDownloading(false);
    }
  };

  const meta = TYPE_META[item.type] ?? {
    label: item.type,
    icon: <FaFile size={14} />,
    iconClass:
      "text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
  };
  const fieldCfg = FIELD_CONFIG[item.type] ?? {};
  const hasError = "_error" in item.fields;

  // Exclude internal/non-displayable fields
  const displayFields = Object.entries(item.fields).filter(
    ([k]) => k !== "storagePath" && k !== "_error"
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Card header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <div
          className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${meta.iconClass}`}
        >
          {meta.icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
            {item.name}
          </p>
          <p className="text-xs text-gray-400 font-medium">{meta.label}</p>
        </div>
      </div>

      {/* Fields */}
      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        {hasError ? (
          <div className="px-5 py-3">
            <p className="text-xs text-red-500 dark:text-red-400">
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
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                    {label}
                  </p>
                  <p
                    className={`text-sm text-gray-900 dark:text-white break-all ${
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
                      onClick={() => { onToggleReveal(fieldKey); toast(isRevealed ? "Field hidden" : "Field revealed"); }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Copy to clipboard"
                    aria-label={`Copy ${label}`}
                  >
                    {isCopied ? (
                      <FaCheck size={12} className="text-emerald-500" />
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
          <div className="px-5 py-4 bg-gray-50 dark:bg-gray-800/50 space-y-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors"
            >
              {isDownloading ? (
                <FaSpinner className="animate-spin" size={12} />
              ) : (
                <FaDownload size={12} />
              )}
              {isDownloading ? "Generating link…" : "Download File"}
            </button>
            {downloadError && (
              <p className="text-xs text-red-600 dark:text-red-400 leading-snug">
                {downloadError}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
