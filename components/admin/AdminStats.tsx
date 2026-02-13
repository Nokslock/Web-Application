"use client";

import {
  FaUsers,
  FaUserCheck,
  FaUserPlus,
  FaShieldHalved,
  FaArrowTrendUp,
  FaArrowTrendDown,
} from "react-icons/fa6";

type Stats = {
  totalUsers: number;
  activeUsers: number;
  newSignups: number;
  signupGrowth: number;
  verifiedUsers: number;
  roleDistribution: { admins: number; users: number };
  providerBreakdown: Record<string, number>;
  signupTimeline: { date: string; count: number }[];
};

const cards = [
  {
    key: "totalUsers",
    label: "Total Users",
    icon: FaUsers,
    color: "blue",
    bgIcon: "bg-blue-50 dark:bg-blue-900/20",
    textIcon: "text-blue-600 dark:text-blue-400",
  },
  {
    key: "activeUsers",
    label: "Active (30d)",
    icon: FaUserCheck,
    color: "emerald",
    bgIcon: "bg-emerald-50 dark:bg-emerald-900/20",
    textIcon: "text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "newSignups",
    label: "New (7d)",
    icon: FaUserPlus,
    color: "violet",
    bgIcon: "bg-violet-50 dark:bg-violet-900/20",
    textIcon: "text-violet-600 dark:text-violet-400",
    showGrowth: true,
  },
  {
    key: "verifiedUsers",
    label: "Verified",
    icon: FaShieldHalved,
    color: "amber",
    bgIcon: "bg-amber-50 dark:bg-amber-900/20",
    textIcon: "text-amber-600 dark:text-amber-400",
  },
] as const;

export default function AdminStats({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const value = stats[card.key as keyof Stats] as number;

        return (
          <div
            key={card.key}
            className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${card.bgIcon}`}>
                <card.icon className={card.textIcon} size={18} />
              </div>
              {"showGrowth" in card && card.showGrowth && (
                <div
                  className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
                    stats.signupGrowth >= 0
                      ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                      : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                  }`}
                >
                  {stats.signupGrowth >= 0 ? (
                    <FaArrowTrendUp size={12} />
                  ) : (
                    <FaArrowTrendDown size={12} />
                  )}
                  {Math.abs(stats.signupGrowth)}%
                </div>
              )}
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-white">
              {value.toLocaleString()}
            </p>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
              {card.label}
            </p>

            {/* Mini sparkline for total users */}
            {card.key === "totalUsers" && (
              <div className="mt-3 flex items-end gap-[3px] h-6">
                {stats.signupTimeline.slice(-14).map((d, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-blue-200 dark:bg-blue-800 rounded-sm min-h-[2px] transition-all"
                    style={{
                      height: `${Math.max(
                        10,
                        (d.count /
                          Math.max(
                            ...stats.signupTimeline
                              .slice(-14)
                              .map((x) => x.count),
                            1,
                          )) *
                          100,
                      )}%`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Active rate for active users */}
            {card.key === "activeUsers" && stats.totalUsers > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-[10px] font-semibold text-gray-400 mb-1">
                  <span>Activity rate</span>
                  <span>
                    {Math.round((stats.activeUsers / stats.totalUsers) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{
                      width: `${(stats.activeUsers / stats.totalUsers) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
