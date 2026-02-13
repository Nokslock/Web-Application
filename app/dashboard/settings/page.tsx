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

  const { data: nokData } = await supabase
    .from("next_of_kin")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Pass the data to the Client Component
  return <SettingsContent user={user} nokData={nokData} />;
}
