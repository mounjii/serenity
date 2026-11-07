"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarIcon, HomeIcon, StarIcon, UserIcon } from "@/components/Icons";
import { splitLocale } from "@/i18n/config";
import { useI18n } from "@/i18n/client";
import CustomerLogoutButton from "./CustomerLogoutButton";

const items = [
  { href: "/account", label: "navDashboard", icon: HomeIcon, exact: true },
  { href: "/account/bookings", label: "navBookings", icon: CalendarIcon, exact: false },
  { href: "/account/info", label: "navProfile", icon: UserIcon, exact: false },
  { href: "/account/loyalty", label: "navLoyalty", icon: StarIcon, exact: false },
] as const;

export default function AccountNav() {
  const { t, href } = useI18n();
  const path = splitLocale(usePathname()).path;

  return (
    <nav aria-label={t.account.eyebrow} className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
      {items.map((item) => {
        const active = item.exact ? path === item.href : path.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={href(item.href)}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-3 rounded-full px-3.5 py-2.5 text-[0.84rem] font-medium transition ${
              active ? "bg-forest text-white" : "text-sage hover:bg-forest/5 hover:text-ink"
            }`}
          >
            <item.icon className="h-[1.15rem] w-[1.15rem]" />
            {t.account[item.label]}
          </Link>
        );
      })}
      <div className="mt-2 hidden border-t border-sand pt-2 lg:block">
        <CustomerLogoutButton />
      </div>
    </nav>
  );
}
