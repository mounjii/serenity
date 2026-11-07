import { connection } from "next/server";
import PricesManager from "@/components/admin/PricesManager";
import { listPricedServices } from "@/server/admin/prices";
import { requireArea } from "@/server/auth/session";

export const metadata = { title: "Prices — Touch Sense" };

export default async function AdminPricesPage() {
  await connection();
  await requireArea("prices");
  const services = await listPricedServices();

  return (
    <div className="space-y-5 sm:space-y-6">
      <header>
        <h1 className="text-[1.7rem] leading-tight font-semibold tracking-[-0.03em] text-forest sm:text-[2rem]">Prices</h1>
        <p className="mt-1 max-w-xl text-[0.85rem] text-sage">Open a treatment to change its prices. Booking on or off hides it from new reservations.</p>
      </header>
      <PricesManager services={services} />
    </div>
  );
}
