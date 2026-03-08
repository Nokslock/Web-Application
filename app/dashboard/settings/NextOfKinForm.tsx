"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useRouter } from "next/navigation";
import { createAutoNotification } from "@/app/actions/notifications";
import {
  FaAddressBook,
  FaPen,
  FaCheck,
  FaShield,
  FaCircleCheck,
} from "react-icons/fa6";
import clsx from "clsx";
import { toast } from "sonner";
import { generateEmergencyKey, wrapMasterVaultKey } from "@/lib/emergency-key";
import { exportVaultKeyMaterial } from "@/lib/vaultKeyManager";
import {
  setupDeadManSwitch,
  type SetupDeadManSwitchPayload,
} from "@/lib/dead-man-actions";

// ── Types ─────────────────────────────────────────────────────

interface NextOfKinProps {
  initialData: {
    full_name: string;
    email: string;
    alt_email: string;
    phone: string;
    nin: string;
  } | null;
  userId: string;
  hasDmsSetup?: boolean;
}

// ── Threshold options ─────────────────────────────────────────

const THRESHOLD_OPTIONS = [
  { label: "30 days", value: 30 },
  { label: "60 days", value: 60 },
  { label: "90 days", value: 90 },
  { label: "180 days", value: 180 },
  { label: "1 year", value: 365 },
];

// ── Component ─────────────────────────────────────────────────

