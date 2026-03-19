import { getUsersList } from "@/app/actions/admin";
import UsersTable from "@/components/admin/UsersTable";
import { Suspense } from "react";
import { FaSpinner } from "react-icons/fa6";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await getUsersList(1, 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">
          Users
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Manage accounts, roles, and access.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center items-center p-10">
            <FaSpinner className="animate-spin text-gray-400" size={20} />
          </div>
        }
      >
        <UsersTable users={users} />
      </Suspense>
    </div>
  );
}
