"use client";

import {
  FaSkull,
  FaBolt,
  FaBan,
  FaClock,
  FaCircleCheck,
} from "react-icons/fa6";

type ActiveSwitch = {
  id: string;
  ownerEmail: string;
  thresholdDays: number;
  lastActiveAt: string;
  expiresAt: string;
  daysRemaining: number;
};

type DmsStats = {
  totalActive: number;
  totalTriggered: number;
  totalCancelled: number;
  activeSwitches: ActiveSwitch[];
};

function urgencyConfig(daysRemaining: number) {
  if (daysRemaining <= 7)
    return {
      bar: "bg-red-500",
      track: "bg-red-100 dark:bg-red-900/30",
      badge:
        "text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 border-red-100 dark:border-red-800",
      label: "Critical",
    };
  if (daysRemaining <= 30)
    return {
      bar: "bg-amber-500",
      track: "bg-amber-100 dark:bg-amber-900/30",
      badge:
        "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 border-amber-100 dark:border-amber-800",
      label: "Soon",
    };
  return {
    bar: "bg-emerald-500",
    track: "bg-emerald-100 dark:bg-emerald-900/30",
    badge:
      "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800",
    label: "Healthy",
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DeadManSwitchAnalytics({ stats }: { stats: DmsStats }) {
  const summaryCards = [
    {
      label: "Active",
      value: stats.totalActive,
      icon: FaCircleCheck,
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Triggered",
      value: stats.totalTriggered,
      icon: FaBolt,
      bg: "bg-red-50 dark:bg-red-900/20",
      iconColor: "text-red-600 dark:text-red-400",
    },
    {
      label: "Cancelled",
      value: stats.totalCancelled,
      icon: FaBan,
      bg: "bg-gray-100 dark:bg-gray-700",
      iconColor: "text-gray-500 dark:text-gray-400",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <FaSkull className="text-red-600 dark:text-red-400" size={16} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">
              Dead Man&apos;s Switch
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Active switches and time remaining
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-lg">
          {stats.totalActive} active
        </span>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 text-center"
            >
              <div
                className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center mx-auto mb-2`}
              >
                <card.icon className={card.iconColor} size={14} />
              </div>
              <p className="text-xl font-black text-gray-900 dark:text-white">
                {card.value}
              </p>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
                {card.label}
              </p>
            </div>
          ))}
        </div>

        {/* Active switches table */}
        <div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
            Active Switches — Time Remaining
          </p>

          {stats.activeSwitches.length === 0 ? (
            <div className="py-8 text-center">
              <FaSkull
                className="mx-auto text-gray-200 dark:text-gray-700 mb-2"
                size={22}
              />
              <p className="text-sm text-gray-400 dark:text-gray-500">
                No active switches
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {stats.activeSwitches.map((sw) => {
                const cfg = urgencyConfig(sw.daysRemaining);
                const pct = Math.max(
                  0,
                  Math.min(100, (sw.daysRemaining / sw.thresholdDays) * 100),
                );

                return (
                  <div
                    key={sw.id}
                    className="px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30"
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate flex-1">
                        {sw.ownerEmail}
                      </p>
                      <span
                        className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}
                      >
                        {cfg.label}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className={`h-1.5 rounded-full ${cfg.track} overflow-hidden mb-2`}>
                      <div
                        className={`h-full rounded-full ${cfg.bar} transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
                        <FaClock size={9} />
                        <span>
                          {sw.daysRemaining > 0
                            ? `${sw.daysRemaining}d remaining`
                            : "Overdue — not yet triggered"}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        Expires {formatDate(sw.expiresAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
