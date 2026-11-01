import type { Metadata } from "next";
import Footer from "@/components/Footer";
import SiteHeader from "@/components/SiteHeader";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.accountTitle, description: t.meta.accountDescription, robots: { index: false, follow: false } };
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-cream pt-24 pb-12 sm:pt-28 sm:pb-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-12">{children}</div>
      </main>
      <Footer />
    </>
  );
}
