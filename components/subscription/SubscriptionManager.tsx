"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FaCrown, FaArrowLeft, FaReceipt, FaCalendar,
  FaCircleCheck, FaArrowRight, FaDownload, FaXmark,
} from "react-icons/fa6";
import { planLabel, daysRemaining, isSubscriptionActive } from "@/lib/subscription";

interface PaymentRecord {
  id: string;
  reference: string;
  plan: string;
  amount: number;
  currency: string;
  paid_at: string;
  plan_expires_at: string;
}

interface Receipt {
  reference: string;
  amount: number;
  currency: string;
  plan: string;
  paid_at: string;
  plan_expires_at: string;
  email: string;
}

interface Props {
  plan: string;
  planStartedAt: string | null;
  planExpiresAt: string | null;
  planReference: string | null;
  planCancelled: boolean;
  userEmail: string;
  paymentHistory: PaymentRecord[];
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

function formatAmount(amount: number, currency: string) {
  const major = amount / 100;
  if (currency === "NGN") return `₦${major.toLocaleString()}`;
  return `$${major.toFixed(2)}`;
}

export default function SubscriptionManager({
  plan, planStartedAt, planExpiresAt, planReference,
  planCancelled, userEmail, paymentHistory,
}: Props) {
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [isCancelled, setIsCancelled] = useState(planCancelled);

  const days = daysRemaining(planExpiresAt);
  const active = isSubscriptionActive(planExpiresAt);

  async function handleCancel() {
    setCancelling(true);
    setCancelError(null);

    try {
      const res = await fetch("/api/subscription/cancel", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setCancelError(data.error || "Something went wrong");
        return;
      }

      setIsCancelled(true);
      setShowCancelModal(false);
    } catch {
      setCancelError("Network error. Please try again.");
    } finally {
      setCancelling(false);
    }
  }

  function openReceipt(record: PaymentRecord) {
    setReceipt({
      reference: record.reference,
      amount: record.amount,
      currency: record.currency,
      plan: record.plan,
      paid_at: record.paid_at,
      plan_expires_at: record.plan_expires_at,
      email: userEmail,
    });
    setReceiptOpen(true);
  }

  function openLatestReceipt() {
    const latest = paymentHistory.find((r) => r.reference === planReference) ?? paymentHistory[0];
    if (latest) openReceipt(latest);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors font-semibold"
      >
        <FaArrowLeft size={12} /> Back to Dashboard
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your plan, view payment history, and download receipts.
        </p>
      </div>

      {/* Current Plan Card */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-purple-500 rounded-full blur-3xl opacity-30 pointer-events-none" />
        <div className="absolute -top-8 -left-8 w-32 h-32 bg-blue-400 rounded-full blur-3xl opacity-20 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FaCrown className="text-yellow-300" />
                <span className="text-blue-200 text-xs font-bold uppercase tracking-wider">
                  {isCancelled && active ? "Cancelling" : "Active Plan"}
                </span>
              </div>
              <h2 className="text-3xl font-extrabold">{planLabel(plan)}</h2>
              {isCancelled && active && (
                <p className="text-yellow-200 text-xs mt-1">
                  Access until {formatDate(planExpiresAt)}
                </p>
              )}
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
              isCancelled && active
                ? "bg-yellow-400/20 text-yellow-200"
                : active
                  ? "bg-green-400/20 text-green-200"
                  : "bg-red-400/20 text-red-200"
            }`}>
              {isCancelled && active ? "Cancelling" : active ? "Active" : "Expired"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-blue-200 text-xs mb-1">Started</p>
              <p className="font-bold text-sm">{formatDate(planStartedAt)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-blue-200 text-xs mb-1">
                {isCancelled ? "Access Until" : "Renews / Expires"}
              </p>
              <p className="font-bold text-sm">{formatDate(planExpiresAt)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-blue-200 text-xs mb-1">Days Remaining</p>
              <p className="font-bold text-sm">{active ? `${days} days` : "Expired"}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            {paymentHistory.length > 0 && (
              <button
                onClick={openLatestReceipt}
                className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-xl text-sm font-semibold transition-colors"
              >
                <FaReceipt size={12} /> Latest Receipt
              </button>
            )}
            <Link
              href="/pricing"
              className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-xl text-sm font-semibold transition-colors"
            >
              Change Plan <FaArrowRight size={12} />
            </Link>
            {active && !isCancelled && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm rounded-xl text-sm font-semibold text-red-200 transition-colors"
              >
                Cancel Subscription
              </button>
            )}
            {isCancelled && active && (
              <span className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 backdrop-blur-sm rounded-xl text-sm font-semibold text-yellow-200">
                Cancellation pending
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <FaCalendar className="text-blue-500 text-sm" />
            <h3 className="font-bold text-gray-900 dark:text-white">Payment History</h3>
          </div>
        </div>

        {paymentHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
            <FaReceipt size={28} className="opacity-30" />
            <p className="text-sm">No payment records found.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {paymentHistory.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-9 w-9 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <FaCircleCheck className="text-green-500 text-sm" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {planLabel(record.plan)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(record.paid_at)} · Ref: {record.reference.slice(0, 16)}…
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatAmount(record.amount, record.currency)}
                  </span>
                  <button
                    onClick={() => openReceipt(record)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-semibold transition-colors"
                  >
                    <FaDownload size={10} /> Receipt
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => !cancelling && setShowCancelModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <span className="font-bold text-gray-900 dark:text-white">Cancel Subscription</span>
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
              >
                <FaXmark />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Are you sure you want to cancel your{" "}
                <span className="font-bold">{planLabel(plan)}</span>?
              </p>

              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl px-4 py-3 border border-amber-200 dark:border-amber-800/50">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  You will keep access to all premium features until{" "}
                  <span className="font-bold">{formatDate(planExpiresAt)}</span>.
                  After that, your account will revert to the Free plan.
                </p>
              </div>

              {cancelError && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl px-4 py-3 border border-red-200 dark:border-red-800/50">
                  <p className="text-sm text-red-600 dark:text-red-400">{cancelError}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                Keep my plan
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Yes, cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {receiptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <FaReceipt className="text-blue-500" />
                <span className="font-bold text-gray-900 dark:text-white">Receipt</span>
              </div>
              <button
                onClick={() => { setReceiptOpen(false); setReceipt(null); }}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
              >
                <FaXmark />
              </button>
            </div>

            {receipt && (
              <>
                <div className="px-6 py-6 space-y-4">
                  <div className="text-center pb-4 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">NOKSLOCK</p>
                    <p className="text-xs text-gray-400 mt-1">Payment Receipt</p>
                  </div>

                  <div className="flex justify-center">
                    <span className="flex items-center gap-2 px-4 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold">
                      <FaCircleCheck size={10} /> Payment Successful
                    </span>
                  </div>

                  <div className="space-y-3 bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
                    {[
                      { label: "Plan",      value: planLabel(receipt.plan) },
                      { label: "Amount",    value: formatAmount(receipt.amount, receipt.currency) },
                      { label: "Email",     value: receipt.email },
                      { label: "Date",      value: formatDate(receipt.paid_at) },
                      { label: "Expires",   value: formatDate(receipt.plan_expires_at) },
                      { label: "Reference", value: receipt.reference },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">{label}</span>
                        <span className="font-semibold text-gray-900 dark:text-white text-right max-w-[200px] break-all">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <button
                    onClick={() => window.print()}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors"
                  >
                    <FaDownload size={12} /> Download / Print
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
