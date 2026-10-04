"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { CloseIcon, MenuIcon } from "./Icons";
import { navLinks, RESERVATION_PATH } from "@/lib/navigation";

const hashOf = (href: string) => href.slice(href.indexOf("#"));

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("#home");
  const active = isHome ? activeHash : null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isHome) return;
    const sections = navLinks
      .map((l) => document.querySelector(hashOf(l.href)))
      .filter((el): el is Element => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveHash(`#${e.target.id}`);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [isHome]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-cream/90 py-3 shadow-[0_1px_0_rgba(0,0,0,0.05)] backdrop-blur-md"
          : "bg-transparent py-6 [&_ul_a]:font-medium [&_ul_a]:text-ink"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-12">
        <Logo />

        <ul className="hidden items-center gap-10 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`relative pb-1.5 text-[0.82rem] tracking-wide transition-colors hover:text-ink ${
                  active === hashOf(link.href) ? "text-ink" : "text-ink-soft"
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-0.5 left-1/2 h-px -translate-x-1/2 bg-ink transition-all duration-300 ${
                    active === hashOf(link.href) ? "w-full" : "w-0"
                  }`}
                />
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href={RESERVATION_PATH}
          className="hidden rounded-full bg-ink px-6 py-2.5 text-[0.78rem] tracking-wide text-cream transition hover:bg-black md:inline-block"
        >
          Book Now
        </Link>

        <button
          aria-label="Toggle menu"
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </nav>

      <div
        className={`overflow-hidden bg-cream transition-[max-height] duration-500 md:hidden ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <ul className="flex flex-col gap-4 px-6 py-6">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="font-serif text-2xl text-ink"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href={RESERVATION_PATH}
              onClick={() => setOpen(false)}
              className="mt-2 inline-block rounded-full bg-ink px-6 py-2.5 text-sm text-cream"
            >
              Book Now
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
