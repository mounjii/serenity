"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/closed-days", label: "Closed days" },
  { href: "/admin/notifications", label: "Notifications" },
];

export default function AdminNav({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  return (
    <nav className={`no-scrollbar flex gap-6 overflow-x-auto sm:gap-7 ${className}`} aria-label="Admin">
      {links.map((link) => {
        const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`relative flex items-center py-3 text-[0.8rem] tracking-wide whitespace-nowrap transition-colors duration-300 ${
              active ? "text-ink" : "text-ink-soft hover:text-ink"
            }`}
          >
            {link.label}
            <span
              aria-hidden
              className={`absolute inset-x-0 bottom-0 mx-auto h-px bg-ink transition-all duration-300 ${active ? "w-full" : "w-0"}`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
