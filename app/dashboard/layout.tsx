import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import Image from "next/image";
import Pfp from "@/public/pfp-default.jpg";
import { IoMdExit } from "react-icons/io";

import HomeLogo from "@/components/HomeLogo";
import NavLinks from "@/app/dashboard/DbNavLinks";

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
  description: 'Secure your digital assets with Nockslock, the ultimate cold storage solution for cryptocurrencies.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}  antialiased`}
      >
        <div>
            <div className="grid grid-cols-5 h-screen ovrflow-hidden">
              <div className="col-span-1 p-10">
                <div className="pb-15">
                  <HomeLogo />
                  <NavLinks />

                  

                  <div className="flex gap-3 bg-neutral-100 fixed bottom-10 left-5 p-2 rounded-xl">
                    <div>
                      <Image src={Pfp} alt="Profile Picture" width={50} height={50} className="rounded-full"/>
                    </div>
                    
                    <div >
                      <p>James Olatunde</p>
                      <p className="font-thin text-gray-400 text-sm">jamesolatunji@outlook.com</p>
                    </div>

                    <div className="bg-red-200 rounded-full p-5">
                      <IoMdExit />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-4 p-10 bg-neutral-100">
                {children}
              </div>
            </div>
        </div>
        
      </body>
    </html>
  );
}