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

      const plan = data.metadata.plan;
      const userId = data.metadata.userId;
      const now = new Date();
      const expiresAt = new Date(now);

      if (plan === "monthly") expiresAt.setMonth(now.getMonth() + 1);
      if (plan === "6month") expiresAt.setMonth(now.getMonth() + 6);
      if (plan === "yearly") expiresAt.setFullYear(now.getFullYear() + 1);

      const { error } = await supabase
        .from("profiles")
        .update({
          plan,
          plan_started_at: now.toISOString(),
          plan_expires_at: expiresAt.toISOString(),
          plan_reference: data.reference,
        })
        .eq("id", userId);

      if (error) {
        console.error("Failed to update profile:", error);
      }

      // Insert into payment history
      const { error: historyError } = await supabase
        .from("payment_history")
        .insert({
          user_id: userId,
          reference: data.reference,
          plan,
          amount: data.amount,
          currency: data.currency,
          paid_at: now.toISOString(),
          plan_expires_at: expiresAt.toISOString(),
        });

      if (historyError) {
        console.error("Failed to insert payment history:", historyError);
      }

      console.log("Upgraded user plan:", userId, "→", plan);
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
