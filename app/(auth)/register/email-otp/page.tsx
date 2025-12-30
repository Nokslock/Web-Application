import { Suspense } from "react";
import OtpForm from "@/components/OtpForm"; // Ensure this path matches where you saved Step 1

// This forces Next.js to skip static generation for this page
export const dynamic = "force-dynamic";

export default function EmailOtpVerificationPage() {
  return (
    // The Suspense boundary is required when using useSearchParams in a child
    <Suspense fallback={<div className="text-center p-10">Loading...</div>}>
      <OtpForm />
    </Suspense>
  );
}