"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { revalidatePath } from "next/cache";

/**
 * Checks if the current user is a super_admin.
 */
async function checkAdminAccess() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized: No user found");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    throw new Error("Unauthorized: Insufficient permissions");
  }

  return user;
}

export async function getAdminStats() {
  await checkAdminAccess();
  const adminClient = createSupabaseAdminClient();

  const {
    data: { users },
    error,
  } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (error) throw error;

  const now = new Date();
  const totalUsers = users.length;

  // Active Users (last sign in within 30 days)
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const activeUsers = users.filter(
    (u) => u.last_sign_in_at && new Date(u.last_sign_in_at) > thirtyDaysAgo,
  ).length;

  // New Signups (last 7 days)
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const newSignups = users.filter(
    (u) => u.created_at && new Date(u.created_at) > sevenDaysAgo,
  ).length;

  // Previous 7-day signups (for growth comparison)
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const prevWeekSignups = users.filter(
    (u) =>
      u.created_at &&
      new Date(u.created_at) > fourteenDaysAgo &&
      new Date(u.created_at) <= sevenDaysAgo,
  ).length;

  const signupGrowth =
    prevWeekSignups === 0
      ? newSignups > 0
        ? 100
        : 0
      : Math.round(((newSignups - prevWeekSignups) / prevWeekSignups) * 100);

  // Verified emails
  const verifiedUsers = users.filter((u) => u.email_confirmed_at).length;

  // Role Distribution
  const { count } = await adminClient
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("is_admin", true);
  const adminCount = count ?? 0;
  const regularUsers = totalUsers - adminCount;

  // Auth Provider Breakdown
  const providerCounts: Record<string, number> = {};
  users.forEach((u) => {
    const provider = u.app_metadata?.provider || "email";
    providerCounts[provider] = (providerCounts[provider] || 0) + 1;
  });

  // Signup Timeline (last 30 days, grouped by day)
  const signupTimeline: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    const dayStr = day.toISOString().split("T")[0];

    const count = users.filter((u) => {
      if (!u.created_at) return false;
      return u.created_at.startsWith(dayStr);
    }).length;

    signupTimeline.push({ date: dayStr, count });
  }

  return {
    totalUsers,
    activeUsers,
    newSignups,
    signupGrowth,
    verifiedUsers,
    roleDistribution: { admins: adminCount, users: regularUsers },
    providerBreakdown: providerCounts,
    signupTimeline,
  };
}

export async function getUsersList(page = 1, limit = 100) {
  await checkAdminAccess();
  const adminClient = createSupabaseAdminClient();

  const {
    data: { users },
    error,
  } = await adminClient.auth.admin.listUsers({
    page: page,
    perPage: limit,
  });

  if (error) throw error;

  // Fetch admin flags from profiles
  const { data: profiles } = await adminClient
    .from("profiles")
    .select("id, is_admin");

  const adminMap = new Map(
    (profiles ?? []).map((p: { id: string; is_admin: boolean }) => [p.id, p.is_admin]),
  );

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    full_name: u.user_metadata?.full_name || "N/A",
    role: adminMap.get(u.id) ? "super_admin" : "user",
    provider: u.app_metadata?.provider || "email",
    email_confirmed: !!u.email_confirmed_at,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
  }));
}

export async function toggleAdminRole(userId: string, currentRole: string) {
  await checkAdminAccess();
  const adminClient = createSupabaseAdminClient();

  const newIsAdmin = currentRole !== "super_admin";

  const { error } = await adminClient
    .from("profiles")
    .update({ is_admin: newIsAdmin })
    .eq("id", userId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  return { success: true, newRole: newIsAdmin ? "super_admin" : "user" };
}
