"use client";

import { createContext, useContext, useLayoutEffect } from "react";
import { dirOf, localizePath, LOCALE_SCROLL_KEY, LOCALE_SWITCH_KEY, type Locale } from "./config";
import type { Dictionary } from "./dictionaries/en";

type I18nValue = { locale: Locale; t: Dictionary };

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ locale, dictionary, children }: { locale: Locale; dictionary: Dictionary; children: React.ReactNode }) {
  useLayoutEffect(() => {
    const html = document.documentElement;
    html.style.scrollBehavior = "auto";
    html.lang = locale;
    html.dir = dirOf(locale);
    try {
      const switchedAt = Number(sessionStorage.getItem(LOCALE_SWITCH_KEY) || 0);
      const saved = sessionStorage.getItem(LOCALE_SCROLL_KEY);
      if (saved != null && switchedAt && Date.now() - switchedAt < 4000) {
        sessionStorage.removeItem(LOCALE_SCROLL_KEY);
        window.scrollTo({ top: Number(saved), behavior: "instant" });
      }
    } catch {
      window.scrollTo({ top: window.scrollY, behavior: "instant" });
    }
    html.style.removeProperty("scroll-behavior");
  }, [locale]);

  return <I18nContext.Provider value={{ locale, t: dictionary }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside I18nProvider");
  return { ...value, href: (path: string) => localizePath(value.locale, path) };
}
