"use client";

import { useState, useRef, useEffect } from "react";
import { FaBell } from "react-icons/fa6";
import { IoMailUnread, IoShieldCheckmark, IoWarning } from "react-icons/io5";

// Dummy Data
const NOTIFICATIONS = [
  {
    id: 1,
    title: "New Login Detected",
    message: "A new login was detected from Lagos, Nigeria.",
    time: "2 min ago",
    type: "security",
    unread: true,
  },
  {
    id: 2,
    title: "Vault Backup Successful",
    message: "Your encrypted vault was successfully backed up to the cloud.",
    time: "1 hour ago",
    type: "success",
    unread: true,
  },
  {
    id: 3,
    title: "Subscription Expiring",
    message: "Your premium plan expires in 3 days. Renew now to avoid interruption.",
    time: "5 hours ago",
    type: "warning",
    unread: false,
  },
  {
    id: 4,
    title: "Welcome to Nockslock",
    message: "Thanks for joining! Here are some tips to get started.",
    time: "1 day ago",
    type: "info",
    unread: false,
  },
];

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center justify-center h-10 w-10 rounded-full border transition-all duration-200 ${
          isOpen
            ? "bg-blue-50 border-blue-200 text-blue-600"
            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
        }`}
      >
        <FaBell className="text-lg" />
        
        {/* Red Dot Counter */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Animated Overlay */}
      <div
        className={`absolute right-0 mt-3 w-80 md:w-96 origin-top-right transform rounded-2xl border border-gray-100 bg-white shadow-xl transition-all duration-200 ease-out z-50 ${
          isOpen
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Notifications</h3>
          <button className="text-xs text-end text-blue-500 hover:text-blue-600 font-medium">
            Mark all as read
          </button>
        </div>

        {/* Scrollable List */}
        <div className="max-h-[400px] overflow-y-auto">
          {NOTIFICATIONS.map((notification) => (
            <div
              key={notification.id}
              className={`group flex gap-4 border-b border-gray-50 px-4 py-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                notification.unread ? "bg-blue-50/30" : ""
              }`}
            >
              {/* Icon based on type */}
              <div className="flex-shrink-0 mt-1">
                <NotificationIcon type={notification.type} />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <p className={`text-sm ${notification.unread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                    {notification.title}
                  </p>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                    {notification.time}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed line-clamp-2">
                  {notification.message}
                </p>
              </div>

              {/* Unread Indicator Dot */}
              {notification.unread && (
                <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-2 bg-gray-50 rounded-b-2xl">
          <button className="w-full py-2 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-200/50 rounded-lg transition-colors">
            View all notifications
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper component for icons
function NotificationIcon({ type }: { type: string }) {
  switch (type) {
    case "security":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-500">
          <IoWarning />
        </div>
      );
    case "success":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-500">
          <IoShieldCheckmark />
        </div>
      );
    case "info":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-500">
          <IoMailUnread />
        </div>
      );
    default:
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-500">
          <IoWarning />
        </div>
      );
  }
}