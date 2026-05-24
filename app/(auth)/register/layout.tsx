import type { Metadata } from "next";
import "../../globals.css";
import RegisterLayoutClient from "./RegisterLayoutClient"; // <--- Import the new Client Component

export const metadata: Metadata = {
  icons: {
    icon: "/logo.svg",
  },
  title: "Nokslock - Create Account",
  description:
    "Protect your most important digital assets with Nokslock. Zero-knowledge encrypted vaults and secure file storage.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RegisterLayoutClient>{children}</RegisterLayoutClient>;
}