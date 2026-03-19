"use client";

import {
  FaCreditCard,
  FaUserSlash,
  FaTriangleExclamation,
  FaCircleCheck,
} from "react-icons/fa6";

type SubscriptionStats = {
  payingUsers: number;
  freeUsers: number;
  cancelledCount: number;
  expiringSoon: number;
  planBreakdown: {
    monthly: number;
    "6month": number;
    yearly: number;
  };
};

const PLAN_META = [
  {
    key: "monthly" as const,
    label: "Monthly",
    color: "bg-blue-500",
    track: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300",
  },
  {
    key: "6month" as const,
    label: "6 Month",
    color: "bg-violet-500",
    track: "bg-violet-100 dark:bg-violet-900/30",
    text: "text-violet-700 dark:text-violet-300",
  },
  {
    key: "yearly" as const,
    label: "Yearly",
    color: "bg-emerald-500",
    track: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-300",
  },
];

export default function SubscriptionAnalytics({
  stats,
}: {
  stats: SubscriptionStats;
}) {
  const totalPaying = stats.payingUsers;
  const totalAll = stats.payingUsers + stats.freeUsers;

  const summaryCards = [
    {
      label: "Paying Users",
      value: stats.payingUsers,
      icon: FaCreditCard,
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      subtext:
        totalAll > 0
          ? `${Math.round((stats.payingUsers / totalAll) * 100)}% of all users`
          : "—",
    },
    {
      label: "Free Plan",
      value: stats.freeUsers,
      icon: FaCircleCheck,
      bg: "bg-gray-100 dark:bg-gray-700",
      iconColor: "text-gray-500 dark:text-gray-400",
      subtext:
        totalAll > 0
          ? `${Math.round((stats.freeUsers / totalAll) * 100)}% of all users`
          : "—",
    },
    {
      label: "Expiring (30d)",
      value: stats.expiringSoon,
      icon: FaTriangleExclamation,
      bg: "bg-amber-50 dark:bg-amber-900/20",
      iconColor: "text-amber-600 dark:text-amber-400",
      subtext: "Active plans expiring soon",
    },
    {
      label: "Cancelled",
      value: stats.cancelledCount,
      icon: FaUserSlash,
      bg: "bg-red-50 dark:bg-red-900/20",
      iconColor: "text-red-600 dark:text-red-400",
      subtext: "Subscriptions cancelled",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
          <FaCreditCard
            className="text-emerald-600 dark:text-emerald-400"
            size={16}
          />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">
            Subscription Analytics
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Paying users and plan breakdown
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary stat cards */}
        <div className="grid grid-cols-2 gap-3">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30"
            >
              <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                <card.icon className={card.iconColor} size={14} />
              </div>
              <p className="text-xl font-black text-gray-900 dark:text-white">
                {card.value.toLocaleString()}
              </p>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
                {card.label}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                {card.subtext}
              </p>
            </div>
          ))}
        </div>

        {/* Plan breakdown */}
        <div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
            Plan Breakdown
          </p>
          <div className="space-y-3">
            {PLAN_META.map((plan) => {
              const count = stats.planBreakdown[plan.key];
              const pct = totalPaying > 0 ? (count / totalPaying) * 100 : 0;
              return (
                <div key={plan.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-bold ${plan.text}`}>
                      {plan.label}
                    </span>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      {count.toLocaleString()}
                      <span className="font-normal text-gray-400 dark:text-gray-500 ml-1">
                        ({Math.round(pct)}%)
                      </span>
                    </span>
                  </div>
                  <div className={`h-2 rounded-full ${plan.track} overflow-hidden`}>
                    <div
                      className={`h-full rounded-full ${plan.color} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
