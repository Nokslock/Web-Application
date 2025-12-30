import { Suspense } from "react";
import OtpForm from "@/components/OtpForm"; 
export const dynamic = "force-dynamic";
export default function EmailOtpVerificationPage() {
  return (
    <Suspense fallback={<div className="text-center p-10">Loading...</div>}>
      <OtpForm />
    </Suspense>
  );
}