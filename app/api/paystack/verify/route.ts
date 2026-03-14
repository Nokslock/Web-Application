import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json({ success: false, error: "Missing reference" }, { status: 400 });
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const { data } = response.data;

    if (data.status === "success") {
      const plan = data.metadata.plan;
      const now = new Date();
      const expiresAt = new Date(now);

      if (plan === "monthly") expiresAt.setMonth(now.getMonth() + 1);
      if (plan === "6month") expiresAt.setMonth(now.getMonth() + 6);
      if (plan === "yearly") expiresAt.setFullYear(now.getFullYear() + 1);

      const supabase = await createSupabaseServerClient();
      const { error } = await supabase
        .from("profiles")
        .update({
          plan,
          plan_started_at: now.toISOString(),
          plan_expires_at: expiresAt.toISOString(),
          plan_reference: data.reference,
        })
        .eq("id", data.metadata.userId);

      if (error) {
        console.error("Failed to update profile:", error);
      }

      return NextResponse.json({ success: true, plan });
    }

    return NextResponse.json({ success: false });
  } catch (error) {
    console.error("Paystack verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
