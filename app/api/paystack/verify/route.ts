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
      const supabase = await createSupabaseServerClient();
      await supabase
        .from("profiles")
        .update({ plan: data.metadata.plan })
        .eq("id", data.metadata.userId);

      return NextResponse.json({ success: true, plan: data.metadata.plan });
    }

    return NextResponse.json({ success: false });
  } catch (error) {
    console.error("Paystack verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
