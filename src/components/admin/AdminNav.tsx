"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/bookings/new", label: "New booking" },
  { href: "/admin/closed-days", label: "Closed days" },
  { href: "/admin/notifications", label: "Notifications" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="-mx-1 flex w-full gap-1 overflow-x-auto sm:mx-0 sm:w-auto" aria-label="Admin">
      {links.map((link) => {
        const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-[0.8rem] whitespace-nowrap transition ${
              active ? "bg-olive text-white" : "text-ink-soft hover:bg-white hover:text-ink"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
