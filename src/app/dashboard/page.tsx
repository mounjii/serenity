import { redirect } from "next/navigation";

export const metadata = { robots: { index: false, follow: false } };

/** Alias so /dashboard opens the salon admin dashboard. */
export default function DashboardAlias() {
  redirect("/admin");
}
