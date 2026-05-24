import type { Metadata } from "next";
import "../../globals.css";
import LoginLayoutClient from "./LoginLayoutClient"; // <--- Import the new file

export const metadata: Metadata = {
  icons: {
    icon: "/logo.svg",
  },
  title: 'Nokslock - Login',
  description: 'Protect your most important digital assets with Nokslock. Zero-knowledge encrypted vaults and secure file storage.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LoginLayoutClient>{children}</LoginLayoutClient>;
}