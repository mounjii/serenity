import type { MetadataRoute } from "next";
import { LOCALES, localizePath } from "@/i18n/config";
import { languageAlternates } from "@/i18n/seo";
import { SITE_URL } from "@/lib/site";

const PAGES = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/reservation", changeFrequency: "weekly", priority: 0.9 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
] as const;

const absolute = (path: string) => new URL(path, SITE_URL).toString();

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.flatMap((page) => {
    const languages = Object.fromEntries(
      Object.entries(languageAlternates(page.path)).map(([lang, path]) => [lang, absolute(path)]),
    );
    return LOCALES.map((locale) => ({
      url: absolute(localizePath(locale, page.path)),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: { languages },
    }));
  });
}
