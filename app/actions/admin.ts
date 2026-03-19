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

export async function getSubscriptionStats() {
  await checkAdminAccess();
  const adminClient = createSupabaseAdminClient();

  const { data: profiles } = await adminClient
    .from("profiles")
    .select("plan, plan_expires_at, plan_cancelled");

  const now = new Date();
  const thirtyDaysFromNow = new Date(now);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const all = profiles ?? [];
  const payingPlans = ["monthly", "6month", "yearly"];

  const payingUsers = all.filter((p: any) => payingPlans.includes(p.plan)).length;
  const freeUsers = all.filter((p: any) => !payingPlans.includes(p.plan)).length;
  const cancelledCount = all.filter((p: any) => p.plan_cancelled).length;
  const expiringSoon = all.filter(
    (p: any) =>
      payingPlans.includes(p.plan) &&
      p.plan_expires_at &&
      new Date(p.plan_expires_at) > now &&
      new Date(p.plan_expires_at) <= thirtyDaysFromNow,
  ).length;

  const planBreakdown = {
    monthly: all.filter((p: any) => p.plan === "monthly").length,
    "6month": all.filter((p: any) => p.plan === "6month").length,
    yearly: all.filter((p: any) => p.plan === "yearly").length,
  };

  return { payingUsers, freeUsers, cancelledCount, expiringSoon, planBreakdown };
}

export async function getDmsStats() {
  await checkAdminAccess();
  const adminClient = createSupabaseAdminClient();

  const { data: switches } = await adminClient
    .from("dead_man_switches")
    .select("id, status, last_active_at, inactivity_threshold_days, owner_email");

  const now = new Date();
  const all = switches ?? [];

  const totalActive = all.filter((s: any) => s.status === "active").length;
  const totalTriggered = all.filter((s: any) => s.status === "triggered").length;
  const totalCancelled = all.filter((s: any) => s.status === "cancelled").length;

  const activeSwitches = all
    .filter((s: any) => s.status === "active")
    .map((s: any) => {
      const expiryDate = new Date(s.last_active_at);
      expiryDate.setDate(expiryDate.getDate() + s.inactivity_threshold_days);
      const daysRemaining = Math.ceil(
        (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );
      return {
        id: s.id as string,
        ownerEmail: (s.owner_email as string | null) ?? "Unknown",
        thresholdDays: s.inactivity_threshold_days as number,
        lastActiveAt: s.last_active_at as string,
        expiresAt: expiryDate.toISOString(),
        daysRemaining,
      };
    })
    .sort(
      (a: { daysRemaining: number }, b: { daysRemaining: number }) =>
        a.daysRemaining - b.daysRemaining,
    );

  return { totalActive, totalTriggered, totalCancelled, activeSwitches };
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
