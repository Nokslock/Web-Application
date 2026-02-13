import { getAdminStats, getUsersList } from "@/app/actions/admin";
import AdminStats from "@/components/admin/AdminStats";
import UsersTable from "@/components/admin/UsersTable";
import { Suspense } from "react";
import { FaSpinner } from "react-icons/fa6";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // Parallel Fetching
  const statsData = getAdminStats();
  const usersData = getUsersList(1, 100);

  const [stats, users] = await Promise.all([statsData, usersData]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Overview
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Platform metrics and user management.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center p-10">
            <FaSpinner className="animate-spin" />
          </div>
        }
      >
        <AdminStats stats={stats} />
      </Suspense>

      <Suspense
        fallback={
          <div className="flex justify-center p-10">
            <FaSpinner className="animate-spin" />
          </div>
        }
      >
        <UsersTable users={users} />
      </Suspense>
    </div>
  );
}
