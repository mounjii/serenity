import Image from "next/image";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import AdminNav from "@/components/admin/AdminNav";
import LiveBookings from "@/components/admin/LiveBookings";
import { pollingCursor } from "@/server/admin/changes";
import { getSession } from "@/server/auth/session";
import { logoutAction } from "../actions";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-sand/70 bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo-horizontal.png"
              alt="Touch Sense Thai Massage"
              width={1012}
              height={193}
              priority
              className="h-8 w-auto"
            />
            <span className="text-[0.65rem] tracking-[0.25em] text-muted uppercase">Admin</span>
          </div>
          <form action={logoutAction} className="sm:order-last">
            <button type="submit" className="text-[0.8rem] text-ink-soft underline-offset-4 transition hover:text-ink hover:underline">
              Log out
            </button>
          </form>
          <AdminNav />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
        <LiveBookings initialSince={pollingCursor()}>{children}</LiveBookings>
      </main>
    </>
  );
}
