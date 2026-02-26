import type { Metadata } from "next";
import "@/app/globals.css";
import RegisterLayoutClient from "../register/RegisterLayoutClient";

export const metadata: Metadata = {
    icons: {
        icon: "/logo.svg",
    },
    title: "Nockslock - Setup Vault",
    description:
        "Create a Master Password to secure your vault with zero-knowledge encryption.",
};

export default function SetupVaultLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <RegisterLayoutClient>{children}</RegisterLayoutClient>;
}
