import { FaUsers, FaUserCheck, FaUserPlus } from "react-icons/fa6";

export default function AdminStats({
  stats,
}: {
  stats: { totalUsers: number; activeUsers: number; newSignups: number };
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Users */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
          <FaUsers size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Users
          </p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalUsers}
          </h3>
        </div>
      </div>

      {/* Active Users */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
        <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl">
          <FaUserCheck size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Active Users (30d)
          </p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.activeUsers}
          </h3>
        </div>
      </div>

      {/* New Signups */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl">
          <FaUserPlus size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            New Signups (7d)
          </p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.newSignups}
          </h3>
        </div>
      </div>
    </div>
  );
}
