import type { Metadata } from "next";
import { OG_IMAGE, SITE_NAME } from "@/lib/site";
import { DEFAULT_LOCALE, LOCALES, localizePath, type Locale } from "./config";

const OG_LOCALE: Record<Locale, string> = { en: "en_US", fr: "fr_FR", ar: "ar_MA" };

/** Same page in every language, for hreflang links and the sitemap. x-default is the English address. */
export function languageAlternates(path: string): Record<string, string> {
  const entries = LOCALES.map((l) => [l, localizePath(l, path)] as const);
  return { ...Object.fromEntries(entries), "x-default": localizePath(DEFAULT_LOCALE, path) };
}

/** Title, description, canonical link, other languages and share preview of an indexable public page. */
export function pageMetadata(locale: Locale, path: string, title: string, description: string): Metadata {
  const url = localizePath(locale, path);
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      images: [{ ...OG_IMAGE, alt: SITE_NAME }],
    },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE.url] },
  };
}
