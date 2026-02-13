"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";

const MAX_STORAGE_BYTES = 2 * 1024 * 1024 * 1024; // 2GB

export async function getStorageUsage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // List all files in the user's folder
  const { data: files, error } = await supabase.storage
    .from("vault-files")
    .list(user.id, {
      limit: 1000,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    });

  if (error) {
    console.error("Storage fetch error:", error);
    // Return 0 if bucket/folder doesn't exist or error
    return { used: 0, total: MAX_STORAGE_BYTES, percentage: 0 };
  }

  let totalBytes = 0;
  if (files) {
    totalBytes = files.reduce(
      (acc: number, file: any) => acc + (file.metadata?.size || 0),
      0,
    );
  }

  const percentage = Math.min((totalBytes / MAX_STORAGE_BYTES) * 100, 100);

  return {
    used: totalBytes,
    total: MAX_STORAGE_BYTES,
    percentage: percentage,
  };
}
