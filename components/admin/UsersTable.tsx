"use client";

import { useState, useMemo } from "react";
import { FaUser, FaMagnifyingGlass, FaXmark } from "react-icons/fa6";
import { format } from "date-fns";
import UserRowActions from "./UserRowActions";

type User = {
  id: string;
  email?: string;
  full_name?: string;
  role?: string;
  provider?: string;
  email_confirmed?: boolean;
  created_at: string;
  last_sign_in_at?: string;
};

type FilterRole = "all" | "super_admin" | "user";
type FilterStatus = "all" | "active" | "inactive";

export default function UsersTable({ users }: { users: User[] }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<FilterRole>("all");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");

  const thirtyDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search
      if (search) {
        const q = search.toLowerCase();
        const matchName = user.full_name?.toLowerCase().includes(q);
        const matchEmail = user.email?.toLowerCase().includes(q);
        if (!matchName && !matchEmail) return false;
      }

      // Role
      if (roleFilter !== "all" && user.role !== roleFilter) return false;

      // Status
      if (statusFilter === "active") {
        if (
          !user.last_sign_in_at ||
          new Date(user.last_sign_in_at) <= thirtyDaysAgo
        )
          return false;
      }
      if (statusFilter === "inactive") {
        if (
          user.last_sign_in_at &&
          new Date(user.last_sign_in_at) > thirtyDaysAgo
        )
          return false;
      }

      return true;
    });
  }, [users, search, roleFilter, statusFilter, thirtyDaysAgo]);

  const hasFilters = search || roleFilter !== "all" || statusFilter !== "all";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Header with filters */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-700 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
              All Users
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {filteredUsers.length} of {users.length} records
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <FaMagnifyingGlass
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={13}
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FaXmark size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-900 rounded-lg p-0.5 text-xs font-medium">
            {(["all", "super_admin", "user"] as FilterRole[]).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  roleFilter === r
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                {r === "all"
                  ? "All Roles"
                  : r === "super_admin"
                    ? "Admin"
                    : "User"}
              </button>
            ))}
          </div>

          <div className="flex gap-1 bg-gray-100 dark:bg-gray-900 rounded-lg p-0.5 text-xs font-medium">
            {(["all", "active", "inactive"] as FilterStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-md transition-all capitalize ${
                  statusFilter === s
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                {s === "all" ? "All Status" : s}
              </button>
            ))}
          </div>

          {hasFilters && (
            <button
              onClick={() => {
                setSearch("");
                setRoleFilter("all");
                setStatusFilter("all");
              }}
              className="px-3 py-1.5 text-xs text-red-500 hover:text-red-700 font-semibold hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
          <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">
            <tr>
              <th className="px-5 py-3.5">User</th>
              <th className="px-5 py-3.5">Role</th>
              <th className="px-5 py-3.5">Provider</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Joined</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {filteredUsers.map((user) => {
              const isActive =
                user.last_sign_in_at &&
                new Date(user.last_sign_in_at) > thirtyDaysAgo;
              return (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-gray-400 flex-shrink-0">
                        <FaUser size={12} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                          {user.full_name || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${
                        user.role === "super_admin"
                          ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {user.role === "super_admin" ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize bg-gray-50 dark:bg-gray-900/30 px-2 py-1 rounded-md font-medium">
                      {user.provider || "email"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {isActive ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          Active
                        </span>
                      </div>
                    ) : user.last_sign_in_at ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                        <span className="text-xs text-gray-500 font-medium">
                          {format(new Date(user.last_sign_in_at), "MMM d")}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                        <span className="text-xs text-gray-400 font-medium">
                          Never
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-500">
                    {format(new Date(user.created_at), "MMM d, yyyy")}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <UserRowActions user={user} />
                  </td>
                </tr>
              );
            })}

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <FaMagnifyingGlass
                      className="text-gray-300 dark:text-gray-600"
                      size={24}
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      No users match your filters
                    </p>
                    {hasFilters && (
                      <button
                        onClick={() => {
                          setSearch("");
                          setRoleFilter("all");
                          setStatusFilter("all");
                        }}
                        className="text-xs text-blue-500 hover:underline font-semibold"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
