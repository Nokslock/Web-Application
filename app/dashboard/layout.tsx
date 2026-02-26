import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google"; // Keep fonts if needed, though they aren't used in the snippet I saw, but good to keep.
import "@/app/globals.css";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import IdleTimeoutProvider from "@/components/IdleTimeoutProvider";

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
  title: "Nockslock - Dashboard",
  description: "Secure your digital assets with Nockslock.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // --- VAULT SETUP CHECK ---
  // If user has no encryption keys, redirect to vault setup
  if (user) {
    const { data: keyRow } = await supabase
      .from("user_encryption_keys")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!keyRow) {
      const { redirect } = await import("next/navigation");
      redirect("/setup-vault");
    }
  }

  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || "Welcome User";
  const email = user?.email || "Please sign in";

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-gray-950 transition-colors duration-300 flex flex-col">
      {/* TOP NAVBAR */}
      <DashboardNavbar user={user} fullName={fullName} email={email} />

      {/* MAIN CONTENT */}
      <IdleTimeoutProvider>
        <main className="flex-1 w-full max-w-[1800px] mx-auto px-4 sm:px-6 py-6 md:py-8">
          {children}
        </main>
      </IdleTimeoutProvider>
    </div>
  );
}
