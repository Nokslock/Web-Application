import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";
import SettingsContent from "@/components/dashboard/SettingsContent";

export default async function Settings() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: nokData }, { data: dmsData }] = await Promise.all([
    supabase.from("next_of_kin").select("*").eq("user_id", user.id).single(),
    supabase
      .from("dead_man_switches")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle(),
  ]);

  // Pass the data to the Client Component
  return (
    <SettingsContent user={user} nokData={nokData} hasDmsSetup={!!dmsData} />
  );
}
