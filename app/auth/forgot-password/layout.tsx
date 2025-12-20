import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../../globals.css";
import Image from "next/image";
import BgImg from "@/public/login-bg-img.png";
import Logo from "@/public/logo.svg";
import HomeLogo from "@/components/HomeLogo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nockslock - Password Recovery",
  description:
    "Secure your digital assets with Nockslock, the ultimate cold storage solution for cryptocurrencies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="container mx-auto p-20">
          <div className="grid grid-cols-2 gap-10">
            <div className="col-span-1">
              <div className="pb-15">
                <HomeLogo />
                
                </div>
              {children}

              
              </div>
            <div className="col-span-1">
              <Image
                src={BgImg}
                alt="A description of my hero image"
                className="max-h-full"
              />
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
