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

// 1. Define the props to accept the state from the Sidebar
interface NavLinksProps {
  isExpanded?: boolean;
}
 
export default function NavLinks({ isExpanded }: NavLinksProps) {
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
              // BASE STYLES
              'flex h-[60px] items-center rounded-xl transition-all duration-200',
              
              // ALIGNMENT LOGIC:
              // If Expanded: Left align with padding
              // If Collapsed (default mobile): Center align
              // Desktop (lg): Always Left align
              isExpanded ? 'justify-start px-4 gap-4' : 'justify-center',
              'lg:justify-start lg:px-4 lg:gap-4',

              // ACTIVE STATES
              {
                'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/50': isActive,
                'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400': !isActive,
              },
            )}
          >
            <LinkIcon className="w-6 h-6 shrink-0" />
            
            {/* TEXT VISIBILITY LOGIC:
                1. Hidden by default on mobile.
                2. Block (Visible) if isExpanded is true.
                3. Block (Visible) always on Desktop (lg).
            */}
            <p className={clsx(
                'font-medium text-sm whitespace-nowrap',
                isExpanded ? 'block' : 'hidden', 
                'lg:block'
            )}>
                {link.name}
            </p>
          </Link>
        );
      })}
    </div>
  );
}