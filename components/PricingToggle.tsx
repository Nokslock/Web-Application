"use client";

import { useState } from "react";
import { FaCheck, FaXmark, FaCrown } from "react-icons/fa6";
import Link from "next/link";

export default function PricingToggle() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="w-full max-w-6xl mx-auto">
      
      {/* 1. TOGGLE - Slides down on load */}
      <div className="flex justify-center mb-10 animate-in slide-in-from-top-4 fade-in duration-700">
        <div className="bg-gray-100 p-1 rounded-full flex relative">
          <button
            onClick={() => setBilling("monthly")}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
              billing === "monthly" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 flex gap-2 items-center ${
              billing === "yearly" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Yearly <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full animate-pulse">-20%</span>
          </button>
        </div>
      </div>

      {/* 2. THE 3-CARD SLIM GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 items-start">
        
        {/* --- CARD 1: FREE (Static) --- */}
        <div className="
           bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col h-full 
           animate-in slide-in-from-bottom-8 fade-in duration-700 fill-mode-backwards delay-0
           transition-all hover:-translate-y-2 hover:shadow-xl hover:border-blue-200
        ">
          <div className="mb-6">
            <h3 className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-2">Starter</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-gray-900">Free</span>
            </div>
            <p className="text-gray-400 text-xs mt-2">Essential security for personal use.</p>
          </div>

          <div className="flex-1 space-y-3 mb-8">
             <FeatureItem text="50 Passwords" included={true} />
             <FeatureItem text="2 Wallet Addresses" included={true} />
             <FeatureItem text="Mobile Access" included={true} />
             <FeatureItem text="Secure Notes" included={false} />
             <FeatureItem text="Priority Support" included={false} />
          </div>

          <Link href="/dashboard" className="w-full block text-center py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 text-sm transition-colors">
            Current Plan
          </Link>
        </div>

        {/* --- CARD 2: STANDARD (Dynamic Price) --- */}
        <div className="
           bg-white rounded-3xl p-6 border-2 border-blue-100 shadow-lg relative flex flex-col h-full transform md:-translate-y-2
           animate-in slide-in-from-bottom-8 fade-in duration-700 fill-mode-backwards delay-150
           transition-all hover:-translate-y-4 hover:shadow-2xl hover:border-blue-300
        ">
          <div className="mb-6">
            <h3 className="text-blue-600 font-bold uppercase tracking-wider text-xs mb-2">Standard</h3>
            <div className="flex items-baseline gap-1">
              {/* DYNAMIC PRICE CHANGE */}
              <span className="text-3xl font-extrabold text-gray-900">
                {billing === "monthly" ? "₦5,000" : "₦50,000"}
              </span>
              <span className="text-gray-400 text-xs font-medium">
                /{billing === "monthly" ? "mo" : "year"}
              </span>
            </div>
            <p className="text-gray-400 text-xs mt-2">Flexibility for growing needs.</p>
          </div>

          <div className="flex-1 space-y-3 mb-8">
             <FeatureItem text="Unlimited Passwords" included={true} />
             <FeatureItem text="Unlimited Wallets" included={true} />
             <FeatureItem text="1GB Encrypted File Storage" included={true} />
             <FeatureItem text="Dark Web Monitoring" included={true} />
             <FeatureItem text="Email Support" included={true} />
          </div>

          <button className="w-full py-3 rounded-xl bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 text-sm transition-colors">
            {billing === "monthly" ? "Select Monthly" : "Select Yearly"}
          </button>
        </div>

        {/* --- CARD 3: PREMIUM (Dynamic Price) --- */}
        <div className="
           bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-200 relative flex flex-col h-full transform md:-translate-y-4 overflow-hidden
           animate-in slide-in-from-bottom-8 fade-in duration-700 fill-mode-backwards delay-300
           transition-all hover:-translate-y-6 hover:shadow-purple-300/50 hover:scale-[1.02]
        ">
          {/* Badge */}
          <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10 animate-pulse">
            BEST VALUE
          </div>

          <div className="mb-6 relative z-10">
            <div className="flex items-center gap-2 mb-2">
               <FaCrown className="text-yellow-300" />
               <h3 className="text-blue-200 font-bold uppercase tracking-wider text-xs">Premium</h3>
            </div>
            <div className="flex items-baseline gap-1">
              {/* DYNAMIC PRICE CHANGE */}
              <span className="text-3xl font-extrabold">
                {billing === "monthly" ? "₦8,000" : "₦48,000"}
              </span>
              <span className="text-blue-200 text-xs font-medium">
                /{billing === "monthly" ? "mo" : "year"}
              </span>
            </div>
            <p className="text-blue-100 text-xs mt-2 opacity-80">
               {billing === "monthly" ? "Advanced security features." : "Save 50% with annual billing!"}
            </p>
          </div>

          <div className="flex-1 space-y-3 mb-8 relative z-10">
             <FeatureItem text="Everything in Standard" included={true} dark />
             <FeatureItem text="50GB Secure Vault" included={true} dark />
             <FeatureItem text="Priority 24/7 Support" included={true} dark />
             <FeatureItem text="Family Sharing (5 Users)" included={true} dark />
             <FeatureItem text="Early Access Features" included={true} dark />
          </div>

          <button className="w-full py-3 rounded-xl bg-white text-blue-700 font-bold hover:bg-gray-50 text-sm transition-colors shadow-lg relative z-10">
             {billing === "monthly" ? "Upgrade to Premium" : "Get Premium Yearly"}
          </button>

          {/* Background Decoration */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl opacity-40 pointer-events-none animate-pulse duration-[3000ms]"></div>
        </div>

      </div>
    </div>
  );
}

// --- HELPER COMPONENT ---
function FeatureItem({ text, included, dark }: { text: string; included: boolean; dark?: boolean }) {
  return (
    <div className={`flex items-center gap-3 text-xs ${!included ? "opacity-50" : ""}`}>
      <div className={`
        h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0 transition-transform hover:scale-110
        ${included 
           ? (dark ? "bg-white/20 text-white" : "bg-blue-100 text-blue-600") 
           : "bg-gray-100 text-gray-400"}
      `}>
        {included ? <FaCheck size={8} /> : <FaXmark size={8} />}
      </div>
      <span className={dark ? "text-blue-50 font-medium" : "text-gray-600 font-medium"}>
        {text}
      </span>
    </div>
  );
}