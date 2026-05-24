import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import NextTopLoader from "nextjs-toploader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nokslock.com"),
  icons: {
    icon: "/logo.svg",
  },
  title: {
    default: "Nokslock - Secure Digital Vault",
    template: "%s | Nokslock",
  },
  description:
    "Protect your most important digital assets with Nokslock. Zero-knowledge encrypted vaults, secure file storage, and automated digital inheritance with Dead Man's Switch.",
  openGraph: {
    type: "website",
    siteName: "Nokslock",
    title: "Nokslock - Secure Digital Vault",
    description:
      "Protect your most important digital assets with Nokslock. Zero-knowledge encrypted vaults, secure file storage, and automated digital inheritance.",
    url: "https://nokslock.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nokslock - Secure Digital Vault",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nokslock - Secure Digital Vault",
    description:
      "Protect your most important digital assets with Nokslock. Zero-knowledge encrypted vaults, secure file storage, and automated digital inheritance.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable}relative antialiased`}
      >
        <NextTopLoader color="#3b82f6" showSpinner={false} />
        <Toaster position="top-center" richColors />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
