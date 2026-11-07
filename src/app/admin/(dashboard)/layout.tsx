import { redirect } from "next/navigation";
import { connection } from "next/server";
import AdminShell from "@/components/admin/AdminShell";
import LiveBookings from "@/components/admin/LiveBookings";
import { pollingCursor } from "@/server/admin/changes";
import { getAdminProfile } from "@/server/admin/profile";
import { getAdminAccess, homeFor } from "@/server/auth/access";
import { getSession } from "@/server/auth/session";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const [profile, access] = await Promise.all([getAdminProfile(session.username), getAdminAccess(session.username)]);
  const watchBookings = access.owner || access.areas.includes("bookings") || access.areas.includes("dashboard");

  return (
    <AdminShell username={session.username} avatarUrl={profile.avatarUrl} owner={access.owner} areas={access.areas} home={homeFor(access)}>
      <LiveBookings initialSince={pollingCursor()} live={watchBookings} canOpenBookings={access.owner || access.areas.includes("bookings")}>
        {children}
      </LiveBookings>
    </AdminShell>
  );
}
