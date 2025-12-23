import type { Metadata } from "next";
import "../../globals.css";
import Image from "next/image";
import BgImg from "@/public/login-bg-img.png";
import HomeLogo from "@/components/HomeLogo";

export const metadata: Metadata = {
  icons: {
    icon: "/logo.svg", // Fixed path
  },
  title: 'Nockslock - Login',
  description: 'Secure your digital assets with Nockslock, the ultimate cold storage solution for cryptocurrencies.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <div className="container mx-auto lg:p-20 md:p-20 p-5">
            <div className="grid lg:grid-cols-2 md:grid-cols-1 gap-10">
              <div className="col-span-1 ">
                <div className="lg:pb-15 md:pb-10 pb-3 flex justify-center lg:justify-start">
                  <HomeLogo />
                </div>
                {children}
              </div>
              <div className="col-span-1 lg:block hidden">
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