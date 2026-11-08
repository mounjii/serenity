import { connection } from "next/server";
import AdminsManager from "@/components/admin/AdminsManager";
import { listStaffAdmins } from "@/server/admin/profile";
import { requireOwnerPage } from "@/server/auth/session";

export const metadata = { title: "Admins — THAI PRAKHOP" };

export default async function AdminStaffPage() {
  await connection();
  await requireOwnerPage();
  const staff = await listStaffAdmins();

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-[1.7rem] leading-tight font-semibold tracking-[-0.03em] text-forest sm:text-[2rem]">Admins</h1>
        <p className="mt-1 max-w-xl text-[0.85rem] text-sage">
          Only you can open this page. Give each admin access to the areas they need, such as prices or bookings.
        </p>
      </header>
      <AdminsManager staff={staff} />
    </div>
  );
}
