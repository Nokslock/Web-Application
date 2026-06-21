"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaCircleCheck, FaCrown, FaArrowRight, FaShieldHalved, FaTriangleExclamation,
} from "react-icons/fa6";
import { planLabel } from "@/lib/subscription";

const REDIRECT_SECONDS = 6;

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [plan, setPlan] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    if (!sessionId) {
      setStatus("failed");
      return;
    }

    async function verify() {
      try {
        const res = await fetch(`/api/stripe/verify?session_id=${sessionId}`);
        const data = await res.json();
        if (data.success) {
          setPlan(data.plan ?? null);
          setStatus("success");
        } else {
          setStatus("failed");
        }
      } catch {
        setStatus("failed");
      }
    }

    verify();
  }, [sessionId]);

  // Count down, then redirect to the dashboard once verified.
  useEffect(() => {
    if (status !== "success") return;
    if (countdown <= 0) {
      router.push("/dashboard");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [status, countdown, router]);

  // --- LOADING ---
  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-5 px-4 bg-neutral-50 dark:bg-gray-950">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-900/40" />
          <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900 dark:text-white">Confirming your payment…</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This only takes a moment.</p>
        </div>
      </div>
    );
  }

  // --- FAILED ---
  if (status === "failed") {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 bg-neutral-50 dark:bg-gray-950">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm p-8 text-center">
          <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <FaTriangleExclamation className="text-red-500 text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            We couldn&apos;t confirm your payment
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            If you were charged, don&apos;t worry — your plan will activate automatically.
            Otherwise you can try again.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-7">
            <Link
              href="/pricing"
              className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors"
            >
              Back to Pricing
            </Link>
            <Link
              href="/dashboard"
              className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-bold transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- SUCCESS ---
  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-neutral-50 dark:bg-gray-950">
      <div className="w-full max-w-md">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-3xl shadow-xl text-white p-8 text-center animate-in zoom-in-95 fade-in duration-500">
          {/* glow decorations */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-400 rounded-full blur-3xl opacity-30 pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-44 h-44 bg-purple-500 rounded-full blur-3xl opacity-40 pointer-events-none animate-pulse duration-[3000ms]" />

          <div className="relative z-10">
            {/* check badge */}
            <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/10 animate-in zoom-in duration-700">
              <FaCircleCheck className="text-green-300 text-4xl" />
            </div>

            <div className="flex items-center justify-center gap-2 mb-2">
              <FaCrown className="text-yellow-300" />
              <span className="text-blue-100 text-xs font-bold uppercase tracking-widest">
                Payment Successful
              </span>
            </div>

            <h1 className="text-3xl font-extrabold">You&apos;re all set! 🎉</h1>
            <p className="text-blue-100 mt-2 text-sm">
              Your{" "}
              <span className="font-bold text-white">{planLabel(plan)}</span>{" "}
              is now active. Every premium feature is unlocked.
            </p>

            <Link
              href="/dashboard"
              className="mt-7 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white text-blue-700 font-bold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Go to Dashboard <FaArrowRight size={13} />
            </Link>

            <p className="text-blue-200/80 text-xs mt-4">
              Redirecting automatically in {countdown}s…
            </p>
          </div>
        </div>

        {/* reassurance footer */}
        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-gray-400 dark:text-gray-500">
          <FaShieldHalved className="text-blue-400" />
          A receipt is available anytime under Subscription.
        </div>
      </div>
    </div>
  );
}

export default function UpgradeSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-gray-950">
          <div className="h-10 w-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
