"use client";

import { useState, useMemo } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import {
  IoKey,
  IoCard,
  IoWallet,
  IoDocumentText,
  IoTimeOutline,
  IoAddCircleOutline,
  IoCreateOutline,
} from "react-icons/io5";
import { formatDistanceToNow } from "date-fns";
import { FaXmark, FaLock, FaShieldHalved, FaBoxesStacked, FaCubesStacked, FaHandHoldingHeart } from "react-icons/fa6";
import StorageUsageCard from "./StorageUsageCard";

const boxVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};



interface DashboardHomeProps {
  items?: any[];
}

export default function DashboardHome({ items = [] }: DashboardHomeProps) {
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);

  // --- LOGIC: Calculate Recent Activity ---
  const recentActivity = useMemo(() => {
    if (!items || items.length === 0) return [];

    return items
      .map((item) => {
        // Determine if it was just added or updated
        const createdAt = new Date(item.created_at).getTime();
        // If updated_at is null, fallback to created_at
        const updatedAt = item.updated_at
          ? new Date(item.updated_at).getTime()
          : createdAt;

        // If updated time is significantly later than created time (e.g., > 1 minute), count as 'modified'
        const isModified = updatedAt - createdAt > 60000;

        return {
          ...item,
          activityType: isModified ? "modified" : "added",
          timestamp: updatedAt, // Sort by the latest action
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp); // Descending order
  }, [items]);

  // Top 5 for the card
  const topActivity = recentActivity.slice(0, 5);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 md:gap-8 mt-2">
        {/* Recent Activity Card */}
        <motion.div
          variants={boxVariants}
          initial="hidden"
          animate="visible"
          className="h-[36rem] col-span-1 lg:col-span-4 p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
        >
          <div className="flex justify-between items-center mb-5 shrink-0">
            <h2 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
              <IoTimeOutline className="text-blue-500" /> Recent Activity
            </h2>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            {topActivity.length > 0 ? (
              <div className="space-y-3">
                {topActivity.map((item) => (
                  <ActivityItem key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 p-6 group">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  className="h-14 w-14 bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-400 mb-3"
                >
                  <IoTimeOutline size={24} />
                </motion.div>
                <p className="text-gray-600 dark:text-gray-300 font-bold text-sm">
                  No recent activity
                </p>
                <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
                  Items you add or edit will appear here.
                </p>
              </div>
            )}
          </div>

          {/* View All Button (Bottom) */}
          {recentActivity.length > 0 && (
            <button
              onClick={() => setIsViewAllOpen(true)}
              className="w-full py-3 mt-4 rounded-xl font-bold text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400 transition-colors"
            >
              View All Activity
            </button>
          )}
        </motion.div>

        <div className="col-span-1 lg:col-span-3 flex flex-col gap-6 h-[36rem]">
          {/* Vault Insights Card */}
          <motion.div
            variants={boxVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                <FaShieldHalved className="text-blue-500" /> Vault Insights
              </h2>
              <span className="text-[10px] text-gray-400 font-medium">
                {items.length} total items
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 flex-1">
              <InsightTile
                icon={<FaCubesStacked />}
                label="Total Items"
                count={items.length}
                color="blue"
              />
              <InsightTile
                icon={<FaLock />}
                label="Locked"
                count={items.filter((i: any) => i.is_locked).length}
                color="emerald"
              />
              <InsightTile
                icon={<FaHandHoldingHeart />}
                label="Shared with NOK"
                count={items.filter((i: any) => i.share_with_nok).length}
                color="amber"
              />
              <InsightTile
                icon={<FaBoxesStacked />}
                label="In Vaults"
                count={items.filter((i: any) => i.vault_id).length}
                color="indigo"
              />
            </div>
          </motion.div>

          {/* Storage Usage Card */}
          <StorageUsageCard />
        </div>
      </div>

      {/* --- View All Modal --- */}
      <AnimatePresence>
        {isViewAllOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsViewAllOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <IoTimeOutline className="text-blue-600" /> Activity History
                </h2>
                <button
                  onClick={() => setIsViewAllOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  <FaXmark className="text-gray-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-3">
                {recentActivity.slice(0, 15).map((item) => (
                  <ActivityItem key={item.id} item={item} />
                ))}
              </div>

              <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 text-center">
                <p className="text-xs text-gray-400">
                  Showing last 15 activities
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function ActivityItem({ item }: { item: any }) {
  const isModified = item.activityType === "modified";

  // Icon Logic
  const getIcon = (type: string) => {
    switch (type) {
      case "password":
        return <IoKey />;
      case "card":
        return <IoCard />;
      case "crypto":
        return <IoWallet />;
      case "file":
        return <IoDocumentText />;
      default:
        return <IoKey />;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case "password":
        return "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400";
      case "card":
        return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
      case "crypto":
        return "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400";
      case "file":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl transition-colors group cursor-default border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
      <div
        className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center text-base sm:text-lg shadow-sm shrink-0 ${getColors(item.type)}`}
      >
        {getIcon(item.type)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h4 className="font-bold text-gray-800 dark:text-white truncate pr-2 text-sm">
            {item.name}
          </h4>
        </div>
        <p className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
          {item.is_locked && (
            <span className="text-amber-500 font-bold flex items-center gap-1 mr-1">
              <FaLock size={10} />{" "}
              <span className="hidden xs:inline">Locked</span>
            </span>
          )}
          {isModified ? (
            <span className="text-amber-500 font-bold flex items-center gap-1">
              <IoCreateOutline />{" "}
              <span className="hidden xs:inline">Modified</span>
            </span>
          ) : (
            <span className="text-emerald-500 font-bold flex items-center gap-1">
              <IoAddCircleOutline />{" "}
              <span className="hidden xs:inline">Added</span>
            </span>
          )}
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          {formatDistanceToNow(item.timestamp, { addSuffix: true })}
        </p>
      </div>

      {/* Hide Type Label on Mobile/Tablet to save space, relies on Icon + Color */}
      <div className="hidden sm:block text-[10px] font-bold uppercase tracking-wider text-gray-300 group-hover:text-gray-400 transition-colors">
        {item.type}
      </div>
    </div>
  );
}

const insightColors: Record<string, { bg: string; text: string; iconBg: string }> = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/40",
    text: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/40",
    text: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/40",
    text: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
  },
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800/40",
    text: "text-indigo-600 dark:text-indigo-400",
    iconBg: "bg-indigo-100 dark:bg-indigo-900/40",
  },
};

function InsightTile({ icon, label, count, color }: { icon: React.ReactNode; label: string; count: number; color: string }) {
  const c = insightColors[color] || insightColors.blue;
  return (
    <div className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border ${c.bg} transition-all duration-200 hover:scale-[1.03]`}>
      <div className={`h-9 w-9 rounded-full flex items-center justify-center ${c.iconBg} ${c.text}`}>
        {icon}
      </div>
      <motion.span
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className={`text-2xl font-black ${c.text}`}
      >
        {count}
      </motion.span>
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center leading-tight">
        {label}
      </span>
    </div>
  );
}
