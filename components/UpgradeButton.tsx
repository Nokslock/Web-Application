"use client";

import { useState } from "react";

interface UpgradeButtonProps {
  planType: "monthly" | "6month" | "yearly";
  className?: string;
  children: React.ReactNode;
}

export default function UpgradeButton({
  planType,
  className,
  children,
}: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        console.error("Checkout failed:", data.error);
        alert(data.error ?? "Could not start checkout. Please try again.");
        return;
      }

      // Redirect to Stripe-hosted Checkout.
      window.location.href = data.url;
    } catch (error: any) {
      console.error("Checkout error:", error?.message ?? error);
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleClick} disabled={loading} className={className}>
      {loading ? "Processing..." : children}
    </button>
  );
}
