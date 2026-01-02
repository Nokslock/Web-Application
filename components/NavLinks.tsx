"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import AuthButton from "@/components/AuthButton";
import { AnimatePresence, motion } from "framer-motion";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client"; // <--- 1. Import Supabase
import { User } from "@supabase/supabase-js"; // Optional: Type import

const links = [
  { name: "About", href: "#" },
  { name: "Features", href: "#" },
  { name: "Contact", href: "#" },
  { name: "Download", href: "#" },
];

export default function NavLinks() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // 2. Add User State
  const [user, setUser] = useState<User | null>(null);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    setMounted(true);

    // 3. Fetch User on Mount
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  return (
    <>
      <div className="flex w-full items-center justify-end md:justify-center">
        {/* Desktop Menu */}
        <div className="hidden md:flex flex-row gap-2">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={clsx(
                "flex h-[48px] items-center justify-center gap-2 rounded-md px-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600",
                { "bg-sky-100 text-blue-600": pathname === link.href }
              )}
            >
              <p>{link.name}</p>
            </Link>
          ))}
        </div>

        {/* Hamburger Button */}
        {!isOpen && (
          <button
            className="ml-auto block md:hidden p-2 text-gray-700"
            onClick={() => setIsOpen(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        )}
      </div>

      {/* THE PORTAL */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
              >
                <button
                  className="absolute top-5 right-0 p-2 text-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-8 h-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                <div className="flex flex-col gap-8 text-center w-full max-w-xs">
                  {links.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={clsx(
                        "text-2xl font-medium text-gray-600 hover:text-blue-600 transition-colors",
                        { "text-blue-600 font-bold": pathname === link.href }
                      )}
                    >
                      {link.name}
                    </Link>
                  ))}

                  {/* 4. CONDITIONAL RENDERING: Dashboard vs Login/Register */}
                  <div className="pt-4 border-t border-gray-100 w-full flex flex-col gap-4">
                    {user ? (
                      // IF LOGGED IN: Show Dashboard
                      <Link href="/dashboard" className="w-full">
                        <AuthButton
                          variant="primary"
                          type="button"
                          className="w-full flex justify-center py-4 text-lg shadow-xl shadow-blue-200"
                        >
                          Go to Dashboard
                        </AuthButton>
                      </Link>
                    ) : (
                      // IF LOGGED OUT: Show Login/Register
                      <>
                        <Link href="/login" className="w-full">
                          <AuthButton
                            variant="primary"
                            type="button"
                            className="w-full flex justify-center"
                          >
                            Login
                          </AuthButton>
                        </Link>
                        <Link href="/register" className="w-full">
                          <AuthButton
                            variant="outline"
                            type="button"
                            className="w-full flex justify-center"
                          >
                            Create Account
                          </AuthButton>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}