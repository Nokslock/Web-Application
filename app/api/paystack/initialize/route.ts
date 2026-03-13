import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { email, userId, amount, currency, planType } = await req.json();

    // Paystack defaults to NGN; only pass currency if explicitly NGN
    const body: Record<string, unknown> = {
      email,
      amount: Math.round(amount * 100), // convert to kobo
      metadata: { userId, plan: planType },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade/success`,
    };
    if (currency === "NGN") body.currency = "NGN";

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      body,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { access_code, reference } = response.data.data;
    return NextResponse.json({ access_code, reference });
  } catch (error: any) {
    console.error("Paystack initialize error:", error?.response?.data ?? error);
    return NextResponse.json(
      { error: error?.response?.data?.message ?? "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
