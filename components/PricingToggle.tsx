"use client";

import { useState, useEffect } from "react";
import { FaCheck, FaCrown, FaBolt, FaShieldHalved, FaChevronDown } from "react-icons/fa6";
import Link from "next/link";

// --- CURRENCY METADATA ---
const currencyMeta = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
] as const;

type CurrencyCode = (typeof currencyMeta)[number]["code"];

// Fallback rates if API fails
const FALLBACK_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, NGN: 1550,
  CAD: 1.36, AUD: 1.53, KES: 129, GHS: 15.8,
  ZAR: 18.2, INR: 83.5,
};

// Base prices in USD
const BASE_MONTHLY = 5;
const BASE_6MONTH = 22.5;
const BASE_6MONTH_ORIGINAL = 30;
const BASE_YEARLY = 45;
const BASE_YEARLY_ORIGINAL = 60;

function formatPrice(amount: number, symbol: string, code: string): string {
  const wholeNumberCurrencies = ["NGN", "KES", "INR", "GHS", "ZAR"];
  if (wholeNumberCurrencies.includes(code)) {
    return `${symbol}${Math.round(amount).toLocaleString()}`;
  }
  return `${symbol}${amount.toFixed(2)}`;
}

const features = [
  "Unlimited digital asset storage",
  "Advanced dead-man switch automation",
  "Encrypted video/message vault for loved ones",
  "50GB secure storage",
  "Biometric access (if device supported)",
  "Emergency release protocol with legal verification",
  "Dedicated priority support",
  "Designated beneficiary",
  "Manual asset export anytime",
  "Email support",
];

