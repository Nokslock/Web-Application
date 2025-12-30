'use client';

import { TbLayoutDashboardFilled } from "react-icons/tb";
import { IoSettingsSharp } from "react-icons/io5";
import { BsFillShieldFill } from "react-icons/bs";
 
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
 
const links = [
  { name: 'Dashboard', href: '/dashboard', icon: TbLayoutDashboardFilled },
  { name: 'Vault', href: '/dashboard/vault', icon: BsFillShieldFill },
  { name: 'Settings', href: '/dashboard/settings', icon: IoSettingsSharp },
];
 
export default function NavLinks() {
  const pathname = usePathname();
 
  return (
    <div className="flex w-full flex-col gap-2 mt-5">
      {links.map((link) => {
        const LinkIcon = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              // BASE STYLES (Mobile/Tablet - Narrow Sidebar)
              // 1. justify-center: Centers the icon when sidebar is collapsed
              // 2. h-[60px]: Adjusted height for better vertical rhythm
              'flex h-[60px] items-center justify-center rounded-xl transition-colors duration-200',
              
              // LARGE SCREEN STYLES (Desktop - Expanded Sidebar)
              // 1. lg:justify-start: Aligns content to left
              // 2. lg:px-4: Adds internal padding
              // 3. lg:gap-4: Adds space between icon and text
              'lg:justify-start lg:px-4 lg:gap-4',

              // CONDITIONAL STYLES (Active vs Inactive)
              {
                'bg-blue-600 text-white shadow-md shadow-blue-200': isActive,
                'text-gray-500 hover:bg-gray-100 hover:text-blue-600': !isActive,
              },
            )}
          >
            {/* Icon size adjusted slightly */}
            <LinkIcon className="w-6 h-6 shrink-0" />
            
            {/* Text is HIDDEN by default, appears only on LG screens */}
            <p className="hidden lg:block font-medium text-sm">
                {link.name}
            </p>
          </Link>
        );
      })}
    </div>
  );
}