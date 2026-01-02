"use client";

import { useState, useEffect } from "react";
import HomeLogo from "@/components/HomeLogo";
import NavLinks from "@/components/NavLinks";
import AuthButton from "@/components/AuthButton";
import Link from "next/link";
import clsx from "clsx";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client"; // <--- 1. Import your client helper

export default function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null); // <--- 2. Add state for user

  useEffect(() => {
    // Scroll Logic
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);

    // Auth Logic: Check if user is logged in
    const checkUser = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav style={{ backdropFilter: "blur(6px)" }}
      className={clsx(
        "fixed inset-x-0 top-0 w-full z-50 transition-all duration-300 ease-in-out",
        {
          "bg-transparent py-5": !isScrolled,
          "bg-white/80 backdrop-filter backdrop-blur-sm shadow-md py-3": isScrolled,
        }
      )}
    >
      <div className="mx-auto px-5 lg:px-20">
        <div className="flex items-center justify-between gap-5 lg:grid lg:grid-cols-8 md:grid md:grid-cols-8">
          
          <div className="flex h-full w-full items-center justify-start lg:col-span-1 md:col-span-2">
            <div className="flex items-center">
              <HomeLogo />
            </div>
          </div>

          <div className="flex h-full items-center justify-end lg:col-span-6 md:col-span-4 md:justify-center">
            <NavLinks />
          </div>

          <div className="hidden h-full items-center md:flex lg:col-span-1 md:col-span-2 w-full">
            {/* 3. DYNAMIC LINK: Changes based on 'user' state */}
            <Link 
              href={user ? "/dashboard" : "/login"} 
              className="w-full"
            >
              <AuthButton
                variant="primary"
                type="button"
                className="w-full flex justify-center"
              >
                {/* 4. DYNAMIC TEXT */}
                {user ? "Dashboard" : "Login"}
              </AuthButton>
            </Link>
          </div>
          
        </div>
      </div>
    </nav>
  );
}