import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Inter, Tajawal } from "next/font/google";
import { I18nProvider } from "@/i18n/client";
import { dirOf } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { NONCE_HEADER } from "@/lib/csp";
import { INTRO_BOOT_SCRIPT } from "@/lib/intro";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/** Arabic letters only. Inter has no Arabic glyphs, so this face covers that script on /ar. */
const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["300", "400", "500"],
  preload: false,
  adjustFontFallback: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { metadataBase: new URL(SITE_URL), title: t.meta.title, description: t.meta.description };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F7F3EC",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale, t } = await getI18n();
  const nonce = (await headers()).get(NONCE_HEADER) ?? undefined;
  return (
    <html
      lang={locale}
      dir={dirOf(locale)}
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${tajawal.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: INTRO_BOOT_SCRIPT }} />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <I18nProvider locale={locale} dictionary={t}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
