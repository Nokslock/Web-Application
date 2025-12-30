import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import Image from "next/image";
import Pfp from "@/public/pfp-default.jpg";
import { FaCrown } from "react-icons/fa6"; // Import Crown Icon for the button

import HomeLogo from "@/components/HomeLogo";
import NavLinks from "@/app/dashboard/DbNavLinks";

import { createSupabaseServerClient } from "@/lib/supabase/server-client"; 
import SignOutButton from "@/components/SignOutButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  icons: {
    icon: "@/public/logo.svg",
  },
  title: 'Nockslock - Dashboard',
  description: 'Secure your digital assets with Nockslock.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const fullName = user?.user_metadata?.full_name || "Welcome User";
  const email = user?.email || "Please sign in";

  return (
        
        <div className="flex h-screen overflow-hidden bg-neutral-100">
          
          {/* SIDEBAR */}
          <aside className="
            flex flex-col justify-between 
            h-full bg-white border-r border-gray-200 
            transition-all duration-300 ease-in-out
            w-20 lg:w-72 
            p-4
          ">
            
            {/* Top Section: Logo + Nav */}
            <div>
              <div className="flex justify-center lg:justify-start pb-8">
                 <HomeLogo />
              </div>
              <NavLinks />
            </div>

            {/* Bottom Section: Promo Button + Profile */}
            <div className="flex flex-col gap-4">
              
              {/* --- FLASHY PLUS BUTTON --- */}
              <button className="
                group relative flex items-center justify-center lg:justify-start gap-3 
                p-3 w-full rounded-xl 
                bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 
                text-white shadow-lg shadow-purple-200 
                transition-all duration-300 hover:scale-[1.02] hover:shadow-purple-300
              ">
                {/* Shining effect overlay */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                {/* Icon */}
                <FaCrown className="text-xl animate-pulse" />

                {/* Text: Hidden on mobile, visible on desktop */}
                <div className="hidden lg:block text-left">
                  <p className="font-bold text-sm leading-none">Nockslock Plus</p>
                  <p className="text-[10px] text-purple-100 font-medium opacity-90 mt-1">
                    Upgrade for Vault access
                  </p>
                </div>
              </button>

              {/* --- PROFILE CARD --- */}
              {user && (
                <div className="
                  flex items-center gap-3 p-2 rounded-xl 
                  bg-neutral-50 border border-neutral-200 
                  justify-center lg:justify-start
                  transition-all hover:bg-neutral-100 
                ">
                  <div className="shrink-0">
                    <Image 
                      src={Pfp} 
                      alt="Profile" 
                      width={40} 
                      height={40} 
                      className="rounded-full"
                    />
                  </div>

                  <div className="hidden lg:block overflow-hidden">
                    <p className="font-medium text-sm truncate">{fullName}</p>
                    <p className="font-thin text-gray-400 text-xs truncate max-w-[120px]">
                      {email}
                    </p>
                  </div>

                  <div className="hidden lg:block ml-auto bg-red-100 p-2 rounded-full cursor-pointer hover:bg-red-200">
                    <SignOutButton />
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1 overflow-y-auto p-4 md:p-10">
            {children}
          </main>
          
        </div>
  );
}