import type { Metadata } from "next";
import "../../globals.css";
import LoginLayoutClient from "./LoginLayoutClient"; // <--- Import the new file

export const metadata: Metadata = {
  icons: {
    icon: "/logo.svg",
  },
  title: 'Nockslock - Login',
  description: 'Secure your digital assets with Nockslock, the ultimate cold storage solution for cryptocurrencies.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LoginLayoutClient>{children}</LoginLayoutClient>;
}