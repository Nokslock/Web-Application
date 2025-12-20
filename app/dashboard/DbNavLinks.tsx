'use client';

import { TbLayoutDashboardFilled } from "react-icons/tb";
import { IoSettingsSharp } from "react-icons/io5";
import { BsFillShieldFill } from "react-icons/bs";
 
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
 
const links = [
  { name: 'Dashboard', href: '/dashboard', icon: TbLayoutDashboardFilled },
  {
    name: 'Vault',
    href: '/dashboard/vault',
    icon: BsFillShieldFill,
  },
  { name: 'Settings', href: '/dashboard/settings', icon: IoSettingsSharp },
];
 
export default function NavLinks() {
  const pathname = usePathname();
 
  return (
    // CHANGE 1: 'flex-col' stacks them vertically
    // CHANGE 2: 'gap-4' adds more vertical space between them (was gap-2)
    <div className="flex w-full flex-col gap-4">
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[70px] grow items-center justify-center gap-7 rounded-md p-3 text-2xl font-medium hover:bg-sky-100 hover:text-blue-400 md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-sky-500 text-white': pathname === link.href,
              },
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </div>
  );
}