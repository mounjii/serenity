import { redirect } from "next/navigation";
import { connection } from "next/server";
import AdminShell from "@/components/admin/AdminShell";
import LiveBookings from "@/components/admin/LiveBookings";
import { pollingCursor } from "@/server/admin/changes";
import { getSession } from "@/server/auth/session";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <AdminShell username={session.username}>
      <LiveBookings initialSince={pollingCursor()}>{children}</LiveBookings>
    </AdminShell>
  );
}
