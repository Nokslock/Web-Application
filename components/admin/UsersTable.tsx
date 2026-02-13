import { FaUser } from "react-icons/fa6";
import { format } from "date-fns";
import UserRowActions from "./UserRowActions";

type User = {
  id: string;
  email?: string;
  full_name?: string;
  role?: string;
  created_at: string;
  last_sign_in_at?: string;
};

export default function UsersTable({ users }: { users: User[] }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
          All Users
        </h3>
        <span className="text-xs font-semibold px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
          {users.length} Records
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
          <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                      <FaUser />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {user.full_name || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${user.role === "super_admin" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"}
                  `}
                  >
                    {user.role === "super_admin"
                      ? "Admin"
                      : user.role || "user"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {user.last_sign_in_at ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Active {format(new Date(user.last_sign_in_at), "MMM d")}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                      <span className="text-xs text-gray-500">Never</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {format(new Date(user.created_at), "MMM d, yyyy")}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end">
                    <UserRowActions user={user} />
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
