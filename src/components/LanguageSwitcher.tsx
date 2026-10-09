"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LOCALES, LOCALE_NAMES, splitLocale, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/client";
import { CheckIcon, ChevronDown } from "./Icons";

const SHORT: Record<Locale, string> = { en: "EN", fr: "FR", ar: "ع" };

/** Address of the current page in another language; /en/... tells the proxy to remember English. */
const targetOf = (locale: Locale, path: string) => `/${locale}${path === "/" ? "" : path}`;

/** Full page load on purpose: the language also changes <html lang dir>, which lives in the root layout. */
export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, t } = useI18n();
  const { path } = splitLocale(usePathname());
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  /** Keeps the query (e.g. ?service=) and the section anchor when switching. */
  const go = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.currentTarget.href = `${target}${window.location.search}${window.location.hash}`;
  };

  return (
    <div ref={root} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={`${t.nav.language}: ${LOCALE_NAMES[locale]}`}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 items-center gap-1.5 rounded-full bg-cream/75 ps-3.5 pe-2.5 text-[0.75rem] font-medium tracking-wide text-ink backdrop-blur-sm transition hover:bg-cream"
      >
        {SHORT[locale]}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          aria-label={t.nav.language}
          className="absolute end-0 top-full z-50 mt-2 min-w-40 overflow-hidden rounded-2xl border border-ink/10 bg-cream py-1.5 shadow-[0_18px_40px_-18px_rgba(40,30,20,0.4)]"
        >
          {LOCALES.map((l) => (
            <li key={l}>
              <a
                href={targetOf(l, path)}
                hrefLang={l}
                lang={l}
                aria-current={l === locale ? "true" : undefined}
                onClick={(e) => go(e, targetOf(l, path))}
                className={`flex items-center justify-between gap-4 px-4 py-2.5 text-[0.85rem] transition hover:bg-cream-dark ${
                  l === locale ? "font-medium text-ink" : "text-ink-soft"
                }`}
              >
                {LOCALE_NAMES[l]}
                {l === locale && <CheckIcon className="h-4 w-4" />}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
