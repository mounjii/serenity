import { formatPhone } from "@/lib/phone";
import { requireAdminPage } from "@/server/auth/session";
import { listLoyaltyMembers } from "@/server/loyalty/engine";
import LoyaltyPromoForm from "@/components/admin/LoyaltyPromoForm";

export default async function AdminLoyaltyPage() {
  await requireAdminPage();
  const members = await listLoyaltyMembers();

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
      <p className="text-[0.7rem] tracking-[0.28em] text-muted uppercase">Loyalty</p>
      <h1 className="mt-2 font-serif text-3xl text-ink">Members & offers</h1>
      <p className="mt-2 max-w-xl text-[0.9rem] text-ink-soft">
        Points are earned when a visit is marked completed. Send a promo to every customer account below.
      </p>

      <LoyaltyPromoForm />

      <section className="mt-8 overflow-hidden rounded-lg bg-white shadow-[0_20px_40px_-32px_rgba(60,40,20,0.35)]">
        {members.length === 0 ? (
          <p className="px-5 py-8 text-center text-[0.85rem] text-muted">No customer accounts yet.</p>
        ) : (
          <table className="w-full text-start text-[0.85rem]">
            <thead className="border-b border-sand/70 text-[0.72rem] tracking-wide text-muted uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Tier</th>
                <th className="px-4 py-3 font-medium">Visits</th>
                <th className="px-4 py-3 font-medium">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/60">
              {members.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-3 text-ink">{m.name}</td>
                  <td className="px-4 py-3 text-ink-soft" dir="ltr">
                    {formatPhone(m.phone)}
                  </td>
                  <td className="px-4 py-3 text-ink">{m.tier}</td>
                  <td className="px-4 py-3 text-ink">{m.visits}</td>
                  <td className="px-4 py-3 text-ink">{m.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
