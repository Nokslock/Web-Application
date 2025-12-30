import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { createSupabaseServerClient } from "@/lib/supabase/server-client"; 
import Sidebar from "@/components/Sidebar"; // <--- Import the new component

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
      
      {/* SIDEBAR COMPONENT */}
      <Sidebar user={user} fullName={fullName} email={email} />

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10 relative">
        {children}
      </main>
      
    </div>
  );
}