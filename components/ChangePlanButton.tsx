"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaArrowUp, FaArrowDown, FaXmark, FaCircleCheck, FaArrowRight, FaCalendar,
} from "react-icons/fa6";
import { planLabel } from "@/lib/subscription";

interface ChangePlanButtonProps {
  planType: "monthly" | "6month" | "yearly";
  isDowngrade: boolean;
  className?: string;
  children: React.ReactNode;
}

type Phase = "confirm" | "loading" | "done" | "error";

export default function ChangePlanButton({
  planType,
  isDowngrade,
  className,
  children,
}: ChangePlanButtonProps) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("confirm");
  const [message, setMessage] = useState("");
  const router = useRouter();

  function openModal() {
    setPhase("confirm");
    setMessage("");
    setOpen(true);
  }

  function closeModal() {
    if (phase === "loading") return;
    setOpen(false);
  }

  async function confirm() {
    setPhase("loading");
    try {
      const res = await fetch("/api/subscription/change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error ?? "Could not change your plan. Please try again.");
        setPhase("error");
        return;
      }

      setMessage(
        data.effective === "now"
          ? `You're now on the ${planLabel(planType)}. Enjoy!`
          : `Your plan will switch to the ${planLabel(planType)} at the end of your current billing period.`
      );
      setPhase("done");
      setTimeout(() => {
        router.push("/dashboard/subscription");
        router.refresh();
      }, 1800);
    } catch {
      setMessage("Network error. Please try again.");
      setPhase("error");
    }
  }

  const accent = isDowngrade
    ? { Icon: FaArrowDown, color: "amber", verb: "Downgrade" }
    : { Icon: FaArrowUp, color: "blue", verb: "Upgrade" };

  return (
    <>
      <button onClick={openModal} className={className}>
        {children}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeModal}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <span
                  className={`h-8 w-8 rounded-xl flex items-center justify-center ${
                    isDowngrade
                      ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                      : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  }`}
                >
                  <accent.Icon size={13} />
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {accent.verb} to {planLabel(planType)}
                </span>
              </div>
              <button
                onClick={closeModal}
                disabled={phase === "loading"}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors disabled:opacity-40"
              >
                <FaXmark />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {phase === "done" ? (
                <div className="flex flex-col items-center text-center gap-3 py-2">
                  <div className="h-14 w-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <FaCircleCheck className="text-green-500 text-2xl" />
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">{message}</p>
                  <p className="text-xs text-gray-400">Taking you to your subscription…</p>
                </div>
              ) : (
                <>
                  {isDowngrade ? (
                    <>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Switch to the{" "}
                        <span className="font-bold text-gray-900 dark:text-white">{planLabel(planType)}</span>?
                      </p>
                      <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl px-4 py-3 border border-amber-200 dark:border-amber-800/50">
                        <FaCalendar className="text-amber-500 mt-0.5 flex-shrink-0" size={13} />
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          You&apos;ll keep your current plan and all features until the end of your
                          billing period — then it switches automatically.{" "}
                          <span className="font-bold">No charge today.</span>
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Upgrade to the{" "}
                        <span className="font-bold text-gray-900 dark:text-white">{planLabel(planType)}</span>{" "}
                        right now?
                      </p>
                      <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl px-4 py-3 border border-blue-200 dark:border-blue-800/50">
                        <FaCircleCheck className="text-blue-500 mt-0.5 flex-shrink-0" size={13} />
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Your new plan takes effect immediately. You&apos;ll only be charged the{" "}
                          <span className="font-bold">prorated difference</span> for the rest of this period.
                        </p>
                      </div>
                    </>
                  )}

                  {phase === "error" && (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl px-4 py-3 border border-red-200 dark:border-red-800/50">
                      <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {phase !== "done" && (
              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
                <button
                  onClick={closeModal}
                  disabled={phase === "loading"}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  onClick={confirm}
                  disabled={phase === "loading"}
                  className={`px-4 py-2 text-sm font-bold text-white rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 ${
                    isDowngrade
                      ? "bg-amber-500 hover:bg-amber-600"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {phase === "loading"
                    ? "Processing…"
                    : isDowngrade
                      ? "Schedule downgrade"
                      : "Upgrade now"}
                  {phase !== "loading" && <FaArrowRight size={11} />}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
