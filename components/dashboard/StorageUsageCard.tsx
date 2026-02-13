"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaCloudArrowUp, FaDatabase } from "react-icons/fa6";
import { getStorageUsage } from "@/app/actions/storage";

export default function StorageUsageCard() {
  const [usage, setUsage] = useState({
    used: 0,
    total: 2 * 1024 * 1024 * 1024,
    percentage: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const data = await getStorageUsage();
        setUsage(data);
      } catch (error) {
        console.error("Failed to fetch storage usage:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, []);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between min-h-[140px]"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
            <FaDatabase className="text-purple-500" /> Storage Usage
          </h2>
          <p className="text-[10px] text-gray-400 font-medium">
            {loading
              ? "Calculating..."
              : `${formatBytes(usage.used)} of ${formatBytes(usage.total)} used`}
          </p>
        </div>
        <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center">
          <FaCloudArrowUp size={18} />
        </div>
      </div>

      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-4 overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${usage.percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${
            usage.percentage > 90
              ? "bg-red-500"
              : usage.percentage > 75
                ? "bg-orange-500"
                : "bg-gradient-to-r from-purple-500 to-indigo-600"
          }`}
        />
      </div>

      <div className="mt-2 flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
        <span>0 GB</span>
        <span>2 GB Limit</span>
      </div>
    </motion.div>
  );
}
