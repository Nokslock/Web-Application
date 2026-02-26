import PricingToggle from "@/components/PricingToggle";
import Link from "next/link";
import { FaArrowLeft, FaShieldHalved, FaLock, FaRotate } from "react-icons/fa6";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-gray-950 py-12 px-4 transition-colors duration-300">

      {/* Header Section */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <Link href="/dashboard" className="inline-flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 mb-6 transition text-sm font-bold">
          <FaArrowLeft className="mr-2" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          One Plan. Full Protection.
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
          Unlock every feature with a single plan — choose the billing cycle that works best for you.
        </p>
      </div>

      {/* Pricing Component */}
      <PricingToggle />

      {/* Security Assurance Footer */}
      <div className="mt-20 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <FaShieldHalved className="text-blue-500 text-lg" />
            </div>
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">30-Day Money-Back Guarantee</h4>
            <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
              Not satisfied? Get a full refund within 30 days, no questions asked.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
              <FaLock className="text-purple-500 text-lg" />
            </div>
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">End-to-End Encryption</h4>
            <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
              Your data is encrypted at rest and in transit. Only you hold the keys.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
              <FaRotate className="text-green-500 text-lg" />
            </div>
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Cancel Anytime</h4>
            <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
              No lock-in contracts. Downgrade or cancel your plan whenever you want.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}