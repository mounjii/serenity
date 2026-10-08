"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import { ArrowRight, CloseIcon, MenuIcon } from "./Icons";
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

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${hidden && !open ? "-translate-y-full" : "translate-y-0"} ${
          open
            ? "bg-cream py-3 lg:py-6"
            : scrolled
              ? "bg-cream/90 py-3 shadow-[0_1px_0_rgba(0,0,0,0.05)] backdrop-blur-md"
              : "bg-transparent py-4 lg:py-6"
        }`}
      >
        <span
          ref={progressRef}
          aria-hidden
          className={`absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-ink/50 transition-opacity duration-500 ${scrolled && !open ? "opacity-100" : "opacity-0"}`}
        />
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-12">
          <Logo />

          <ul className="hidden items-center gap-10 lg:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative pb-1.5 text-[0.82rem] tracking-wide transition-colors hover:text-ink ${
                    active === hashOf(link.href) || !scrolled ? "text-ink" : "text-ink-soft"
                  } ${scrolled ? "" : "font-medium"}`}
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

          <div className="hidden items-center gap-3 lg:flex">
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
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="-mr-2 grid h-11 w-11 place-items-center rounded-full text-ink transition active:bg-ink/5 lg:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </nav>
      </header>

      <div
        id="mobile-menu"
        inert={!open}
        className={`fixed inset-0 z-40 flex flex-col bg-cream px-6 pt-24 pb-safe transition-[opacity,visibility] duration-400 lg:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <ul className="flex flex-1 flex-col justify-center gap-1">
          {navLinks.map((link, i) => (
            <li
              key={link.href}
              style={{ transitionDelay: open ? `${80 + i * 60}ms` : "0ms" }}
              className={`transition-all duration-500 ${open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
            >
              <Link
                href={link.href}
                onClick={close}
                className="flex items-center justify-between border-b border-sand/80 py-4 font-serif text-[2rem] leading-none text-ink"
              >
                {link.label}
                <ArrowRight className="h-4 w-4 text-muted" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>

        <div
          style={{ transitionDelay: open ? "380ms" : "0ms" }}
          className={`space-y-3 pt-6 pb-4 transition-all duration-500 ${open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        >
          <Link
            href={RESERVATION_PATH}
            onClick={close}
            className="flex min-h-13 items-center justify-center gap-2 rounded-full bg-ink text-[0.9rem] tracking-wide text-cream"
          >
            Book Now <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href="/admin/login"
            onClick={close}
            className="flex min-h-12 items-center justify-center rounded-full border border-ink/25 text-[0.85rem] text-ink"
          >
            Login
          </Link>
          <p className="pt-2 text-center text-[0.72rem] tracking-wide text-muted">Open every day · 10:00 – 22:00</p>
        </div>
      </div>
    </>
  );
}
