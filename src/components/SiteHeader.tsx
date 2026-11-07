import { getDb } from "@/server/db";
import { getCustomerSession } from "@/server/customer/session";
import { countUnreadAlerts } from "@/server/loyalty/engine";
import Navbar from "./Navbar";

export default async function SiteHeader() {
  const session = await getCustomerSession();
  const [alertCount, avatar] = session
    ? await Promise.all([
        countUnreadAlerts(session.id),
        getDb().customer.findUnique({ where: { id: session.id }, select: { avatarType: true, updatedAt: true } }),
      ])
    : [0, null];
  const avatarUrl = avatar?.avatarType ? `/account/avatar?v=${avatar.updatedAt.getTime()}` : null;
  return <Navbar signedIn={Boolean(session)} alertCount={alertCount} avatarUrl={avatarUrl} name={session?.name ?? ""} />;
}
