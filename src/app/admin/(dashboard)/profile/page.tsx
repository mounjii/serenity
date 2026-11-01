import { connection } from "next/server";
import AdminProfileForm from "@/components/admin/AdminProfileForm";
import { getAdminProfile } from "@/server/admin/profile";
import { requireAdminPage } from "@/server/auth/session";

export const metadata = { title: "Profile — Touch Sense" };

export default async function AdminProfilePage() {
  await connection();
  await requireAdminPage();
  const profile = await getAdminProfile();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-4xl text-ink">Profile</h1>
      <p className="mt-1 text-[0.85rem] text-ink-soft">Change the name shown in the dashboard and the password used to sign in.</p>
      <AdminProfileForm username={profile.username} />
    </div>
  );
}
