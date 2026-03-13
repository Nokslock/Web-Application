"use client";

import { useState } from "react";

declare global {
  interface Window {
    PaystackPop: any;
  }
}

interface UpgradeButtonProps {
  userEmail: string;
  userId: string;
  amount: number;
  currency: "USD" | "NGN";
  planType: "monthly" | "6month" | "yearly";
  className?: string;
  children: React.ReactNode;
}

export default function UpgradeButton({
  userEmail,
  userId,
  amount,
  currency,
  planType,
  className,
  children,
}: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    console.log("1. Button clicked");
    console.log("2. PaystackPop available:", !!window.PaystackPop);
    console.log("3. userEmail:", userEmail, "userId:", userId, "amount:", amount, "currency:", currency, "planType:", planType);

    if (!window.PaystackPop) {
      alert("Payment system not ready yet. Please wait a moment and try again.");
      return;
    }

    setLoading(true);
    try {
      console.log("4. Calling /api/paystack/initialize...");
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, userId, amount, currency, planType }),
      });

      const data = await res.json();
      console.log("5. Initialize response:", res.status, data);

      if (!res.ok) {
        console.error("Initialize failed:", data.error);
        return;
      }

      console.log("6. Opening Paystack popup with access_code:", data.access_code);
      const popup = new window.PaystackPop();
      popup.resumeTransaction(data.access_code, {
        onSuccess: (transaction: { reference: string }) => {
          window.location.href = `/upgrade/success?reference=${transaction.reference}`;
        },
        onCancel: () => console.log("Payment cancelled"),
      });
    } catch (error: any) {
      console.error("Payment error message:", error?.message);
      console.error("Payment error full:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={className}
    >
      {loading ? "Processing..." : children}
    </button>
  );
}
