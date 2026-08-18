"use client";

import { useState, useTransition } from "react";
import { searchUsersByEmail, giftPremium } from "@/app/actions/admin";
import {
  FaGift,
  FaMagnifyingGlass,
  FaCheck,
  FaSpinner,
  FaUser,
} from "react-icons/fa6";

type UserResult = { id: string; email: string; full_name: string };

const PLAN_OPTIONS = [
  { value: "monthly" as const, label: "Monthly", defaultDays: 30 },
  { value: "6month" as const, label: "6 Month", defaultDays: 180 },
  { value: "yearly" as const, label: "Yearly", defaultDays: 365 },
];

export default function GiftPremium() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
  const [plan, setPlan] = useState<"monthly" | "6month" | "yearly">("monthly");
  const [days, setDays] = useState(30);
  const [searching, startSearch] = useTransition();
  const [gifting, startGift] = useTransition();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSearch() {
    if (!query.trim()) return;
    setSuccess(null);
    setError(null);
    startSearch(async () => {
      try {
        const users = await searchUsersByEmail(query.trim());
        setResults(users);
      } catch {
        setError("Failed to search users");
      }
    });
  }

  function handleSelectUser(user: UserResult) {
    setSelectedUser(user);
    setResults([]);
    setQuery(user.email);
  }

  function handlePlanChange(newPlan: "monthly" | "6month" | "yearly") {
    setPlan(newPlan);
    const option = PLAN_OPTIONS.find((o) => o.value === newPlan);
    if (option) setDays(option.defaultDays);
  }

  function handleGift() {
    if (!selectedUser) return;
    setSuccess(null);
    setError(null);
    startGift(async () => {
      try {
        const result = await giftPremium(selectedUser.id, plan, days);
        const expDate = new Date(result.expiresAt).toLocaleDateString();
        setSuccess(
          `Gifted ${PLAN_OPTIONS.find((o) => o.value === plan)?.label} plan to ${selectedUser.email} — expires ${expDate}`,
        );
        setSelectedUser(null);
        setQuery("");
      } catch {
        setError("Failed to gift premium");
      }
    });
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
          <FaGift
            className="text-purple-600 dark:text-purple-400"
            size={16}
          />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">
            Gift Premium
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Grant a user premium access for a specified duration
          </p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* User search */}
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Find User
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedUser(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by email..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching || !query.trim()}
              className="px-4 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {searching ? (
                <FaSpinner className="animate-spin" size={14} />
              ) : (
                "Search"
              )}
            </button>
          </div>

          {/* Search results dropdown */}
          {results.length > 0 && (
            <div className="mt-2 border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden">
              {results.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b last:border-b-0 border-gray-100 dark:border-gray-700"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <FaUser className="text-gray-400 text-xs" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.email}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.full_name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Selected user badge */}
          {selectedUser && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-bold">
              <FaCheck size={10} />
              {selectedUser.email}
            </div>
          )}
        </div>

        {/* Plan selection */}
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Plan Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PLAN_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handlePlanChange(option.value)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  plan === option.value
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Duration (days)
          </label>
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
            min={1}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
          />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1" suppressHydrationWarning>
            Expires on{" "}
            {new Date(
              Date.now() + days * 24 * 60 * 60 * 1000,
            ).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
          </p>
        </div>

        {/* Submit */}
        <button
          onClick={handleGift}
          disabled={!selectedUser || gifting}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-sm shadow-lg shadow-purple-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {gifting ? (
            <FaSpinner className="animate-spin" size={14} />
          ) : (
            <FaGift size={14} />
          )}
          {gifting ? "Gifting..." : "Gift Premium"}
        </button>

        {/* Feedback */}
        {success && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm font-medium">
            <FaCheck size={12} />
            {success}
          </div>
        )}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm font-medium">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