export default function NextOfKinForm({
  initialData,
  userId,
  hasDmsSetup = false,
}: NextOfKinProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  // NOK contact form state
  const [formData, setFormData] = useState({
    full_name: initialData?.full_name || "",
    email: initialData?.email || "",
    alt_email: initialData?.alt_email || "",
    phone: initialData?.phone || "",
    nin: initialData?.nin || "",
  });

  // Dead Man's Switch state — no emergencyKey in state (Surprise Inheritance model)
  const [dmsOpen, setDmsOpen] = useState(false);
  const [dmsStep, setDmsStep] = useState<"idle" | "done">("idle");
  const [threshold, setThreshold] = useState(90);
  const [dmsLoading, setDmsLoading] = useState(false);
  const [dmsError, setDmsError] = useState<string | null>(null);
  const [dmsActive, setDmsActive] = useState(hasDmsSetup);

  // ── NOK handlers ───────────────────────────────────────────

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await (supabase.from("next_of_kin") as any).upsert(
        {
          user_id: userId,
          ...formData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      if (error) throw error;

      setIsEditing(false);
      router.refresh();
      toast.success("Next of Kin saved successfully!");
      createAutoNotification({
        title: "Next of Kin Updated",
        message:
          "Your digital inheritance contact was updated to " +
          formData.full_name +
          ".",
        type: "success",
      });
    } catch (error: any) {
      console.error(error);
      toast.error("Error updating profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Dead Man's Switch handler ──────────────────────────────

  const handleEnableSwitch = async () => {
    if (!formData.email) {
      setDmsError("Please save a NOK email above before enabling the switch.");
      return;
    }

    setDmsLoading(true);
    setDmsError(null);

    try {
      // The emergency key is a local const — it is never stored in React state,
      // never rendered to the DOM, and never logged. It exists only for the
      // duration of this async call, then goes out of scope.
      const emergencyKey = generateEmergencyKey();

      let rawVaultKeyB64: string;
      try {
        rawVaultKeyB64 = await exportVaultKeyMaterial();
      } catch {
        setDmsError(
          "Your vault is locked. Please re-authenticate to enable the switch.",
        );
        return;
      }

      const wrappedVaultKey = await wrapMasterVaultKey(
        emergencyKey,
        rawVaultKeyB64,
      );

      const payload: SetupDeadManSwitchPayload = {
        nokEmail: formData.email,
        emergencyKey, // plaintext — encrypted server-side before DB storage
        wrappedVaultKey,
        inactivityThresholdDays: threshold,
      };

      const result = await setupDeadManSwitch(payload);

      if (!result.success) {
        setDmsError(result.error);
        return;
      }

      setDmsStep("done");
      setDmsActive(true);
      toast.success("Dead Man's Switch enabled!");
      createAutoNotification({
        title: "Dead Man's Switch Activated",
        message: `Your vault will be securely forwarded after ${threshold} days of inactivity.`,
        type: "success",
      });
    } catch (err: any) {
      console.error(err);
      setDmsError("Unexpected error. Please try again.");
    } finally {
      setDmsLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-8">
      {/* ── NOK Contact Section ─────────────────────────────── */}
      <section className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-50 dark:bg-green-900/10 rounded-lg text-green-600 dark:text-green-400">
              <FaAddressBook size={16} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Next of Kin
              </h4>
              <p className="text-xs text-gray-400 font-medium">
                Emergency contact details
              </p>
            </div>
          </div>

          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-black dark:bg-white dark:text-black rounded-md hover:opacity-80 transition-opacity flex items-center gap-1.5"
                disabled={loading}
              >
                {loading ? (
                  "Saving..."
                ) : (
                  <>
                    <FaCheck size={10} /> Save
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <FaPen size={10} /> Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Full Name
            </label>
            <input
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              disabled={!isEditing}
              className={clsx(
                "w-full p-3 rounded-lg border transition-all text-sm outline-none",
                isEditing
                  ? "bg-white dark:bg-gray-900 border-blue-500 ring-4 ring-blue-500/10 text-gray-900 dark:text-white"
                  : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-500 cursor-not-allowed"
              )}
              placeholder="Full Name"
            />
          </div>

          {/* NIN */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              NIN (ID Number)
            </label>
            <input
              name="nin"
              value={formData.nin}
              onChange={handleChange}
              disabled={!isEditing}
              className={clsx(
                "w-full p-3 rounded-lg border transition-all text-sm outline-none",
                isEditing
                  ? "bg-white dark:bg-gray-900 border-blue-500 ring-4 ring-blue-500/10 text-gray-900 dark:text-white"
                  : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-500 cursor-not-allowed"
              )}
              placeholder="National ID Number"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              className={clsx(
                "w-full p-3 rounded-lg border transition-all text-sm outline-none",
                isEditing
                  ? "bg-white dark:bg-gray-900 border-blue-500 ring-4 ring-blue-500/10 text-gray-900 dark:text-white"
                  : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-500 cursor-not-allowed"
              )}
              placeholder="Email Address"
            />
          </div>

          {/* Alt Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Alternative Email
            </label>
            <input
              name="alt_email"
              type="email"
              value={formData.alt_email}
              onChange={handleChange}
              disabled={!isEditing}
              className={clsx(
                "w-full p-3 rounded-lg border transition-all text-sm outline-none",
                isEditing
                  ? "bg-white dark:bg-gray-900 border-blue-500 ring-4 ring-blue-500/10 text-gray-900 dark:text-white"
                  : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-500 cursor-not-allowed"
              )}
              placeholder="Alt. Email Address"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Phone Number
            </label>
            <input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing}
              className={clsx(
                "w-full p-3 rounded-lg border transition-all text-sm outline-none",
                isEditing
                  ? "bg-white dark:bg-gray-900 border-blue-500 ring-4 ring-blue-500/10 text-gray-900 dark:text-white"
                  : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-500 cursor-not-allowed"
              )}
              placeholder="Phone Number"
            />
          </div>
        </div>
      </section>

      {/* ── Dead Man's Switch Section ────────────────────────── */}
      <section className="border-t border-gray-100 dark:border-gray-800 pt-6 space-y-4">
        {/* Header row */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div
              className={clsx(
                "p-2 rounded-lg",
                dmsActive
                  ? "bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400"
              )}
            >
              <FaShield size={16} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Dead Man's Switch
              </h4>
              <p className="text-xs text-gray-400 font-medium">
                {dmsActive
                  ? "Active — vault will be forwarded on inactivity"
                  : "Securely forward your vault if unreachable"}
              </p>
            </div>
          </div>

          {!dmsOpen && (
            <button
              onClick={() => { setDmsStep("idle"); setDmsOpen(true); }}
              className="text-xs font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              {dmsActive ? "Reconfigure" : "Set Up"}
            </button>
          )}
        </div>

        {/* Status badge when active and panel is closed */}
        {dmsActive && !dmsOpen && (
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg px-3 py-2">
            <FaCircleCheck size={12} />
            <span className="font-medium">
              Switch is active. Your vault is protected.
            </span>
          </div>
        )}

        {/* Panel */}
        {dmsOpen && (
          <div className="rounded-xl border border-orange-200 dark:border-orange-900/40 bg-orange-50/50 dark:bg-orange-900/5 p-5 space-y-5">

            {/* Step: idle — configure and enable */}
            {dmsStep === "idle" && (
              <div className="space-y-4">
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  When enabled, a secure recovery key is generated in your
                  browser, encrypted, and held in escrow by our servers — along
                  with a wrapped copy of your vault key. If you are unreachable
                  for the selected period, your Next of Kin will automatically
                  receive everything they need to access your vault.{" "}
                  <strong>
                    The recovery key is never shown to you — this is a surprise
                    inheritance.
                  </strong>
                </p>

                {/* Delivery target (read-only) */}
                {formData.email && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Will be delivered to
                    </p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-mono bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
                      {formData.email}
                    </p>
                  </div>
                )}

                {/* Threshold selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Trigger after inactivity of
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {THRESHOLD_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setThreshold(opt.value)}
                        className={clsx(
                          "px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all",
                          threshold === opt.value
                            ? "bg-orange-500 border-orange-500 text-white"
                            : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-orange-300"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {dmsError && (
                  <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 rounded-lg px-3 py-2">
                    {dmsError}
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => { setDmsOpen(false); setDmsError(null); }}
                    disabled={dmsLoading}
                    className="px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEnableSwitch}
                    disabled={dmsLoading}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-60 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    {dmsLoading ? (
                      "Setting up..."
                    ) : (
                      <>
                        <FaShield size={10} /> Enable Switch
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step: done — success state */}
            {dmsStep === "done" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  <FaCircleCheck size={16} />
                  Dead Man's Switch is now active
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Your vault is protected. If you are unreachable for{" "}
                  <strong>{threshold} days</strong>, it will be securely
                  forwarded to your Next of Kin automatically.
                </p>
                <button
                  onClick={() => setDmsOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
