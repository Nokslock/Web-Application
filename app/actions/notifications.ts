"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { revalidatePath } from "next/cache";

// ─── AUTO: Create a notification for the current user ────────
export async function createAutoNotification({
  title,
  message,
  type = "info",
}: {
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "security";
}) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const adminClient = createSupabaseAdminClient();
    await adminClient.from("notifications").insert({
      user_id: user.id,
      title,
      message,
      type,
      is_broadcast: false,
    });
  } catch {
    // Fire-and-forget — don't break the main flow
  }
}

// ─── ADMIN: Send notification ────────────────────────────────
export async function sendNotification({
  title,
  message,
  type,
  target,
  userId,
}: {
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "security";
  target: "all" | "single";
  userId?: string;
}) {
  // Verify admin
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "super_admin") {
    throw new Error("Unauthorized");
  }

  const adminClient = createSupabaseAdminClient();

  if (target === "all") {
    // Broadcast notification (no specific user_id)
    const { error } = await adminClient.from("notifications").insert({
      title,
      message,
      type,
      is_broadcast: true,
      user_id: null,
    });
    if (error) throw new Error(error.message);
  } else if (target === "single" && userId) {
    const { error } = await adminClient.from("notifications").insert({
      title,
      message,
      type,
      is_broadcast: false,
      user_id: userId,
    });
    if (error) throw new Error(error.message);
  } else {
    throw new Error("Invalid target or missing userId");
  }

  revalidatePath("/admin");
  return { success: true };
}

// ─── USER: Get my notifications ──────────────────────────────
export async function getMyNotifications() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Fetch personal notifications
  const { data: personal, error: personalError } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (personalError) throw new Error(personalError.message);

  // Fetch broadcast notifications
  const { data: broadcasts, error: broadcastError } = await supabase
    .from("notifications")
    .select("*")
    .eq("is_broadcast", true)
    .order("created_at", { ascending: false })
    .limit(50);

  if (broadcastError) throw new Error(broadcastError.message);

  // Fetch read status for broadcasts
  const { data: reads } = await supabase
    .from("notification_reads")
    .select("notification_id")
    .eq("user_id", user.id);

  const readIds = new Set(
    (reads || []).map((r: { notification_id: string }) => r.notification_id),
  );

  // Merge and deduplicate
  const allMap = new Map<string, any>();

  for (const n of personal || []) {
    allMap.set(n.id, { ...n, is_read: n.is_read });
  }

  for (const n of broadcasts || []) {
    if (!allMap.has(n.id)) {
      allMap.set(n.id, { ...n, is_read: readIds.has(n.id) });
    }
  }

  // Sort by created_at desc
  return Array.from(allMap.values()).sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

// ─── USER: Mark single notification as read ──────────────────
export async function markNotificationRead(notificationId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Check if it's a broadcast or personal
  const { data: notification } = await supabase
    .from("notifications")
    .select("is_broadcast, user_id")
    .eq("id", notificationId)
    .single();

  if (!notification) return;

  if (notification.is_broadcast) {
    // Insert into notification_reads
    await supabase
      .from("notification_reads")
      .upsert({ user_id: user.id, notification_id: notificationId });
  } else if (notification.user_id === user.id) {
    // Update the notification directly
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .eq("user_id", user.id);
  }
}

// ─── USER: Mark all notifications as read ────────────────────
export async function markAllNotificationsRead() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Mark personal notifications as read
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  // Get unread broadcasts
  const { data: broadcasts } = await supabase
    .from("notifications")
    .select("id")
    .eq("is_broadcast", true);

  if (broadcasts && broadcasts.length > 0) {
    // Get already-read broadcast IDs
    const { data: existingReads } = await supabase
      .from("notification_reads")
      .select("notification_id")
      .eq("user_id", user.id);

    const readIds = new Set(
      (existingReads || []).map(
        (r: { notification_id: string }) => r.notification_id,
      ),
    );

    // Insert reads for unread broadcasts
    const newReads = broadcasts
      .filter((b: { id: string }) => !readIds.has(b.id))
      .map((b: { id: string }) => ({
        user_id: user.id,
        notification_id: b.id,
      }));

    if (newReads.length > 0) {
      await supabase.from("notification_reads").insert(newReads);
    }
  }
}
