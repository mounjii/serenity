import LoyaltyAlerts from "@/components/account/LoyaltyAlerts";
import LoyaltyCard from "@/components/account/LoyaltyCard";
import { getI18n } from "@/i18n/server";
import { getLoyaltyCard } from "@/server/loyalty/engine";
import { requireCustomerPage } from "@/server/customer/session";

export default async function LoyaltyPage() {
  const session = await requireCustomerPage();
  const { t, locale } = await getI18n();
  const card = await getLoyaltyCard(session.id, locale);

  return (
    <div className="space-y-5">
      <h1 className="text-[1.5rem] font-semibold tracking-[-0.03em] text-ink">{t.account.navLoyalty}</h1>
      <LoyaltyAlerts alerts={card.alerts} />
      <LoyaltyCard card={card} />
    </div>
  );
}
