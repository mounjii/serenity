"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutAction } from "@/app/admin/actions";
import { BellIcon, CalendarIcon, CalendarOffIcon, CloseIcon, HomeIcon, LogoutIcon, MenuIcon, PlusIcon } from "@/components/Icons";
import { blurProps, images } from "@/lib/images";

const links = [
  { href: "/admin", label: "Dashboard", icon: HomeIcon },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarIcon },
  { href: "/admin/closed-days", label: "Closed days", icon: CalendarOffIcon },
  { href: "/admin/notifications", label: "Notifications", icon: BellIcon },
];

function Sidebar({ username, onNavigate }: { username: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col px-4 pt-7 pb-5">
      <Link href="/admin" onClick={onNavigate} className="mx-auto block">
        <Image src="/images/logo.webp" alt="Touch Sense Thai Massage" width={650} height={451} priority className="h-[68px] w-auto opacity-90 brightness-0 invert" />
      </Link>

      <nav aria-label="Admin" className="mt-10 space-y-1">
        {links.map((link) => {
          const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3.5 rounded-lg px-3.5 py-3 text-[0.84rem] transition ${
                active ? "bg-white/[0.08] text-white ring-1 ring-white/10" : "text-white/60 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <link.icon className="h-[1.15rem] w-[1.15rem]" />
              {link.label}
            </Link>
          );
        })}
        <Link
          href="/admin/bookings/new"
          onClick={onNavigate}
          className="mt-3 flex items-center gap-3.5 rounded-lg px-3.5 py-3 text-[0.84rem] text-white/60 transition hover:bg-white/[0.04] hover:text-white"
        >
          <PlusIcon className="h-[1.15rem] w-[1.15rem]" />
          New booking
        </Link>
      </nav>

      <div className="mt-auto space-y-5 pt-8">
        <div className="relative hidden h-[120px] overflow-hidden rounded-xl ring-1 ring-white/10 [@media(min-height:760px)]:block">
          <Image src={images.testimonial} {...blurProps(images.testimonial)} alt="" fill sizes="240px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
          <p className="absolute inset-x-4 bottom-3.5 text-[0.8rem] leading-snug text-white">
            Relaxed clients
            <br />
            are happy clients.
          </p>
        </div>

        <div className="flex items-center gap-3 px-1">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-bronze/80 font-serif text-[1.05rem] text-white uppercase">
            {username.charAt(0)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[0.84rem] text-white">{username}</span>
            <span className="block text-[0.7rem] text-white/50">Administrator</span>
          </span>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3.5 rounded-lg px-3.5 py-2.5 text-[0.82rem] text-white/60 transition hover:bg-white/[0.04] hover:text-white"
          >
            <LogoutIcon className="h-[1.15rem] w-[1.15rem]" />
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminShell({ username, children }: { username: string; children: React.ReactNode }) {
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
    <div className="min-h-screen bg-[#f8f6f2] lg:pl-[248px]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] overflow-y-auto bg-[#1d1b18] lg:block">
        <Sidebar username={username} />
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 bg-[#1d1b18] px-3 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="admin-drawer"
          className="grid h-11 w-11 place-items-center rounded-full text-white/85 transition active:bg-white/10"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
        <Link href="/admin" className="absolute left-1/2 -translate-x-1/2">
          <Image
            src="/images/touch-sense-logo-horizontal.webp"
            alt="Touch Sense Thai Massage"
            width={986}
            height={197}
            priority
            className="h-7 w-auto opacity-90 brightness-0 invert"
          />
        </Link>
        <Link
          href="/admin/bookings/new"
          aria-label="New booking"
          className="grid h-11 w-11 place-items-center rounded-full text-white/85 transition active:bg-white/10"
        >
          <PlusIcon className="h-5 w-5" />
        </Link>
      </header>

      <div id="admin-drawer" className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`} inert={!open}>
        <div onClick={() => setOpen(false)} className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
        <aside
          className={`absolute inset-y-0 left-0 w-[min(84vw,280px)] overflow-y-auto bg-[#1d1b18] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="absolute top-3 right-3 grid h-10 w-10 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
          <Sidebar username={username} onNavigate={() => setOpen(false)} />
        </aside>
      </div>

      <main className="mx-auto max-w-[1320px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9">{children}</main>
    </div>
  );
}
