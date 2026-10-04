import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Serenity",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return <div className="min-h-screen bg-cream text-ink">{children}</div>;
}
