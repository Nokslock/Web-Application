import type { Metadata } from "next";
import "../../globals.css";
import RegisterLayoutClient from "./RegisterLayoutClient"; // <--- Import the new Client Component

export const metadata: Metadata = {
  icons: {
    icon: "/logo.svg",
  },
  title: "Nockslock - Create Account",
  description:
    "Secure your digital assets with Nockslock, the ultimate cold storage solution for cryptocurrencies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RegisterLayoutClient>{children}</RegisterLayoutClient>;
}