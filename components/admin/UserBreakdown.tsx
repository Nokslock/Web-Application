"use client";

type BreakdownProps = {
  roleDistribution: { admins: number; users: number };
  providerBreakdown: Record<string, number>;
  totalUsers: number;
};

const providerColors: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  email: {
    bg: "bg-blue-500",
    text: "text-blue-600 dark:text-blue-400",
    label: "Email",
  },
  google: {
    bg: "bg-red-500",
    text: "text-red-600 dark:text-red-400",
    label: "Google",
  },
  apple: {
    bg: "bg-gray-800 dark:bg-gray-300",
    text: "text-gray-800 dark:text-gray-300",
    label: "Apple",
  },
  github: {
    bg: "bg-gray-700",
    text: "text-gray-700 dark:text-gray-300",
    label: "GitHub",
  },
};

function getProviderStyle(provider: string) {
  return (
    providerColors[provider] || {
      bg: "bg-gray-400",
      text: "text-gray-500",
      label: provider.charAt(0).toUpperCase() + provider.slice(1),
    }
  );
}

export default function UserBreakdown({
  roleDistribution,
  providerBreakdown,
  totalUsers,
}: BreakdownProps) {
  const providers = Object.entries(providerBreakdown).sort(
    ([, a], [, b]) => b - a,
  );

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Role Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
          Role Distribution
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
          Admin vs regular users
        </p>

        {/* Donut-like visual */}
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke="currentColor"
                className="text-gray-100 dark:text-gray-700"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="3"
                strokeDasharray={`${
                  totalUsers > 0
                    ? (roleDistribution.admins / totalUsers) * 100
                    : 0
                } ${100 - (totalUsers > 0 ? (roleDistribution.admins / totalUsers) * 100 : 0)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-black text-gray-900 dark:text-white">
                {roleDistribution.admins}
              </span>
            </div>
          </div>

          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Admins
                </span>
              </div>
              <span className="font-bold text-sm text-gray-900 dark:text-white">
                {roleDistribution.admins}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Users
                </span>
              </div>
              <span className="font-bold text-sm text-gray-900 dark:text-white">
                {roleDistribution.users}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Provider Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
          Auth Providers
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
          How users sign in
        </p>

        {/* Stacked bar */}
        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex mb-5">
          {providers.map(([provider, count]) => {
            const style = getProviderStyle(provider);
            const pct = totalUsers > 0 ? (count / totalUsers) * 100 : 0;
            return (
              <div
                key={provider}
                className={`${style.bg} transition-all`}
                style={{ width: `${pct}%` }}
                title={`${style.label}: ${count}`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="space-y-2.5">
          {providers.map(([provider, count]) => {
            const style = getProviderStyle(provider);
            const pct =
              totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
            return (
              <div key={provider} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${style.bg}`} />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {style.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{pct}%</span>
                  <span className="font-bold text-sm text-gray-900 dark:text-white min-w-[24px] text-right">
                    {count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
