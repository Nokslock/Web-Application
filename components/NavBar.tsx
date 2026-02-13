"use client";

import { useState, useEffect } from "react";
import HomeLogo from "@/components/HomeLogo";
import NavLinks from "@/components/NavLinks";
import Link from "next/link";
import clsx from "clsx";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import ThemeToggle from "@/components/ThemeToggle";
import { FaArrowRight } from "react-icons/fa6";

export default function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);

    const checkUser = async () => {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={clsx(
        "fixed inset-x-0 top-0 w-full z-50 transition-all duration-500 ease-in-out",
        {
          "bg-transparent py-5": !isScrolled,
          "py-3": isScrolled,
        },
      )}
    >
      {/* Glassmorphism container that appears on scroll */}
      <div
        className={clsx("mx-auto transition-all duration-500 ease-in-out", {
          "max-w-full px-5 lg:px-20": !isScrolled,
          "max-w-5xl px-4 mx-4 lg:mx-auto": isScrolled,
        })}
      >
        <div
          className={clsx(
            "flex items-center justify-between transition-all duration-500",
            {
              "": !isScrolled,
              "bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-lg shadow-black/5 dark:shadow-black/20 px-4 py-2":
                isScrolled,
            },
          )}
        >
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <HomeLogo />
          </div>

          {/* Center Nav Links (Desktop) */}
          <NavLinks />

          {/* Right Side Actions (Desktop) */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <ThemeToggle />
            <Link href={user ? "/dashboard" : "/login"}>
              <button className="group flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-200 shadow-sm hover:shadow-md">
                {user ? "Dashboard" : "Get Started"}
                <FaArrowRight className="text-xs transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
