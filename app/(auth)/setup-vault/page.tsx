import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";
import SetupVaultForm from "./SetupVaultForm";

export default async function SetupVaultPage() {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Must be authenticated
    if (!user) {
        redirect("/login");
    }

    // If vault is already set up, go straight to dashboard
    const { data: keyRow } = await supabase
        .from("user_encryption_keys")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (keyRow) {
        redirect("/dashboard");
    }

    const serializedUser = {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
    };

    return (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
            <div className="min-h-min flex flex-col justify-center">
                <div className="text-center px-5 mb-8">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white md:text-4xl lg:text-5xl tracking-tighter mb-4">
                        Setup Your Vault
                    </h1>
                    <p className="text-base text-gray-500 dark:text-gray-400 md:text-lg">
                        Create a Master Password to cryptographically secure your vault.
                    </p>
                </div>

                <div className="w-full">
                    <SetupVaultForm user={serializedUser} />
                </div>
            </div>
        </div>
    );
}
