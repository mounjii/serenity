export const LOCALES = ["en", "fr", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
/** The visitor's last choice, so returning visitors land on their language. */
export const LOCALE_COOKIE = "ts-lang";
/** Set by the proxy on every public request; read by the root layout and the pages. */
export const LOCALE_HEADER = "x-ts-locale";

export const LOCALE_NAMES: Record<Locale, string> = { en: "English", fr: "Français", ar: "العربية" };
/** Locale used for Intl dates and numbers. ar-MA keeps Western digits, as used in Morocco. */
export const INTL_LOCALE: Record<Locale, string> = { en: "en-GB", fr: "fr-FR", ar: "ar-MA" };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export const dirOf = (locale: Locale): "rtl" | "ltr" => (locale === "ar" ? "rtl" : "ltr");

/** "/reservation" → "/fr/reservation"; "/#about" → "/fr#about". English keeps the unprefixed address. */
export function localizePath(locale: Locale, path: string): string {
  if (locale === DEFAULT_LOCALE) return path;
  if (path === "/") return `/${locale}`;
  if (path.startsWith("/#") || path.startsWith("/?")) return `/${locale}${path.slice(1)}`;
  return `/${locale}${path}`;
}

/** Splits "/fr/reservation" into { locale: "fr", path: "/reservation" }. Unprefixed paths are English. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const match = /^\/(fr|ar)(?=\/|$)/.exec(pathname);
  if (!match) return { locale: DEFAULT_LOCALE, path: pathname };
  return { locale: match[1] as Locale, path: pathname.slice(match[0].length) || "/" };
}

/** Best supported language from an Accept-Language header, honouring q-values. */
export function localeFromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  const ranked = header
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => /^q=([\d.]+)$/.exec(p.trim())).find(Boolean);
      return { lang: tag.trim().toLowerCase().split("-")[0], q: q ? Number(q[1]) : 1, index };
    })
    .filter((x) => x.lang && x.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);
  return ranked.map((x) => x.lang).find(isLocale) ?? null;
}
