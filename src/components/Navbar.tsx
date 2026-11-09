"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Logo";
import { ArrowRight, ArrowUpRight, CloseIcon, MenuIcon } from "./Icons";
import { splitLocale } from "@/i18n/config";
import { useI18n } from "@/i18n/client";
import { fmt } from "@/i18n/format";
import { navLinks, RESERVATION_PATH } from "@/lib/navigation";

const hashOf = (href: string) => href.slice(href.indexOf("#"));

/** Set to true to show the Login button again. Signed-in customers still see their name. */
const SHOW_LOGIN = false;

export default function Navbar({
  signedIn = false,
  alertCount = 0,
  avatarUrl = null,
  name = "",
}: {
  signedIn?: boolean;
  alertCount?: number;
  avatarUrl?: string | null;
  name?: string;
}) {
  const { t, href } = useI18n();
  const pathname = usePathname();
  const isHome = splitLocale(pathname).path === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("#home");
  const active = isHome ? activeHash : null;
  const progressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 24);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progressRef.current)
        progressRef.current.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
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
  const notices = signedIn ? alertCount : 0;
  const displayName = name.trim() || t.nav.account;
  const accountLabel =
    notices > 0
      ? `${signedIn ? displayName : t.nav.login}, ${fmt(t.nav.alerts, { n: notices })}`
      : undefined;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 font-display transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open
            ? "bg-ivory py-3 lg:py-4"
            : scrolled
              ? "bg-ivory/90 py-3 shadow-[0_1px_0_rgba(0,0,0,0.05)] backdrop-blur-md"
              : "bg-transparent py-4 lg:py-5"
        }`}
      >
        <span
          ref={progressRef}
          aria-hidden
          className={`absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 rtl:origin-right bg-forest/50 transition-opacity duration-500 ${scrolled && !open ? "opacity-100" : "opacity-0"}`}
        />
        <nav className="flex w-full items-center justify-between px-5 sm:px-6 lg:px-8">
          <Logo />

          <ul className="hidden items-center gap-6 xl:gap-10 lg:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={href(link.href)}
                  className={`group relative pb-1.5 text-[0.82rem] tracking-wide transition-colors duration-500 hover:text-ink ${
                    active === hashOf(link.href) || !scrolled
                      ? "text-ink"
                      : "text-ink-soft"
                  } ${scrolled ? "" : "font-medium"}`}
                >
                  {t.nav[link.key]}
                  <span
                    className={`absolute -bottom-0.5 left-1/2 h-px -translate-x-1/2 bg-forest transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      active === hashOf(link.href) ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex shrink-0 items-center gap-2">
            {SHOW_LOGIN || signedIn ? (
              <Link
                href={href(signedIn ? "/account" : "/account/login")}
                aria-label={accountLabel ?? (signedIn ? displayName : t.nav.login)}
                className="relative hidden h-11 items-center gap-2 rounded-full border border-sand bg-white px-3.5 text-[0.8rem] font-medium text-ink transition hover:border-forest lg:inline-flex xl:px-5"
              >
                {signedIn ? <ProfileMark src={avatarUrl} name={name} /> : null}
                <span className="max-w-36 truncate">{signedIn ? displayName : t.nav.login}</span>
                <AlertBadge count={notices} />
              </Link>
            ) : null}
            {signedIn ? (
              <Link
                href={href("/account")}
                aria-label={accountLabel ?? displayName}
                className="relative grid h-11 w-11 place-items-center rounded-full border border-sand bg-white lg:hidden"
              >
                <ProfileMark src={avatarUrl} name={name} />
                <AlertBadge count={notices} />
              </Link>
            ) : null}
            <Link
              href={href(RESERVATION_PATH)}
              className="hidden h-11 items-center gap-1.5 rounded-full bg-forest px-4 text-[0.82rem] font-medium text-white transition hover:bg-forest-dark sm:inline-flex xl:px-5"
            >
              {t.nav.bookNow}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>

            <button
              type="button"
              aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="-me-2 grid h-11 w-11 place-items-center rounded-md bg-white/80 text-ink backdrop-blur-sm transition active:bg-white/90 lg:hidden"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? (
                <CloseIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </nav>
      </header>

      <div
        id="mobile-menu"
        inert={!open}
        className={`fixed inset-0 z-40 flex flex-col bg-cream px-6 pt-24 pb-safe font-display transition-[opacity,visibility] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${
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
                href={href(link.href)}
                onClick={close}
                className="flex items-center justify-between border-b border-sand/80 py-4 text-[2rem] leading-none font-semibold tracking-[-0.03em] text-ink"
              >
                {t.nav[link.key]}
                <ArrowRight
                  className="h-4 w-4 text-muted rtl:-scale-x-100"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>

        <div
          style={{ transitionDelay: open ? "380ms" : "0ms" }}
          className={`space-y-3 pt-6 pb-4 transition-all duration-500 ${open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        >
          <div className="flex justify-center pb-1">
            <LanguageSwitcher variant="icon" />
          </div>
          <Link
            href={href(RESERVATION_PATH)}
            onClick={close}
            className="flex min-h-13 items-center justify-center gap-2 rounded-full bg-forest text-[0.9rem] tracking-wide text-cream"
          >
            {t.nav.bookNow}{" "}
            <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
          </Link>
          {(SHOW_LOGIN || signedIn) && (
            <Link
              href={href(signedIn ? "/account" : "/account/login")}
              onClick={close}
              aria-label={accountLabel}
              className="relative flex min-h-12 items-center justify-center gap-2 rounded-full border border-forest/25 text-[0.85rem] text-ink"
            >
              {signedIn ? <ProfileMark src={avatarUrl} name={name} /> : null}
              <span className="max-w-48 truncate">{signedIn ? displayName : t.nav.login}</span>
              <AlertBadge count={notices} />
            </Link>
          )}
          <p className="pt-2 text-center text-[0.72rem] tracking-wide text-muted">
            {t.nav.hours}
          </p>
        </div>
      </div>
    </>
  );
}

function ProfileMark({ src, name }: { src: string | null; name: string }) {
  return (
    <span className="grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-full bg-forest text-[0.75rem] font-semibold text-white uppercase">
      {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : name.slice(0, 1)}
    </span>
  );
}

function AlertBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-1.5 -end-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-[#E11D2E] px-1 text-[0.65rem] leading-none font-semibold text-white">
      {count > 9 ? "9+" : count}
    </span>
  );
}
