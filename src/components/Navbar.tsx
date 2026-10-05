"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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

  const [hidden, setHidden] = useState(false);
  const progressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 24);
      if (Math.abs(y - lastY) > 6) {
        setHidden(y > lastY && y > 320);
        lastY = y;
      }
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
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
        hidden && !open ? "-translate-y-full" : "translate-y-0"
      } ${
        scrolled
          ? "bg-cream/90 py-3 shadow-[0_1px_0_rgba(0,0,0,0.05)] backdrop-blur-md"
          : "bg-transparent py-6 [&_ul_a]:font-medium [&_ul_a]:text-ink"
      }`}
    >
      <span
        ref={progressRef}
        aria-hidden
        className={`absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-ink/50 transition-opacity duration-500 ${scrolled ? "opacity-100" : "opacity-0"}`}
      />
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

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/admin/login"
            className="rounded-full border border-ink/30 px-5 py-2.5 text-[0.78rem] tracking-wide text-ink transition hover:border-ink hover:bg-ink hover:text-cream"
          >
            Login
          </Link>
          <Link
            href={RESERVATION_PATH}
            className="rounded-full bg-ink px-6 py-2.5 text-[0.78rem] tracking-wide text-cream transition hover:bg-black"
          >
            Book Now
          </Link>
        </div>

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
          <li className="mt-2 flex flex-wrap gap-3">
            <Link
              href={RESERVATION_PATH}
              onClick={() => setOpen(false)}
              className="inline-block rounded-full bg-ink px-6 py-2.5 text-sm text-cream"
            >
              Book Now
            </Link>
            <Link
              href="/admin/login"
              onClick={() => setOpen(false)}
              className="inline-block rounded-full border border-ink/30 px-6 py-2.5 text-sm text-ink"
            >
              Login
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
