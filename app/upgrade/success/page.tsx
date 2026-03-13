"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference");
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      return;
    }

    async function verify() {
      try {
        const res = await fetch(`/api/paystack/verify?reference=${reference}`);
        const data = await res.json();
        if (data.success) {
          setStatus("success");
          setTimeout(() => router.push("/dashboard"), 3000);
        } else {
          setStatus("failed");
        }
      } catch {
        setStatus("failed");
      }
    }

    verify();
  }, [reference, router]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-gray-600 dark:text-gray-300">
        <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-lg font-medium">Verifying your payment…</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4">
        <div className="text-5xl">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          You&apos;re now on the Pro plan!
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Redirecting you to your dashboard…
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4">
      <div className="text-5xl">❌</div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Payment verification failed
      </h1>
      <p className="text-gray-500 dark:text-gray-400">
        We couldn&apos;t verify your payment. Please contact support.
      </p>
    </div>
  );
}

export default function UpgradeSuccessPage() {
  return (
    <Suspense fallback={<p className="flex items-center justify-center min-h-screen">Loading...</p>}>
      <SuccessContent />
    </Suspense>
  );
}
