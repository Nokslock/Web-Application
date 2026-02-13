import { getAdminStats, getUsersList } from "@/app/actions/admin";
import AdminStats from "@/components/admin/AdminStats";
import SignupChart from "@/components/admin/SignupChart";
import UserBreakdown from "@/components/admin/UserBreakdown";
import UsersTable from "@/components/admin/UsersTable";
import NotificationComposer from "@/components/admin/NotificationComposer";
import { Suspense } from "react";
import { FaSpinner } from "react-icons/fa6";

export const dynamic = "force-dynamic";

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center p-10">
      <FaSpinner className="animate-spin text-gray-400" size={20} />
    </div>
  );
}

export default async function AdminPage() {
  const [stats, users] = await Promise.all([
    getAdminStats(),
    getUsersList(1, 100),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Real-time platform metrics and user management.
          </p>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
          Last updated:{" "}
          {new Date().toLocaleString("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<LoadingSpinner />}>
        <AdminStats stats={stats} />
      </Suspense>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Suspense fallback={<LoadingSpinner />}>
            <SignupChart timeline={stats.signupTimeline} />
          </Suspense>
        </div>
        <div className="lg:col-span-1 flex flex-col">
          <Suspense fallback={<LoadingSpinner />}>
            <UserBreakdown
              roleDistribution={stats.roleDistribution}
              providerBreakdown={stats.providerBreakdown}
              totalUsers={stats.totalUsers}
            />
          </Suspense>
        </div>
      </div>

      {/* Notification Composer + Users Table side by side on large screens */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <NotificationComposer users={users} />
        </div>
        <div className="xl:col-span-2">
          <Suspense fallback={<LoadingSpinner />}>
            <UsersTable users={users} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
