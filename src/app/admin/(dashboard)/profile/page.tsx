import { connection } from "next/server";
import AdminProfileForm from "@/components/admin/AdminProfileForm";
import { getAdminProfile } from "@/server/admin/profile";
import { requireAdminPage } from "@/server/auth/session";

export const metadata = { title: "Profile — THAI PRAKHOP" };

export default async function AdminProfilePage() {
  await connection();
  const session = await requireAdminPage();
  const profile = await getAdminProfile(session.username);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header>
        <h1 className="text-[1.7rem] leading-tight font-semibold tracking-[-0.03em] text-forest sm:text-[2rem]">Profile</h1>
        <p className="mt-1 text-[0.85rem] text-sage">Change the name shown in the dashboard and the password used to sign in.</p>
      </header>
      <AdminProfileForm username={profile.username} avatarUrl={profile.avatarUrl} />
    </div>
  );
}
