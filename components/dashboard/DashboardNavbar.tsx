"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaXmark, FaCrown, FaShieldHalved } from "react-icons/fa6";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { IoSettingsSharp } from "react-icons/io5";
import { BsFillShieldFill } from "react-icons/bs";
import clsx from "clsx";

import HomeLogo from "@/components/HomeLogo";
import ThemeToggle from "@/components/ThemeToggle";
import SignOutButton from "@/components/SignOutButton";
import Pfp from "@/public/pfp-default.jpg";

interface DashboardNavbarProps {
  user: any;
  fullName?: string;
  email: string;
}

const links = [
  { name: "Dashboard", href: "/dashboard", icon: TbLayoutDashboardFilled },
  { name: "Vault", href: "/dashboard/vault", icon: BsFillShieldFill },
  { name: "Settings", href: "/dashboard/settings", icon: IoSettingsSharp },
];

export default function DashboardNavbar({
  user,
  fullName,
  email,
}: DashboardNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Avatar Logic
  const avatarUrl = user?.user_metadata?.avatar_url || Pfp;
  const meta = user?.user_metadata || {};
  const firstName = meta.first_name;
  const lastName = meta.last_name;
  const displayName =
    firstName && lastName
      ? `${firstName} ${lastName}`
      : fullName || meta.full_name || "User";

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6">
        <div className="flex justify-between lg:grid lg:grid-cols-3 items-center h-16">
          {/* LEFT: Logo */}
          <div className="flex justify-start">
            <HomeLogo />
          </div>

          {/* CENTER: Desktop Nav Links (Redesigned) */}
          <div className="hidden lg:flex justify-center">
            <div className="flex items-center gap-1 bg-neutral-100/50 dark:bg-neutral-900/50 p-1.5 rounded-full border border-neutral-200/50 dark:border-neutral-800/50 backdrop-blur-sm">
              {links.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={clsx(
                      "relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-colors duration-200 z-10",
                      isActive
                        ? "text-neutral-900 dark:text-white"
                        : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200",
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-full shadow-sm border border-neutral-200/50 dark:border-neutral-700 -z-10"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                    <Icon className="relative z-10 text-lg" />
                    <span className="relative z-10">{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Actions (Theme, User, Mobile Toggle) */}
          <div className="flex items-center justify-end gap-4">
            {/* Admin Link (Only for Super Admins) */}
            {user?.user_metadata?.role === "super_admin" && (
              <Link
                href="/admin"
                className="hidden sm:flex group items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all hover:scale-105"
              >
                <FaShieldHalved className="text-xs" />
                <span className="text-xs font-bold">Admin</span>
              </Link>
            )}

            {/* Promo Button (Hidden on small mobile) */}
            <Link
              href="/pricing"
              className="hidden sm:flex group items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg transition-all hover:scale-105"
            >
              <FaCrown className="text-xs animate-pulse" />
              <span className="text-xs font-bold">Upgrade</span>
            </Link>

            <ThemeToggle />

            {/* User Dropdown / Profile (Desktop) */}
            <div className="hidden lg:flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-gray-800 relative group">
              <div className="text-right hidden xl:block">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[100px]">
                  {displayName}
                </p>
                <p className="text-[10px] text-gray-500 truncate max-w-[100px]">
                  {email}
                </p>
              </div>
              <div className="h-9 w-9 relative rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer">
                <Image
                  src={avatarUrl}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Hover Dropdown */}
              <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-1 min-w-[160px]">
                  <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{displayName}</p>
                    <p className="text-[10px] text-gray-400 truncate">{email}</p>
                  </div>
                  <div className="p-1">
                    <SignOutButton className="flex items-center gap-2 w-full px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" showLabel />
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              {isMobileMenuOpen ? <FaXmark size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-950"
          >
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Links */}
              <div className="space-y-1">
                {links.map((link) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={clsx(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold",
                        isActive
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-black"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800",
                      )}
                    >
                      <Icon size={18} />
                      {link.name}
                    </Link>
                  );
                })}
              </div>

              {/* Mobile Profile & Actions */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 relative rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                    <Image
                      src={avatarUrl}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-500">{email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/pricing"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex justify-center items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm"
                  >
                    <FaCrown size={12} /> Upgrade
                  </Link>
                  <div className="rounded-lg overflow-hidden">
                    <SignOutButton className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors" showLabel />
                  </div>
                </div>

                {/* Mobile Admin Link */}
                {user?.user_metadata?.role === "super_admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="mt-3 flex justify-center items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 font-bold text-sm w-full"
                  >
                    <FaShieldHalved size={12} /> Access Admin Portal
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
