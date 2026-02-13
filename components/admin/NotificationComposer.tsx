"use client";

import { useState } from "react";
import { sendNotification } from "@/app/actions/notifications";
import { toast } from "sonner";
import {
  FaPaperPlane,
  FaBullhorn,
  FaUser,
  FaCircleInfo,
  FaCircleCheck,
  FaTriangleExclamation,
  FaShieldHalved,
} from "react-icons/fa6";

const notificationTypes = [
  {
    value: "info",
    label: "Info",
    icon: FaCircleInfo,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
  },
  {
    value: "success",
    label: "Success",
    icon: FaCircleCheck,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
  },
  {
    value: "warning",
    label: "Warning",
    icon: FaTriangleExclamation,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
  },
  {
    value: "security",
    label: "Security",
    icon: FaShieldHalved,
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
  },
] as const;

type User = {
  id: string;
  email?: string;
  full_name?: string;
};

export default function NotificationComposer({ users }: { users: User[] }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"info" | "success" | "warning" | "security">(
    "info",
  );
  const [target, setTarget] = useState<"all" | "single">("all");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  const filteredUsers = users.filter((u) => {
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return (
      u.email?.toLowerCase().includes(q) ||
      u.full_name?.toLowerCase().includes(q)
    );
  });

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required");
      return;
    }
    if (target === "single" && !selectedUserId) {
      toast.error("Please select a user");
      return;
    }

    setLoading(true);
    try {
      await sendNotification({
        title: title.trim(),
        message: message.trim(),
        type,
        target,
        userId: target === "single" ? selectedUserId : undefined,
      });

      toast.success(
        target === "all"
          ? "Broadcast sent to all users!"
          : "Notification sent to user!",
      );

      // Reset form
      setTitle("");
      setMessage("");
      setType("info");
      setSelectedUserId("");
      setUserSearch("");
      setSentCount((c) => c + 1);
    } catch (error: any) {
      toast.error(error.message || "Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <FaBullhorn
              className="text-blue-600 dark:text-blue-400"
              size={16}
            />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">
              Send Notification
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Compose and send to users
            </p>
          </div>
        </div>
        {sentCount > 0 && (
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-lg">
            {sentCount} sent
          </span>
        )}
      </div>

      <div className="p-6 space-y-5">
        {/* Target toggle */}
        <div>
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
            Target
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setTarget("all")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border transition-all ${
                target === "all"
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                  : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              }`}
            >
              <FaBullhorn size={14} /> All Users
            </button>
            <button
              onClick={() => setTarget("single")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border transition-all ${
                target === "single"
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                  : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              }`}
            >
              <FaUser size={14} /> Specific User
            </button>
          </div>
        </div>

        {/* User selector (only for single) */}
        {target === "single" && (
          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
              Select User
            </label>
            <input
              type="text"
              placeholder="Search users..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 mb-2"
            />
            <div className="max-h-32 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
              {filteredUsers.slice(0, 10).map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setSelectedUserId(u.id);
                    setUserSearch(u.email || u.full_name || "");
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between ${
                    selectedUserId === u.id
                      ? "bg-blue-50 dark:bg-blue-900/10"
                      : ""
                  }`}
                >
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {u.full_name || "Unknown"}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      {u.email}
                    </span>
                  </div>
                  {selectedUserId === u.id && (
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </button>
              ))}
              {filteredUsers.length === 0 && (
                <p className="px-4 py-3 text-xs text-gray-400 text-center">
                  No users found
                </p>
              )}
            </div>
          </div>
        )}

        {/* Type selection */}
        <div>
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
            Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {notificationTypes.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  type === t.value
                    ? t.bg
                    : "border-gray-200 dark:border-gray-700 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <t.icon className={type === t.value ? t.color : ""} size={14} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
            Title
          </label>
          <input
            type="text"
            placeholder="e.g. System Maintenance Scheduled"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
          />
        </div>

        {/* Message */}
        <div>
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
            Message
          </label>
          <textarea
            placeholder="Write the notification message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            rows={3}
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
          />
          <p className="text-[10px] text-gray-400 mt-1 text-right">
            {message.length}/500
          </p>
        </div>

        {/* Preview */}
        {title && (
          <div className="p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Preview
            </p>
            <div className="flex gap-3 items-start">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  type === "info"
                    ? "bg-blue-100 text-blue-500 dark:bg-blue-900/30"
                    : type === "success"
                      ? "bg-emerald-100 text-emerald-500 dark:bg-emerald-900/30"
                      : type === "warning"
                        ? "bg-amber-100 text-amber-500 dark:bg-amber-900/30"
                        : "bg-red-100 text-red-500 dark:bg-red-900/30"
                }`}
              >
                {type === "info" && <FaCircleInfo size={14} />}
                {type === "success" && <FaCircleCheck size={14} />}
                {type === "warning" && <FaTriangleExclamation size={14} />}
                {type === "security" && <FaShieldHalved size={14} />}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {title}
                </p>
                {message && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                    {message}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={loading || !title.trim() || !message.trim()}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200 dark:shadow-none"
        >
          <FaPaperPlane size={13} />
          {loading
            ? "Sending..."
            : target === "all"
              ? "Broadcast to All Users"
              : "Send to User"}
        </button>
      </div>
    </div>
  );
}
