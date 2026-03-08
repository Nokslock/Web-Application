"use client";

import { useEffect } from "react";
import { updateHeartbeat } from "@/lib/actions/updateHeartbeat";

const STORAGE_KEY = "nokslock_last_heartbeat_ping";
const THROTTLE_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Silent, non-visual component that keeps the Dead Man's Switch alive.
 * Drop into the authenticated layout — renders nothing to the DOM.
 *
 * On mount it checks localStorage for the last ping timestamp and only
 * calls the server if more than 24 hours have passed. The throttle engages
 * on any non-failure response — including when the user has no active switch
 * (0 rows updated) — so the DB is never spammed on every navigation.
 */
export default function HeartbeatTracker() {
  useEffect(() => {
    async function ping() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const lastPing = raw ? parseInt(raw, 10) : 0;
        const now = Date.now();

        if (now - lastPing < THROTTLE_MS) return; // within 24h window — skip

        const result = await updateHeartbeat();

        // Engage the throttle on any successful query execution, regardless of
        // whether an active switch row was found. Only hard failures (auth error,
        // DB unreachable) leave the timestamp unset so the next visit retries.
        if (result.success) {
          localStorage.setItem(STORAGE_KEY, String(now));
        }
      } catch {
        // Never throw — this is a background process.
      }
    }

    ping();
  }, []); // mount-only — the 24h throttle handles re-navigation

  return null;
}
