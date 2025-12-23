import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import Image from "next/image";
import Pfp from "@/public/pfp-default.jpg";
import { IoMdExit } from "react-icons/io";

import HomeLogo from "@/components/HomeLogo";
import NavLinks from "@/app/dashboard/DbNavLinks";

// 1. Import your Supabase helper
import { createSupabaseServerClient } from "@/lib/supabase/server-client"; // Update this path if yours is different
import SignOutButton from "@/components/SignOutButton"; // See step 2 below

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

// 2. Make the component async so we can fetch data
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  // 3. Fetch User Data
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 4. Handle "No User" case (Optional: Prevent sidebar from breaking if logged out)
  // If this is the main layout for the whole app, you might only want to show the profile if user exists.
  const fullName = user?.user_metadata?.full_name || "Welcome User";
  const email = user?.email || "Please sign in";

  return (
    
        <div>
          <div className="grid grid-cols-5 h-screen overflow-hidden">
            <div className="col-span-1 p-10">
              <div className="pb-15">
                <HomeLogo />
                <NavLinks />

                {/* 5. Only show this bottom section if a user is logged in */}
                {user && (
                  <div className="flex gap-3 bg-neutral-100 fixed bottom-10 left-5 p-2 rounded-xl items-center">
                    <div>
                      <Image 
                        src={Pfp} 
                        alt="Profile Picture" 
                        width={50} 
                        height={50} 
                        className="rounded-full"
                      />
                    </div>

                    <div>
                      {/* 6. Dynamic Variables Here */}
                      <p className="font-medium text-sm">{fullName}</p>
                      <p className="font-thin text-gray-400 text-xs truncate w-32">
                        {email}
                      </p>
                    </div>

                    {/* 7. Replaced the static div with a functional button component */}
                    <div className="bg-red-200 rounded-full p-3 cursor-pointer hover:bg-red-300 transition">
                      <SignOutButton />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="col-span-4 p-10 bg-neutral-100">
              {children}
            </div>
          </div>
        </div>
  );
}