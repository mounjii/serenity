"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ComponentType, type SVGProps } from "react";
import { logoutAction } from "@/app/admin/actions";
import {
  BellIcon,
  CalendarIcon,
  CalendarOffIcon,
  ClockIcon,
  CloseIcon,
  HomeIcon,
  LeafIcon,
  LogoutIcon,
  MenuIcon,
  PlusIcon,
  StarIcon,
  UserIcon,
} from "@/components/Icons";
import type { AdminArea } from "@/lib/admin-areas";

const mainLinks: { href: string; label: string; icon: ComponentType<SVGProps<SVGSVGElement>>; area?: AdminArea; owner?: boolean }[] = [
  { href: "/admin", label: "Dashboard", icon: HomeIcon, area: "dashboard" },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarIcon, area: "bookings" },
  { href: "/admin/prices", label: "Prices", icon: LeafIcon, area: "prices" },
  { href: "/admin/closed-days", label: "Closed days", icon: CalendarOffIcon, area: "closed" },
  { href: "/admin/loyalty", label: "Loyalty", icon: StarIcon, owner: true },
  { href: "/admin/admins", label: "Admins", icon: UserIcon, owner: true },
];

const recordLinks: { href: string; label: string; icon: ComponentType<SVGProps<SVGSVGElement>>; area: AdminArea }[] = [
  { href: "/admin/notifications", label: "Notifications", icon: BellIcon, area: "notifications" },
  { href: "/admin/activity", label: "Activity", icon: ClockIcon, area: "activity" },
];

function NavItem({
  link,
  pathname,
  onNavigate,
}: {
  link: { href: string; label: string; icon: ComponentType<SVGProps<SVGSVGElement>> };
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
  const Icon = link.icon;
  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-full px-3.5 py-2.5 text-[0.84rem] font-medium transition ${
        active ? "bg-forest text-white" : "text-sage hover:bg-forest/5 hover:text-ink"
      }`}
    >
      <Icon className="h-[1.15rem] w-[1.15rem]" />
      {link.label}
    </Link>
  );
}

function allowed(link: { area?: AdminArea; owner?: boolean }, owner: boolean, areas: readonly AdminArea[]) {
  if (link.owner) return owner;
  if (!link.area) return true;
  return owner || areas.includes(link.area);
}

function Sidebar({
  username,
  avatarUrl,
  owner,
  areas,
  home,
  onNavigate,
}: {
  username: string;
  avatarUrl: string | null;
  owner: boolean;
  areas: readonly AdminArea[];
  home: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const links = mainLinks.filter((link) => allowed(link, owner, areas));
  const records = recordLinks.filter((link) => allowed(link, owner, areas));
  const canBook = owner || areas.includes("bookings");
  return (
    <div className="flex h-full flex-col px-4 pt-6 pb-5">
      <Link
        href={home}
        onClick={onNavigate}
        className={`block ${onNavigate ? "me-10" : ""}`}
      >
        <Image
          src="/images/logo-nav.png"
          alt="Thai Prakhop Herbal Massage Studio"
          width={1024}
          height={341}
          priority
          className="h-auto w-full"
        />
      </Link>

      <nav aria-label="Admin" className="mt-8 space-y-1">
        {links.map((link) => (
          <NavItem key={link.href} link={link} pathname={pathname} onNavigate={onNavigate} />
        ))}
        {canBook ? (
          <Link
            href="/admin/bookings/new"
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-full px-3.5 py-2.5 text-[0.84rem] font-medium text-sage transition hover:bg-forest/5 hover:text-ink"
          >
            <PlusIcon className="h-[1.15rem] w-[1.15rem]" />
            New booking
          </Link>
        ) : null}
        {records.length > 0 ? (
          <div className="mt-3 border-t border-sand pt-3">
            {records.map((link) => (
              <NavItem key={link.href} link={link} pathname={pathname} onNavigate={onNavigate} />
            ))}
          </div>
        ) : null}
      </nav>

      <div className="mt-auto space-y-5 pt-8">
        <Link
          href="/admin/profile"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-full px-1 py-1 transition hover:bg-forest/5"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-forest text-[0.95rem] font-medium text-white uppercase">
            {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : username.charAt(0)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[0.84rem] font-medium text-ink">
              {username}
            </span>
            <span className="block text-[0.7rem] text-sage">
              Edit profile
            </span>
          </span>
        </Link>

        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-[0.82rem] font-medium text-sage transition hover:bg-forest/5 hover:text-ink"
          >
            <LogoutIcon className="h-[1.15rem] w-[1.15rem]" />
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminShell({
  username,
  avatarUrl,
  owner,
  areas,
  home,
  children,
}: {
  username: string;
  avatarUrl: string | null;
  owner: boolean;
  areas: readonly AdminArea[];
  home: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onResize = () => window.innerWidth >= 1024 && setOpen(false);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <div className="min-h-[calc(100vh/0.78)] bg-ivory font-display [zoom:0.78] lg:pl-[248px]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] overflow-y-auto border-r border-sand bg-ivory lg:block">
        <Sidebar username={username} avatarUrl={avatarUrl} owner={owner} areas={areas} home={home} />
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-sand bg-ivory/90 px-3 backdrop-blur-md lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="admin-drawer"
          className="grid h-11 w-11 place-items-center rounded-md bg-white/80 text-ink backdrop-blur-sm transition active:bg-white"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
        <Link href={home} className="absolute left-1/2 -translate-x-1/2">
          <Image
            src="/images/logo-nav.png"
            alt="Thai Prakhop Herbal Massage Studio"
            width={1024}
            height={341}
            priority
            className="h-9 w-auto"
          />
        </Link>
        {owner || areas.includes("bookings") ? (
          <Link
            href="/admin/bookings/new"
            aria-label="New booking"
            className="grid h-11 w-11 place-items-center rounded-full bg-forest text-white transition hover:bg-forest-dark"
          >
            <PlusIcon className="h-5 w-5" />
          </Link>
        ) : (
          <span className="h-11 w-11" />
        )}
      </header>

      <div
        id="admin-drawer"
        className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`}
        inert={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-[min(84vw,280px)] overflow-y-auto border-r border-sand bg-ivory transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="absolute top-3 right-3 grid h-10 w-10 place-items-center rounded-md bg-white/80 text-ink backdrop-blur-sm transition hover:bg-white"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
          <Sidebar username={username} avatarUrl={avatarUrl} owner={owner} areas={areas} home={home} onNavigate={() => setOpen(false)} />
        </aside>
      </div>

      <main className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
        {children}
      </main>
    </div>
  );
}
