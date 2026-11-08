"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  LOCALES,
  LOCALE_COOKIE,
  LOCALE_NAMES,
  LOCALE_SCROLL_KEY,
  LOCALE_SWITCH_KEY,
  localizePath,
  splitLocale,
  type Locale,
} from "@/i18n/config";
import { useI18n } from "@/i18n/client";
import { CheckIcon, ChevronDown } from "./Icons";

const SHORT: Record<Locale, string> = { en: "EN", fr: "FR", ar: "ع" };
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${COOKIE_MAX_AGE};samesite=lax`;
}

function rememberSwitchPosition() {
  try {
    sessionStorage.setItem(LOCALE_SWITCH_KEY, String(Date.now()));
    sessionStorage.setItem(LOCALE_SCROLL_KEY, String(window.scrollY));
  } catch {
    // Private browsing can block storage; the switch still proceeds.
  }
}

export default function LanguageSwitcher({
  className = "",
  variant = "menu",
}: {
  className?: string;
  variant?: "menu" | "inline" | "icon";
}) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const path = splitLocale(pathname).path;
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<{ top?: number; bottom?: number; left: number } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const box = button.current?.getBoundingClientRect();
      if (!box) return;
      const margin = 12;
      const width = 176;
      const left = Math.min(Math.max(margin, box.right - width), window.innerWidth - width - margin);
      const roomBelow = window.innerHeight - box.bottom;
      setMenu(
        roomBelow < 180
          ? { bottom: window.innerHeight - box.top + 8, left }
          : { top: box.bottom + 8, left },
      );
    };
    place();
    const onPointer = (e: PointerEvent) => {
      if (
        !root.current?.contains(e.target as Node) &&
        !(
          e.target instanceof Node &&
          document.getElementById("language-menu")?.contains(e.target)
        )
      ) {
        setOpen(false);
        setMenu(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setMenu(null);
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  const switchTo = (e: React.MouseEvent<HTMLAnchorElement>, next: Locale) => {
    setOpen(false);
    setMenu(null);
    if (next === locale) {
      e.preventDefault();
      return;
    }
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    rememberLocale(next);
    rememberSwitchPosition();
    const currentPath = splitLocale(window.location.pathname).path;
    const href = `${localizePath(next, currentPath)}${window.location.search}${window.location.hash}`;
    // A full load is required: /fr and /ar are rewritten onto the same page, so a soft navigation keeps the old language on phones.
    window.location.assign(href);
  };

  if (variant === "inline") {
    return (
      <nav aria-label={t.nav.language} className={`flex items-center gap-3 ${className}`}>
        {LOCALES.map((l) => (
          <Link
            key={l}
            href={localizePath(l, path)}
            hrefLang={l}
            lang={l}
            scroll={false}
            aria-current={l === locale ? "true" : undefined}
            onClick={(e) => switchTo(e, l)}
            className={`inline-flex min-h-11 items-center text-[0.9rem] transition hover:text-forest ${
              l === locale ? "font-medium text-forest" : "text-sage"
            }`}
          >
            {SHORT[l]}
          </Link>
        ))}
      </nav>
    );
  }

  const menuList = open && menu && (
    <ul
      id="language-menu"
      aria-label={t.nav.language}
      style={{ top: menu.top, bottom: menu.bottom, left: menu.left }}
      className="fixed z-[80] min-w-40 overflow-hidden rounded-lg border border-sand bg-white py-1.5 shadow-[0_18px_40px_-18px_rgba(40,30,20,0.4)]"
    >
      {LOCALES.map((l) => (
        <li key={l}>
          <Link
            href={localizePath(l, path)}
            hrefLang={l}
            lang={l}
            scroll={false}
            aria-current={l === locale ? "true" : undefined}
            onClick={(e) => switchTo(e, l)}
            className={`flex items-center justify-between gap-4 px-4 py-2.5 text-[0.85rem] transition hover:bg-cream ${
              l === locale ? "font-medium text-ink" : "text-ink-soft"
            }`}
          >
            {LOCALE_NAMES[l]}
            {l === locale && <CheckIcon className="h-4 w-4" />}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <div ref={root} className={`relative shrink-0 ${className}`}>
      <button
        ref={button}
        type="button"
        aria-label={`${t.nav.language}: ${LOCALE_NAMES[locale]}`}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="language-menu"
        onClick={() => {
          setOpen((v) => !v);
          setMenu(null);
        }}
        className={
          variant === "icon"
            ? "grid h-11 w-11 place-items-center rounded-full border border-sand bg-white text-forest transition hover:border-forest"
            : "flex h-11 items-center gap-1 rounded-full border border-sand bg-white ps-4 pe-3 text-[0.84rem] font-medium text-ink transition hover:border-black/25"
        }
      >
        {variant === "icon" ? (
          <GlobeIcon className="h-5 w-5" />
        ) : (
          <>
            {SHORT[locale]}
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
          </>
        )}
      </button>
      {menuList && createPortal(menuList, document.body)}
    </div>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M3.75 12h16.5" />
      <path d="M12 3.75c2.2 2.35 3.4 5.2 3.4 8.25s-1.2 5.9-3.4 8.25c-2.2-2.35-3.4-5.2-3.4-8.25s1.2-5.9 3.4-8.25Z" />
    </svg>
  );
}
