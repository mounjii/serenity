import type { Metadata, Viewport } from "next";
import { Amiri, Cormorant_Garamond, Jost, Tajawal } from "next/font/google";
import { I18nProvider } from "@/i18n/client";
import { dirOf } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { INTRO_BOOT_SCRIPT } from "@/lib/intro";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

/** Arabic fonts: only downloaded when Arabic text is on the page. Applied by name in globals.css for lang="ar". */
const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400", "700"],
  preload: false,
  adjustFontFallback: false,
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["300", "400", "500"],
  preload: false,
  adjustFontFallback: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.title, description: t.meta.description };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f7f3ed",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale, t } = await getI18n();
  return (
    <html
      lang={locale}
      dir={dirOf(locale)}
      className={`${cormorant.variable} ${jost.variable} ${amiri.variable} ${tajawal.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_BOOT_SCRIPT }} />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <I18nProvider locale={locale} dictionary={t}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
