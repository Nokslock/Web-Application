"use client";

import { useState } from "react";
import { toggleAdminRole, deleteUserAccount } from "@/app/actions/admin";
import { toast } from "sonner";
import {
  FaShieldHalved,
  FaUser,
  FaXmark,
  FaTriangleExclamation,
  FaTrash,
} from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";

export default function UserRowActions({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Delete flow
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const isAdmin = user.role === "super_admin";
  const canDelete = confirmText.trim() === (user.email ?? "");

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await toggleAdminRole(user.id, user.role);
      toast.success(`User ${isAdmin ? "demoted" : "promoted"} successfully`);
      setShowModal(false);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
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
          onClick={() => setShowModal(true)}
          disabled={loading}
          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            isAdmin
              ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
              : "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
          }`}
        >
          {isAdmin ? (
            <>
              <FaUser size={10} /> Demote
            </>
          ) : (
            <>
              <FaShieldHalved size={10} /> Make Admin
            </>
          )}
        </button>

        <button
          onClick={() => {
            setConfirmText("");
            setShowDelete(true);
          }}
          disabled={loading}
          title="Delete account"
          className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
        >
          <FaTrash size={10} /> Delete
        </button>
      </div>

      {/* Promote / Demote confirmation */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 w-full max-w-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`p-3 rounded-xl ${isAdmin ? "bg-red-50 dark:bg-red-900/20" : "bg-blue-50 dark:bg-blue-900/20"}`}
                >
                  <FaTriangleExclamation
                    className={`text-lg ${isAdmin ? "text-red-500" : "text-blue-500"}`}
                  />
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-900 dark:hover:text-white p-1"
                >
                  <FaXmark />
                </button>
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {isAdmin ? "Demote User" : "Promote to Admin"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to{" "}
                {isAdmin ? "remove admin access from" : "grant admin access to"}{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {user.email}
                </span>
                ?
                {!isAdmin && " They will have full access to the Admin Portal."}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className={`flex-1 px-4 py-2.5 text-sm font-bold text-white rounded-xl transition-colors disabled:opacity-50 ${
                    isAdmin
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {loading ? "Updating..." : isAdmin ? "Demote" : "Promote"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete account confirmation (typed email) */}
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
