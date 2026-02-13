"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import ThemeToggle from "@/components/ThemeToggle";
import { AnimatePresence, motion } from "framer-motion";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { User } from "@supabase/supabase-js";
import { FaArrowRight } from "react-icons/fa6";

const links = [
  { name: "Features", href: "/#features" },
  { name: "How It Works", href: "/#how-it-works" },
  { name: "Security", href: "/#security" },
  { name: "Contact", href: "/#contact" },
];

export default function NavLinks() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    setMounted(true);
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  return (
    <>
      {/* Desktop Menu */}
      <div className="hidden md:flex items-center">
        <div className="flex items-center bg-gray-100/80 dark:bg-gray-800/60 rounded-xl p-1">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={clsx(
                "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                pathname === link.href
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50",
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Hamburger */}
      {!isOpen && (
        <button
          className="ml-auto block md:hidden p-2 text-gray-700 dark:text-white"
          onClick={() => setIsOpen(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
      )}

      {/* Mobile Menu Portal */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-[9999] bg-white dark:bg-gray-950"
              >
                {/* Close Button */}
                <div className="flex justify-end p-5">
                  <button
                    className="p-2 text-gray-700 dark:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Mobile Menu Content */}
                <div className="flex flex-col items-center justify-center gap-2 px-8 pt-8">
                  {links.map((link, i) => (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 + 0.1 }}
                      className="w-full max-w-sm"
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={clsx(
                          "block text-center text-lg font-medium py-4 rounded-xl transition-all",
                          pathname === link.href
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900",
                        )}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  ))}

                  {/* Divider */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="w-full max-w-sm border-t border-gray-100 dark:border-gray-800 my-4"
                  />

                  {/* Theme Toggle */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="flex items-center gap-3 mb-4"
                  >
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Theme
                    </span>
                    <ThemeToggle />
                  </motion.div>

                  {/* Auth Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="w-full max-w-sm flex flex-col gap-3"
                  >
                    {user ? (
                      <Link
                        href="/dashboard"
                        className="w-full"
                        onClick={() => setIsOpen(false)}
                      >
                        <button className="w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-base font-semibold py-4 rounded-xl shadow-lg transition-all">
                          Go to Dashboard
                          <FaArrowRight className="text-sm" />
                        </button>
                      </Link>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className="w-full"
                          onClick={() => setIsOpen(false)}
                        >
                          <button className="w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-base font-semibold py-4 rounded-xl shadow-lg transition-all">
                            Get Started
                            <FaArrowRight className="text-sm" />
                          </button>
                        </Link>
                        <Link
                          href="/register"
                          className="w-full"
                          onClick={() => setIsOpen(false)}
                        >
                          <button className="w-full text-base font-medium py-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                            Create Account
                          </button>
                        </Link>
                      </>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
