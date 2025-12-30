"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaCrown } from "react-icons/fa6";
import HomeLogo from "@/components/HomeLogo";
import NavLinks from "@/app/dashboard/DbNavLinks";
import SignOutButton from "@/components/SignOutButton";
import Pfp from "@/public/pfp-default.jpg";

// Define the props we expect from the server
interface SidebarProps {
  user: any;
  fullName: string;
  email: string;
}

export default function Sidebar({ user, fullName, email }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);

  // --- Touch Handlers for Swiping ---
  const onTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = null; 
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    // Swipe Right -> Open | Swipe Left -> Close
    if (isRightSwipe) setIsExpanded(true);
    if (isLeftSwipe) setIsExpanded(false);
  };

  return (
    <>
      {/* Mobile Backdrop (Click to close) */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      <aside 
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={`
          flex flex-col justify-between 
          h-full bg-white border-r border-gray-200 
          transition-all duration-300 ease-in-out
          p-4
          /* Mobile Logic: Absolute & Z-Index when expanded */
          ${isExpanded ? "w-72 absolute z-50 shadow-2xl" : "w-20"} 
          lg:static lg:w-72 lg:shadow-none
        `}
      >
        
        {/* Top Section: Logo + Nav */}
        <div>
          <div className={`flex ${isExpanded ? "justify-start" : "justify-center"} lg:justify-start pb-8 transition-all`}>
             <HomeLogo />
          </div>
          {/* You might need to pass isExpanded to NavLinks if you want them to hide/show text too */}
          <NavLinks isExpanded={isExpanded} />
        </div>

        {/* Bottom Section: Promo Button + Profile */}
        <div className="flex flex-col gap-4">
          
          {/* PROMO BUTTON */}
          <Link 
            href="/pricing" 
            className="
              group relative flex items-center gap-3 
              p-3 w-full rounded-xl 
              bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 
              text-white shadow-lg shadow-purple-200 
              transition-all duration-300 hover:scale-[1.02] hover:shadow-purple-300
              cursor-pointer
              justify-center lg:justify-start
            "
          >
            {/* Shining effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <FaCrown className="text-xl animate-pulse shrink-0" />

            {/* Text: Visible on Desktop OR when Expanded on Mobile */}
            <div className={`
                ${isExpanded ? "block" : "hidden"} 
                lg:block text-left overflow-hidden whitespace-nowrap
            `}>
              <p className="font-bold text-sm leading-none">Nockslock Plus</p>
              <p className="text-[10px] text-purple-100 font-medium opacity-90 mt-1">
                Upgrade for Vault access
              </p>
            </div>
          </Link>

          {/* PROFILE CARD */}
          {user && (
            <div 
              // Added onClick to toggle expansion
              onClick={() => setIsExpanded(!isExpanded)} 
              className="
                flex items-center gap-3 p-2 rounded-xl 
                bg-neutral-50 border border-neutral-200 
                cursor-pointer
                transition-all hover:bg-neutral-100 
                justify-center lg:justify-start
              "
            >
              <div className="shrink-0">
                <Image 
                  src={Pfp} 
                  alt="Profile" 
                  width={40} 
                  height={40} 
                  className="rounded-full"
                />
              </div>

              {/* Text: Visible on Desktop OR when Expanded on Mobile */}
              <div className={`
                 ${isExpanded ? "block" : "hidden"} 
                 lg:block overflow-hidden
              `}>
                <p className="font-medium text-sm truncate">{fullName}</p>
                <p className="font-thin text-gray-400 text-xs truncate max-w-[120px]">
                  {email}
                </p>
              </div>

              <div className={`
                  ${isExpanded ? "block" : "hidden"} 
                  lg:block ml-auto bg-red-100 p-2 rounded-full cursor-pointer hover:bg-red-200
              `}>
                <SignOutButton />
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}