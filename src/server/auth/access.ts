import { ADMIN_AREAS, parseAdminAreas, type AdminArea } from "@/lib/admin-areas";
import { getDb } from "@/server/db";

export type AdminAccess = { owner: boolean; areas: AdminArea[] };

const ALL_AREAS = ADMIN_AREAS.map((area) => area.key);

const AREA_HOME: Record<AdminArea, string> = {
  dashboard: "/admin",
  bookings: "/admin/bookings",
  prices: "/admin/prices",
  closed: "/admin/closed-days",
  notifications: "/admin/notifications",
  activity: "/admin/activity",
};

export async function getAdminAccess(username: string): Promise<AdminAccess> {
  const current = username.trim();
  try {
    const row = await getDb().adminAccount.findFirst({
      where: { username: current },
      select: { role: true, permissions: true },
    });
    if (row?.role === "OWNER") return { owner: true, areas: ALL_AREAS };
    if (row) return { owner: false, areas: parseAdminAreas(row.permissions) };
  } catch {
    // Table or column missing before migrate: fall through to the env owner.
  }
  const main = process.env.ADMIN_USERNAME?.trim().toLowerCase();
  if (main && current.toLowerCase() === main) return { owner: true, areas: ALL_AREAS };
  return { owner: false, areas: [] };
}

export function canAccess(access: AdminAccess, area: AdminArea): boolean {
  return access.owner || access.areas.includes(area);
}

/** First page this admin is allowed to open. Profile is always available. */
export function homeFor(access: AdminAccess): string {
  const first = ADMIN_AREAS.find((area) => canAccess(access, area.key));
  return first ? AREA_HOME[first.key] : "/admin/profile";
}

export function adminPathAllowed(access: AdminAccess, path: string): boolean {
  if (path.startsWith("/admin/profile")) return true;
  if (path.startsWith("/admin/admins") || path.startsWith("/admin/loyalty")) return access.owner;
  if (path === "/admin") return canAccess(access, "dashboard");
  if (path.startsWith("/admin/bookings")) return canAccess(access, "bookings");
  if (path.startsWith("/admin/prices")) return canAccess(access, "prices");
  if (path.startsWith("/admin/closed-days")) return canAccess(access, "closed");
  if (path.startsWith("/admin/notifications")) return canAccess(access, "notifications");
  if (path.startsWith("/admin/activity")) return canAccess(access, "activity");
  return access.owner;
}
