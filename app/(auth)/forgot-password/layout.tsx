import type { Metadata } from "next";
import "../../globals.css";
import ForgotPasswordLayoutClient from "./ForgotPasswordLayoutClient"; // <--- Import new client layout

export const metadata: Metadata = {
  title: "Nokslock - Password Recovery",
  description:
    "Protect your most important digital assets with Nokslock. Zero-knowledge encrypted vaults and secure file storage.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ForgotPasswordLayoutClient>{children}</ForgotPasswordLayoutClient>;
}