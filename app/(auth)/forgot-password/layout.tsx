import type { Metadata } from "next";
import "../../globals.css";
import ForgotPasswordLayoutClient from "./ForgotPasswordLayoutClient"; // <--- Import new client layout

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
  return <ForgotPasswordLayoutClient>{children}</ForgotPasswordLayoutClient>;
}