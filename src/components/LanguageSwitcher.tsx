"use client";

import { usePathname } from "next/navigation";
import { LOCALES, LOCALE_NAMES, splitLocale, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/client";

const SHORT: Record<Locale, string> = { en: "EN", fr: "FR", ar: "ع" };

/** Address of the current page in another language; /en/... tells the proxy to remember English. */
const targetOf = (locale: Locale, path: string) => `/${locale}${path === "/" ? "" : path}`;

/** Full page load on purpose: the language also changes <html lang dir>, which lives in the root layout. */
export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, t } = useI18n();
  const { path } = splitLocale(usePathname());

  /** Keeps the query (e.g. ?service=) and the section anchor when switching. */
  const go = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.currentTarget.href = `${target}${window.location.search}${window.location.hash}`;
  };

  return (
    <div role="group" aria-label={t.nav.language} className={`flex items-center gap-0.5 rounded-full bg-cream/75 p-0.5 backdrop-blur-sm ${className}`}>
      {LOCALES.map((l) => (
        <a
          key={l}
          href={targetOf(l, path)}
          hrefLang={l}
          lang={l}
          title={LOCALE_NAMES[l]}
          aria-label={LOCALE_NAMES[l]}
          aria-current={l === locale ? "true" : undefined}
          onClick={(e) => go(e, targetOf(l, path))}
          className={`grid h-8 min-w-8 place-items-center rounded-full px-1.5 text-[0.72rem] tracking-wide transition ${
            l === locale ? "bg-ink font-medium text-cream" : "text-ink-soft hover:text-ink"
          }`}
        >
          {SHORT[l]}
        </a>
      ))}
    </div>
  );
}
