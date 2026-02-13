"use client";

import Link from "next/link";
import { FaShieldHalved, FaArrowLeft } from "react-icons/fa6";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-white">
      {/* Super Admin Navbar */}
      <nav className="h-16 bg-gray-900 text-white flex items-center justify-between px-6 shadow-md sticky top-0 z-50">
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

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 md:py-10">
        {children}
      </main>
    </div>
  );
}
