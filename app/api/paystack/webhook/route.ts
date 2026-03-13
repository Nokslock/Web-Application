import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  const signature = req.headers.get("x-paystack-signature");
  const expectedSignature = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(rawBody)
    .digest("hex");

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "charge.success") {
    const { data } = event;
    const validPlans = ["monthly", "6month", "yearly"];

    if (
      data.status === "success" &&
      data.metadata?.plan &&
      validPlans.includes(data.metadata.plan)
    ) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      await supabase
        .from("profiles")
        .update({ plan: data.metadata.plan })
        .eq("id", data.metadata.userId);

      console.log(
        "Upgraded user plan:",
        data.metadata.userId,
        "→",
        data.metadata.plan
      );
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
