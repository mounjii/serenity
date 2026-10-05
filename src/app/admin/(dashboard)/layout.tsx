import Image from "next/image";
import Link from "next/link";
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
      <header className="sticky top-0 z-30 border-b border-sand/70 bg-cream/90 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between gap-6 px-5 sm:px-8">
          <Link href="/admin" className="flex shrink-0 items-center gap-3">
            <Image
              src="/images/touch-sense-logo-horizontal.png"
              alt="Touch Sense Thai Massage"
              width={986}
              height={197}
              priority
              className="h-8 w-auto sm:h-9"
            />
            <span className="hidden border-l border-sand pl-3 text-[0.6rem] tracking-[0.3em] text-muted uppercase sm:inline">Admin</span>
          </Link>

          <AdminNav className="hidden flex-1 self-stretch justify-center md:flex" />

          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/admin/bookings/new"
              aria-label="New booking"
              className="grid h-9 w-9 place-items-center rounded-full bg-ink text-lg leading-none text-cream transition hover:bg-black md:hidden"
            >
              +
            </Link>
            <div className="hidden items-center gap-2.5 lg:flex">
              <span className="grid h-8 w-8 place-items-center rounded-full border border-sand bg-white font-serif text-[0.95rem] text-ink uppercase">
                {session.username.charAt(0)}
              </span>
              <span className="text-[0.8rem] text-ink">{session.username}</span>
            </div>
            <span className="hidden h-5 w-px bg-sand lg:block" aria-hidden />
            <form action={logoutAction}>
              <button type="submit" className="rounded-full px-3 py-1.5 text-[0.78rem] text-ink-soft transition hover:bg-white hover:text-ink">
                Log out
              </button>
            </form>
          </div>
        </div>
        <AdminNav className="border-t border-sand/60 px-5 sm:px-8 md:hidden" />
      </header>
      <main className="mx-auto max-w-[1240px] px-5 py-10 sm:px-8 sm:py-14">
        <LiveBookings initialSince={pollingCursor()}>{children}</LiveBookings>
      </main>
    </>
  );
}
