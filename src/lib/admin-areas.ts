/** Parts of the dashboard the main admin can grant. Members & offers stays with the owner. */
export const ADMIN_AREAS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "bookings", label: "Bookings" },
  { key: "prices", label: "Prices" },
  { key: "closed", label: "Closed days" },
  { key: "notifications", label: "Notifications" },
  { key: "activity", label: "Activity" },
] as const;

export type AdminArea = (typeof ADMIN_AREAS)[number]["key"];

const AREA_SET = new Set<string>(ADMIN_AREAS.map((area) => area.key));

export function parseAdminAreas(raw: string | null | undefined): AdminArea[] {
  const found = new Set<string>();
  for (const part of (raw ?? "").split(",")) {
    const key = part.trim();
    if (AREA_SET.has(key)) found.add(key);
  }
  return ADMIN_AREAS.map((area) => area.key).filter((key) => found.has(key));
}

export function serializeAdminAreas(areas: readonly string[]): string {
  const wanted = new Set(areas);
  return ADMIN_AREAS.map((area) => area.key)
    .filter((key) => wanted.has(key))
    .join(",");
}
