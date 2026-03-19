"use client";

import {
  FaCircleInfo,
  FaCircleCheck,
  FaTriangleExclamation,
  FaShieldHalved,
  FaBullhorn,
  FaUser,
  FaClockRotateLeft,
} from "react-icons/fa6";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "security";
  is_broadcast: boolean;
  user_id: string | null;
  created_at: string;
};

const typeConfig = {
  info: {
    icon: FaCircleInfo,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    badge: "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-800",
    label: "Info",
  },
  success: {
    icon: FaCircleCheck,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    badge: "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800",
    label: "Success",
  },
  warning: {
    icon: FaTriangleExclamation,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    badge: "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 border-amber-100 dark:border-amber-800",
    label: "Warning",
  },
  security: {
    icon: FaShieldHalved,
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-900/20",
    badge: "text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 border-red-100 dark:border-red-800",
    label: "Security",
  },
};

function formatTimestamp(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: diffDays > 365 ? "numeric" : undefined,
  });
}

function fullTimestamp(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function NotificationHistory({
  notifications,
}: {
  notifications: Notification[];
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
            <FaClockRotateLeft
              className="text-violet-600 dark:text-violet-400"
              size={16}
            />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">
              Notification History
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Last {notifications.length} notifications sent
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-lg">
          {notifications.length} total
        </span>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
        {notifications.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <FaClockRotateLeft
              className="mx-auto text-gray-200 dark:text-gray-700 mb-3"
              size={28}
            />
            <p className="text-sm text-gray-400 dark:text-gray-500">
              No notifications sent yet
            </p>
          </div>
        ) : (
          notifications.map((n) => {
            const cfg = typeConfig[n.type] ?? typeConfig.info;
            const Icon = cfg.icon;
            return (
              <div
                key={n.id}
                className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50/60 dark:hover:bg-gray-700/20 transition-colors"
              >
                {/* Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.bg}`}
                >
                  <Icon className={cfg.color} size={14} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {n.title}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}
                    >
                      {cfg.label}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        n.is_broadcast
                          ? "text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 border-indigo-100 dark:border-indigo-800"
                          : "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                      }`}
                    >
                      {n.is_broadcast ? (
                        <>
                          <FaBullhorn size={8} /> Broadcast
                        </>
                      ) : (
                        <>
                          <FaUser size={8} /> Targeted
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {n.message}
                  </p>
                </div>

                {/* Timestamp */}
                <div className="flex-shrink-0 text-right">
                  <p
                    className="text-xs font-medium text-gray-400 dark:text-gray-500"
                    title={fullTimestamp(n.created_at)}
                  >
                    {formatTimestamp(n.created_at)}
                  </p>
                  <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-0.5">
                    {fullTimestamp(n.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
