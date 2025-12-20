"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { name: "About", href: "#" },
  {
    name: "Features",
    href: "#",
  },
  { name: "Download", href: "#" },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    // 1. PARENT CONTAINER: flex-row makes the items sit side-by-side
    <div className="flex w-full flex-row gap-2">
      {links.map((link) => {
        return (
          <Link
            key={link.name}
            href={link.href}
            // 2. LINK ITEMS: 'grow' ensures they fill the width evenly on smaller screens
            className={clsx(
              "flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3",
              {
                "bg-sky-100 text-blue-600": pathname === link.href,
              }
            )}
          >
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </div>
  );
}
