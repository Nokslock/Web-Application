"use client";

import Link from "next/link";
import { FaLock, FaShieldHalved, FaVault, FaCrown, FaArrowRight } from "react-icons/fa6";

const features = [
  "Unlimited vault creation",
  "Encrypted file & document storage",
  "50GB secure cloud storage",
  "Dead Man's Switch automation",
  "Next of Kin asset transfer",
  "Biometric access support",
];

export default function VaultPaywall() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      {/* Icon */}
      <div className="relative mb-6">
        <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl shadow-blue-500/20">
          <FaVault className="text-white text-3xl" />
        </div>
        <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-xl bg-amber-400 flex items-center justify-center shadow-lg">
          <FaLock className="text-white text-xs" />
        </div>
      </div>

      {/* Heading */}
      <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white text-center tracking-tight mb-3">
        Unlock Your Vaults
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-8 leading-relaxed">
        Vaults are a premium feature. Subscribe to securely store, organize, and
        protect your most important digital assets.
      </p>

      {/* Feature list */}
      <div className="w-full max-w-sm mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FaCrown className="text-amber-400 text-sm" />
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Premium Features
            </span>
          </div>
          <ul className="space-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <FaShieldHalved className="text-green-600 dark:text-green-400 text-[10px]" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/pricing"
        className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all active:scale-[0.98]"
      >
        View Plans & Subscribe
        <FaArrowRight className="text-sm" />
      </Link>

      <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
        30-day money-back guarantee &middot; Cancel anytime
      </p>
    </div>
  );
}
