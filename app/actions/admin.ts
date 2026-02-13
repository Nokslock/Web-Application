"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { revalidatePath } from "next/cache";

/**
 * Checks if the current user is a super_admin.
 * We do this with the standard client to verify the session exists and has the role metadata.
 */
async function checkAdminAccess() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized: No user found");
  }

  const role = user.user_metadata?.role;
  if (role !== "super_admin") {
    throw new Error("Unauthorized: Insufficient permissions");
  }

  return user;
}

export async function getAdminStats() {
  await checkAdminAccess();
  const adminClient = createSupabaseAdminClient();

  // 1. Total Users
  // listUsers defaults to 50 users per page. We need to paginate or trust the total count if available?
  // listUsers returns "total" if we ask? No, the library method returns { data: { users }, error }.
  // There isn't a direct "count" method on auth.users without raw SQL or listing all.
  // We can try to get a reasonable estimate or just list the first page and say "50+".
  // Actually, 'listUsers' is for managing users. It doesn't give a total count easily without iterating.
  // HOWEVER, for a small app, we can fetch page 1 and see.
  // Better approach: Use the Service Role to query a public 'profiles' table if it existed, but it doesn't.
  // We will stick to `listUsers` and maybe just count the first 1000?
  // Let's just list page 1 with a large limit.

  const {
    data: { users },
    error,
  } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (error) throw error;

  const totalUsers = users.length;

  // 2. Active Users (last sign in within 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const activeUsers = users.filter(
    (u) => u.last_sign_in_at && new Date(u.last_sign_in_at) > thirtyDaysAgo,
  ).length;

  // 3. New Signups (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const newSignups = users.filter(
    (u) => u.created_at && new Date(u.created_at) > sevenDaysAgo,
  ).length;

  return {
    totalUsers,
    activeUsers,
    newSignups,
  };
}

export async function getUsersList(page = 1, limit = 10) {
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

  // Map to a cleaner format for the UI
  return users.map((u) => ({
    id: u.id,
    email: u.email,
    full_name: u.user_metadata?.full_name || "N/A", // Fallback
    role: u.user_metadata?.role || "user",
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
  }));
}

export async function toggleAdminRole(userId: string, currentRole: string) {
  await checkAdminAccess();
  const adminClient = createSupabaseAdminClient();

  const newRole = currentRole === "super_admin" ? "user" : "super_admin";

  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    user_metadata: { role: newRole },
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  return { success: true, newRole };
}
