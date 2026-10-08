import { headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_HEADER, isLocale, localizePath, type Locale } from "./config";
import { getDictionary } from "./dictionaries";

/** Language of the current request, as resolved by the proxy from the /fr or /ar prefix. */
export async function getLocale(): Promise<Locale> {
  const value = (await headers()).get(LOCALE_HEADER);
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getI18n() {
  const locale = await getLocale();
  return { locale, t: getDictionary(locale), href: (path: string) => localizePath(locale, path) };
}
