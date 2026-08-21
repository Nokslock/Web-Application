"use client";

import { useState } from "react";
import { setUserRole, deleteUserAccount } from "@/app/actions/admin";
import type { StaffRole } from "@/app/actions/admin";
import { toast } from "sonner";
import {
  FaShieldHalved,
  FaUser,
  FaXmark,
  FaTriangleExclamation,
  FaTrash,
  FaUserShield,
} from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";

const ROLE_OPTIONS: { value: StaffRole; label: string; icon: typeof FaUser; color: string }[] = [
  { value: "admin", label: "Admin", icon: FaShieldHalved, color: "text-violet-600 dark:text-violet-400" },
  { value: "moderator", label: "Moderator", icon: FaUserShield, color: "text-amber-600 dark:text-amber-400" },
  { value: "user", label: "User", icon: FaUser, color: "text-gray-600 dark:text-gray-400" },
];

export default function UserRowActions({ user }: { user: any }) {
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<StaffRole>(user.role ?? "user");
  const [roleLoading, setRoleLoading] = useState(false);

  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const currentRole: StaffRole = user.role ?? "user";
  const canDelete = confirmText.trim() === (user.email ?? "");

  const handleRoleChange = async () => {
    if (selectedRole === currentRole) {
      setShowRoleModal(false);
      return;
    }
    setRoleLoading(true);
    try {
      await setUserRole(user.id, selectedRole);
      toast.success(`Role updated to ${selectedRole}`);
      setShowRoleModal(false);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setRoleLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!canDelete) return;
    setDeleteLoading(true);
    try {
      await deleteUserAccount(user.id);
      toast.success("Account deleted");
      setShowDelete(false);
      setConfirmText("");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => {
            setSelectedRole(currentRole);
            setShowRoleModal(true);
          }}
          className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
        >
          <FaUserShield size={10} /> Role
        </button>

        <button
          onClick={() => {
            setConfirmText("");
            setShowDelete(true);
          }}
          title="Delete account"
          className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
        >
          <FaTrash size={10} /> Delete
        </button>
      </div>

      {/* Role change modal */}
      <AnimatePresence>
        {showRoleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 w-full max-w-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <FaUserShield className="text-lg text-blue-500" />
                </div>
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="text-gray-400 hover:text-gray-900 dark:hover:text-white p-1"
                >
                  <FaXmark />
                </button>
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Change Role
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                Set the role for{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {user.email}
                </span>
              </p>

              <div className="space-y-2 mb-6">
                {ROLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedRole(opt.value)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                      selectedRole === opt.value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <opt.icon className={opt.color} size={16} />
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {opt.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {opt.value === "admin"
                          ? "Full access — manage users, roles, and all settings"
                          : opt.value === "moderator"
                            ? "View stats, gift premium, send notifications"
                            : "No admin portal access"}
                      </p>
                    </div>
                    {selectedRole === opt.value && (
                      <div className="ml-auto w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRoleChange}
                  disabled={roleLoading || selectedRole === currentRole}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-white rounded-xl transition-colors disabled:opacity-50 bg-blue-600 hover:bg-blue-700"
                >
                  {roleLoading ? "Updating..." : "Save Role"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete account confirmation */}
      <AnimatePresence>
        {showDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 w-full max-w-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
                  <FaTriangleExclamation className="text-lg text-red-500" />
                </div>
                <button
                  onClick={() => setShowDelete(false)}
                  className="text-gray-400 hover:text-gray-900 dark:hover:text-white p-1"
                >
                  <FaXmark />
                </button>
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Delete Account
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                This permanently deletes{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {user.email}
                </span>{" "}
                and all of their data (vaults, files, and settings). This
                <span className="font-semibold text-red-600 dark:text-red-400">
                  {" "}
                  cannot be undone
                </span>
                .
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Type the user&apos;s email to confirm:
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={user.email}
                autoComplete="off"
                className="w-full mb-6 px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/40"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDelete(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading || !canDelete}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-red-600 hover:bg-red-700"
                >
                  {deleteLoading ? "Deleting..." : "Delete Permanently"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