export default function PricingToggle() {
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>("USD");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
  const [ratesLoading, setRatesLoading] = useState(true);

  // Fetch live exchange rates on mount
  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await fetch("/api/exchange-rates");
        if (!res.ok) throw new Error("Failed to fetch rates");
        const data = await res.json();
        if (data.rates) {
          setRates(data.rates);
        }
      } catch {
        // Keep fallback rates
        console.warn("Using fallback exchange rates");
      } finally {
        setRatesLoading(false);
      }
    }
    fetchRates();
  }, []);

  const meta = currencyMeta.find((c) => c.code === currencyCode)!;
  const rate = rates[currencyCode] ?? 1;
  const { symbol, code } = meta;

  const monthly = BASE_MONTHLY * rate;
  const sixMonth = BASE_6MONTH * rate;
  const sixMonthOriginal = BASE_6MONTH_ORIGINAL * rate;
  const yearly = BASE_YEARLY * rate;
  const yearlyOriginal = BASE_YEARLY_ORIGINAL * rate;
  const yearlyPerMonth = (BASE_YEARLY / 12) * rate;

  return (
    <div className="w-full max-w-6xl mx-auto px-4">

      {/* CURRENCY SELECTOR */}
      <div className="flex justify-center mb-10 animate-in slide-in-from-top-4 fade-in duration-700">
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="
              flex items-center gap-2.5 px-5 py-2.5 rounded-xl
              bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700
              shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600
              transition-all duration-200 text-sm font-semibold text-gray-700 dark:text-gray-200
              focus:outline-none focus:ring-2 focus:ring-blue-500/30
            "
          >
            <span className="text-base">{symbol}</span>
            <span>{code}</span>
            {ratesLoading && (
              <span className="h-3 w-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            )}
            <FaChevronDown
              size={10}
              className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="
                absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50
                bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700
                rounded-xl shadow-xl overflow-hidden min-w-[220px]
                animate-in slide-in-from-top-2 fade-in duration-200
              ">
                {currencyMeta.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setCurrencyCode(c.code);
                      setDropdownOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                      hover:bg-blue-50 dark:hover:bg-blue-900/30
                      ${c.code === currencyCode
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold"
                        : "text-gray-600 dark:text-gray-300"
                      }
                    `}
                  >
                    <span className="w-8 text-right font-semibold opacity-60">{c.symbol}</span>
                    <span>{c.name}</span>
                    <span className="ml-auto text-xs text-gray-400">{c.code}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 3-CARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

        {/* --- CARD 1: MONTHLY --- */}
        <div
          className="
            bg-white dark:bg-gray-900 rounded-3xl p-7 border border-gray-200 dark:border-gray-800
            shadow-sm flex flex-col h-full
            animate-in slide-in-from-bottom-8 fade-in duration-700 fill-mode-backwards delay-0
            transition-all hover:-translate-y-2 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-700
          "
        >
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <FaShieldHalved className="text-blue-500" />
              <h3 className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider text-xs">
                Monthly
              </h3>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                {formatPrice(monthly, symbol, code)}
              </span>
              <span className="text-gray-400 dark:text-gray-500 text-sm font-medium">/month</span>
            </div>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-3">
              Full access, billed monthly. Cancel anytime.
            </p>
          </div>

          <div className="flex-1 space-y-3 mb-8">
            {features.map((f) => (
              <FeatureItem key={f} text={f} />
            ))}
          </div>

          <Link
            href="/dashboard"
            className="w-full block text-center py-3.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 text-sm transition-colors"
          >
            Get Started
          </Link>
        </div>

        {/* --- CARD 2: 6-MONTH (POPULAR) --- */}
        <div
          className="
            bg-white dark:bg-gray-900 rounded-3xl p-7 border-2 border-blue-200 dark:border-blue-700
            shadow-lg relative flex flex-col h-full
            animate-in slide-in-from-bottom-8 fade-in duration-700 fill-mode-backwards delay-150
            transition-all hover:-translate-y-2 hover:shadow-2xl hover:border-blue-400 dark:hover:border-blue-500
          "
        >
          {/* POPULAR Badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
            <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg shadow-blue-500/30 tracking-wider uppercase">
              Popular
            </span>
          </div>

          <div className="mb-6 mt-2">
            <div className="flex items-center gap-2 mb-2">
              <FaBolt className="text-amber-500" />
              <h3 className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider text-xs">
                6-Month Plan
              </h3>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                {formatPrice(sixMonth, symbol, code)}
              </span>
              <span className="text-gray-400 dark:text-gray-500 text-sm font-medium">/6 months</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-gray-400 dark:text-gray-500 text-xs line-through">
                {formatPrice(sixMonthOriginal, symbol, code)}
              </span>
              <span className="text-[10px] bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-bold">
                Save 25%
              </span>
            </div>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
              Pay every 6 months and save more.
            </p>
          </div>

          <div className="flex-1 space-y-3 mb-8">
            {features.map((f) => (
              <FeatureItem key={f} text={f} />
            ))}
          </div>

          <Link
            href="/dashboard"
            className="w-full block text-center py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold hover:from-blue-600 hover:to-blue-700 text-sm transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30"
          >
            Get 6-Month Plan
          </Link>
        </div>

        {/* --- CARD 3: YEARLY (BEST VALUE) --- */}
        <div
          className="
            bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-3xl p-7
            text-white shadow-xl shadow-blue-300/30 dark:shadow-blue-900/40
            relative flex flex-col h-full overflow-hidden
            animate-in slide-in-from-bottom-8 fade-in duration-700 fill-mode-backwards delay-300
            transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-400/30 hover:scale-[1.02]
          "
        >
          {/* BEST VALUE Badge */}
          <div className="absolute top-0 right-0 z-10">
            <div className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-4 py-1.5 rounded-bl-xl tracking-wider animate-pulse">
              BEST VALUE
            </div>
          </div>

          <div className="mb-6 relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <FaCrown className="text-yellow-300" />
              <h3 className="text-blue-200 font-bold uppercase tracking-wider text-xs">
                Yearly Plan
              </h3>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold">
                {formatPrice(yearly, symbol, code)}
              </span>
              <span className="text-blue-200 text-sm font-medium">/year</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-blue-300 text-xs line-through opacity-70">
                {formatPrice(yearlyOriginal, symbol, code)}
              </span>
              <span className="text-[10px] bg-green-400/20 text-green-200 px-2 py-0.5 rounded-full font-bold backdrop-blur-sm">
                Save 25%
              </span>
            </div>
            <p className="text-blue-100 text-xs mt-2 opacity-80">
              Only <span className="font-bold text-white">{formatPrice(yearlyPerMonth, symbol, code)}/month</span> — best deal available.
            </p>
          </div>

          <div className="flex-1 space-y-3 mb-8 relative z-10">
            {features.map((f) => (
              <FeatureItem key={f} text={f} dark />
            ))}
          </div>

          <Link
            href="/dashboard"
            className="w-full block text-center py-3.5 rounded-xl bg-white text-blue-700 font-bold hover:bg-gray-100 text-sm transition-colors shadow-lg relative z-10"
          >
            Get Yearly Plan
          </Link>

          {/* Background Decorations */}
          <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-purple-500 rounded-full blur-3xl opacity-40 pointer-events-none animate-pulse duration-[3000ms]" />
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-400 rounded-full blur-3xl opacity-20 pointer-events-none" />
        </div>

      </div>
    </div>
  );
}

// --- HELPER COMPONENT ---
function FeatureItem({ text, dark }: { text: string; dark?: boolean }) {
  return (
    <div className="flex items-center gap-3 text-xs">
      <div
        className={`
          h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0 transition-transform hover:scale-110
          ${dark ? "bg-white/20 text-white" : "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"}
        `}
      >
        <FaCheck size={8} />
      </div>
      <span className={dark ? "text-blue-50 font-medium" : "text-gray-600 dark:text-gray-300 font-medium"}>
        {text}
      </span>
    </div>
  );
}