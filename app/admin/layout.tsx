"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaShieldHalved,
  FaArrowLeft,
  FaGauge,
  FaUsers,
  FaCreditCard,
  FaSkull,
  FaBullhorn,
} from "react-icons/fa6";

const navItems = [
  { label: "Overview", href: "/admin", icon: FaGauge, exact: true },
  { label: "Users", href: "/admin/users", icon: FaUsers },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: FaCreditCard },
  { label: "Dead Man's Switch", href: "/admin/dead-man-switch", icon: FaSkull },
  { label: "Notifications", href: "/admin/notifications", icon: FaBullhorn },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  function isActive(item: (typeof navItems)[number]) {
    return item.exact ? pathname === item.href : pathname.startsWith(item.href);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-white flex flex-col">
      {/* Top navbar */}
      <nav className="h-16 bg-gray-900 text-white flex items-center justify-between px-6 shadow-md sticky top-0 z-50 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
            title="Back to Dashboard"
          >
            <FaArrowLeft />
          </Link>
          <div className="flex items-center gap-2">
            <FaShieldHalved className="text-red-500" size={20} />
            <span className="font-bold text-lg tracking-tight">
              Admin Portal
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs font-mono bg-red-500/20 text-red-200 px-2 py-1 rounded border border-red-500/50">
            Authorized Access Only
          </div>
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold">
            A
          </div>
        </div>
      </nav>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar — hidden on mobile */}
        <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="p-3 space-y-1 flex-1">
            {navItems.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <item.icon
                    size={15}
                    className={
                      active
                        ? "text-white dark:text-gray-900"
                        : "text-gray-400 dark:text-gray-500"
                    }
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile tab bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-semibold transition-colors ${
                  active
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                <item.icon size={16} />
                <span className="truncate max-w-[48px] text-center leading-tight">
                  {item.label.split(" ")[0]}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Page content */}
        <main className="flex-1 min-w-0 px-4 md:px-6 py-6 md:py-8 pb-24 lg:pb-8 overflow-auto">
          <div className="max-w-[1400px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
