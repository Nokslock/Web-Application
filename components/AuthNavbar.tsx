"use client";

import HomeLogo from "@/components/HomeLogo";

export default function AuthNavbar() {
  return (
    <nav className="flex-none px-8 pt-12 pb-6 w-full z-10 bg-white dark:bg-gray-950">
      <div className="flex justify-start">
        <HomeLogo />
      </div>
    </nav>
  );
}
