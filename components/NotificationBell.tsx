"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { FaBell, FaXmark } from "react-icons/fa6";
import {
  IoMailUnread,
  IoShieldCheckmark,
  IoWarning,
  IoCheckmarkCircle,
} from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/app/actions/notifications";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMyNotifications();
      setNotifications(data);
      setInitialLoaded(true);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount and poll every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Refetch when dropdown opens
  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen, fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read optimistically
    if (!notification.is_read) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, is_read: true } : n,
        ),
      );
      markNotificationRead(notification.id).catch(() => fetchNotifications());
    }
    // Open detail modal
    setSelectedNotification({ ...notification, is_read: true });
    setIsOpen(false);
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    markAllNotificationsRead().catch(() => fetchNotifications());
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Bell Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative flex items-center justify-center h-10 w-10 rounded-full border transition-all duration-200 ${
            isOpen
              ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-400"
              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          <FaBell className="text-lg" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-900">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown */}
        <div
          className={`absolute right-0 mt-3 w-80 md:w-96 origin-top-right transform rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl transition-all duration-200 ease-out z-50 ${
            isOpen
              ? "scale-100 opacity-100 translate-y-0"
              : "scale-95 opacity-0 -translate-y-2 pointer-events-none"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-800 dark:text-white">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Scrollable List */}
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {loading && !initialLoaded ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <FaBell size={24} className="mb-2 opacity-30" />
                <p className="text-sm font-medium">No notifications yet</p>
                <p className="text-xs mt-0.5">You&apos;re all caught up!</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`group flex gap-4 border-b border-gray-50 dark:border-gray-800 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${
                    !notification.is_read
                      ? "bg-blue-50/30 dark:bg-blue-900/10"
                      : "bg-transparent"
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    <NotificationIcon type={notification.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <p
                        className={`text-sm truncate ${
                          !notification.is_read
                            ? "font-semibold text-gray-900 dark:text-gray-100"
                            : "font-medium text-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {notification.title}
                      </p>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap ml-2 flex-shrink-0">
                        {timeAgo(notification.created_at)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-1">
                      {notification.message}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500 dark:bg-blue-400" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl border-t border-gray-100 dark:border-gray-800">
              <p className="w-full py-2 text-xs font-medium text-gray-400 text-center">
                {notifications.length} notification
                {notifications.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── NOTIFICATION DETAIL MODAL ─── */}
      <AnimatePresence>
        {selectedNotification && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setSelectedNotification(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md overflow-hidden"
            >
              {/* Modal Header */}
              <div
                className={`px-6 py-5 flex items-start justify-between gap-4 ${
                  selectedNotification.type === "security"
                    ? "bg-red-50 dark:bg-red-900/10"
                    : selectedNotification.type === "warning"
                      ? "bg-amber-50 dark:bg-amber-900/10"
                      : selectedNotification.type === "success"
                        ? "bg-emerald-50 dark:bg-emerald-900/10"
                        : "bg-blue-50 dark:bg-blue-900/10"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5">
                    <NotificationIcon
                      type={selectedNotification.type}
                      size="lg"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">
                      {selectedNotification.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatFullDate(selectedNotification.created_at)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors flex-shrink-0"
                >
                  <FaXmark size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-5">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {selectedNotification.message}
                </p>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="w-full py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// Helper component for icons
function NotificationIcon({
  type,
  size = "sm",
}: {
  type: string;
  size?: "sm" | "lg";
}) {
  const dim = size === "lg" ? "h-10 w-10 text-xl" : "h-8 w-8";

  switch (type) {
    case "security":
      return (
        <div
          className={`flex ${dim} items-center justify-center rounded-full bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400`}
        >
          <IoWarning />
        </div>
      );
    case "success":
      return (
        <div
          className={`flex ${dim} items-center justify-center rounded-full bg-emerald-100 text-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-400`}
        >
          <IoCheckmarkCircle />
        </div>
      );
    case "warning":
      return (
        <div
          className={`flex ${dim} items-center justify-center rounded-full bg-orange-100 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400`}
        >
          <IoWarning />
        </div>
      );
    case "info":
    default:
      return (
        <div
          className={`flex ${dim} items-center justify-center rounded-full bg-blue-100 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400`}
        >
          <IoMailUnread />
        </div>
      );
  }
}
