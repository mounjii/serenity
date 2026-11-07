import CustomerAvatar from "@/components/admin/CustomerAvatar";
import LoyaltyPromoForm from "@/components/admin/LoyaltyPromoForm";
import { formatPhone } from "@/lib/phone";
import { requireOwnerPage } from "@/server/auth/session";
import { listLoyaltyMembers } from "@/server/loyalty/engine";

export default async function AdminLoyaltyPage() {
  await requireOwnerPage();
  const members = await listLoyaltyMembers();

  return (
    <div className="space-y-5 sm:space-y-6">
      <header>
        <h1 className="text-[1.7rem] leading-tight font-semibold tracking-[-0.03em] text-forest sm:text-[2rem]">Members & offers</h1>
        <p className="mt-1 max-w-xl text-[0.85rem] text-sage">
        Points are earned when a visit is marked completed. Send a promo to every customer account below.
      </p>
      </header>

      <LoyaltyPromoForm />

      <section className="overflow-hidden rounded-2xl border border-sand bg-white">
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
                  <td className="px-4 py-3 text-ink">
                    <span className="flex items-center gap-2.5">
                      <CustomerAvatar id={m.id} name={m.name} updatedAt={m.avatarUpdatedAt} />
                      <span className="min-w-0 truncate">{m.name}</span>
                    </span>
                  </td>
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
