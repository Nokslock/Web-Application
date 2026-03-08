"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";

/**
 * Updates `last_active_at` to now() for the authenticated user's active
 * dead_man_switch row. Called by HeartbeatTracker at most once every 24 hours.
 *
 * Success contract: `success: true` means the query executed without a hard
 * failure — authentication error, network error, or DB error. It does NOT
 * mean a row was updated. 0 rows updated (user has no active switch) is a
 * valid no-op and still returns `success: true` so the client throttle engages.
 *
 * `success: false` is reserved for true failures where retrying sooner may
 * be warranted (unauthenticated session, DB unreachable, etc.).
 */
export async function updateHeartbeat(): Promise<{ success: boolean; activeSwitchFound: boolean }> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, activeSwitchFound: false };

    const { error, count } = await (supabase.from("dead_man_switches") as any)
      .update({ last_active_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("status", "active")
      .select("id", { count: "exact", head: true });

    if (error) {
      console.error("[Heartbeat] DB update failed:", error.message);
      return { success: false, activeSwitchFound: false };
    }

    return { success: true, activeSwitchFound: (count ?? 0) > 0 };
  } catch (err: any) {
    console.error("[Heartbeat] Unexpected error:", err.message);
    return { success: false, activeSwitchFound: false };
  }
}
