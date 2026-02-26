import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
    try {
        const supabase = await createSupabaseServerClient();
        await supabase.auth.signOut();

        // Clear the last_activity cookie
        const cookieStore = await cookies();
        cookieStore.delete("last_activity");

        return NextResponse.json({ success: true, redirect: "/login" });
    } catch (error) {
        console.error("Sign-out API error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to sign out" },
            { status: 500 }
        );
    }
}
