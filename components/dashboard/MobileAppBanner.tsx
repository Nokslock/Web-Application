"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaXmark, FaApple, FaGooglePlay } from "react-icons/fa6";
import { IoPhonePortraitOutline } from "react-icons/io5";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/payments";

// Bumped so users who dismissed the old "coming soon" banner see the new one.
const DISMISSED_KEY = "nokslock_app_banner_dismissed_v2";

export default function MobileAppBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(DISMISSED_KEY)) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, "1");
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl border border-blue-200 dark:border-blue-800/50 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-4 sm:p-5 shadow-lg shadow-blue-500/10 mb-6"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white" />
            <div className="absolute -left-4 -bottom-10 h-32 w-32 rounded-full bg-white" />
          </div>

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <IoPhonePortraitOutline className="text-white text-xl sm:text-2xl" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white text-sm sm:text-base truncate">
                  Get the Nokslock app
                </p>
                <p className="text-blue-100 text-xs sm:text-sm mt-0.5 truncate">
                  Manage your vault on the go — now on iOS &amp; Android.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
              >
                <FaApple className="text-sm" />
                <span className="hidden sm:inline">App Store</span>
              </a>
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
              >
                <FaGooglePlay className="text-xs" />
                <span className="hidden sm:inline">Google Play</span>
              </a>
              <button
                onClick={dismiss}
                className="h-8 w-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                aria-label="Dismiss banner"
              >
                <FaXmark className="text-white text-sm" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
