import PricingToggle from "@/components/PricingToggle";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-gray-950 py-12 px-4 transition-colors duration-300">
      
      {/* Header Section */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <Link href="/dashboard" className="inline-flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 mb-6 transition text-sm font-bold">
           <FaArrowLeft className="mr-2" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Upgrade your security.
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
          Unlock unlimited storage, file encryption, and priority support with Nokslock Plus.
        </p>
      </div>

      {/* Pricing Component */}
      <PricingToggle />

      {/* Trust Badges / Footer */}
      <div className="mt-16 text-center">
         <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold mb-4">Trusted by modern teams</p>
         <div className="flex justify-center gap-6 opacity-40 grayscale">
            {/* You can add dummy logos here or just text */}
            <span className="font-bold text-xl dark:text-gray-300">Paystack</span>
            <span className="font-bold text-xl dark:text-gray-300">Flutterwave</span>
            <span className="font-bold text-xl dark:text-gray-300">Interswitch</span>
         </div>
      </div>

    </div>
  );
}