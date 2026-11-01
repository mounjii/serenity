"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LOCALES, LOCALE_COOKIE, LOCALE_NAMES, LOCALE_SCROLL_KEY, LOCALE_SWITCH_KEY, localizePath, splitLocale, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/client";
import { CheckIcon, ChevronDown } from "./Icons";

const SHORT: Record<Locale, string> = { en: "EN", fr: "FR", ar: "ع" };
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${COOKIE_MAX_AGE};samesite=lax`;
}

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const path = splitLocale(typeof window === "undefined" ? pathname : window.location.pathname).path;
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<{ top: number; end: number } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      setMenu(null);
      return;
    }
    const place = () => {
      const box = button.current?.getBoundingClientRect();
      if (!box) return;
      const rtl = document.documentElement.dir === "rtl";
      setMenu({ top: box.bottom + 8, end: rtl ? box.left : window.innerWidth - box.right });
    };
    place();
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node) && !(e.target instanceof Node && document.getElementById("language-menu")?.contains(e.target))) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
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
    if (next === locale) {
      e.preventDefault();
      return;
    }
    rememberLocale(next);
    const currentPath = splitLocale(window.location.pathname).path;
    const href = `${localizePath(next, currentPath)}${window.location.search}`;
    try {
      sessionStorage.setItem(LOCALE_SWITCH_KEY, String(Date.now()));
      sessionStorage.setItem(LOCALE_SCROLL_KEY, String(window.scrollY));
    } catch {}
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    window.location.assign(href);
  };

  const menuList = open && menu && (
    <ul
      id="language-menu"
      aria-label={t.nav.language}
      style={{ top: menu.top, insetInlineEnd: menu.end }}
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
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 items-center gap-1.5 rounded-full border border-ink/20 bg-white/90 ps-3.5 pe-2.5 text-[0.75rem] font-medium tracking-wide text-ink shadow-sm backdrop-blur-sm transition hover:border-ink hover:bg-white"
      >
        {SHORT[locale]}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {menuList && createPortal(menuList, document.body)}
    </div>
  );
}
