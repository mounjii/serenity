"use client";

import { useTransition } from "react";
import { redeemPointsAction } from "@/app/account/actions";
import { useI18n } from "@/i18n/client";
import { fmt } from "@/i18n/format";
import { formatPrice } from "@/lib/format";
import { GOLD_VISITS, REDEEM_OPTIONS, SILVER_VISITS, type LoyaltyTier } from "@/lib/loyalty-rules";
import type { LoyaltyCard as Card } from "@/server/loyalty/engine";

const GOAL: Record<LoyaltyTier, number> = { BRONZE: SILVER_VISITS, SILVER: GOLD_VISITS, GOLD: GOLD_VISITS };

export default function LoyaltyCard({ card }: { card: Card }) {
  const { t, locale } = useI18n();
  const [pending, start] = useTransition();
  const goal = GOAL[card.tier];
  const progress = card.tier === "GOLD" ? 1 : Math.min(1, card.completedVisits / goal);
  const tierName = t.loyalty.tiers[card.tier];

  return (
    <div id="loyalty" className="scroll-mt-28 space-y-4">
      <section className="rounded-2xl bg-forest p-5 text-white sm:p-6">
        <p className="text-[0.68rem] font-medium tracking-[0.22em] text-white/55 uppercase">{t.loyalty.cardEyebrow}</p>
        <div className="mt-4 flex items-start justify-between gap-4">
          <h2 className="text-[1.7rem] leading-none font-semibold tracking-[-0.03em]">{fmt(t.account.member, { tier: tierName })}</h2>
          <p className="text-[1.35rem] font-semibold tracking-[-0.03em]">{fmt(t.account.pointsShort, { n: card.points })}</p>
        </div>
        <p className="mt-3 max-w-sm text-[0.85rem] leading-snug text-white/70">{t.loyalty.perks[card.tier]}</p>
        <div className="mt-6">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-white" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          <p className="mt-2 flex items-center justify-between gap-3 text-[0.75rem] text-white/65">
            <span>
              {card.next.next
                ? fmt(t.loyalty.nextTier, { n: card.next.remaining, tier: t.loyalty.tiers[card.next.next] })
                : fmt(t.account.visitsCount, { n: card.completedVisits })}
            </span>
            {card.next.next && <span className="shrink-0">{fmt(t.account.visitsOf, { done: card.completedVisits, goal })}</span>}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-sand bg-white p-4 sm:p-5">
        <h2 className="text-[1.05rem] font-semibold tracking-[-0.02em] text-ink">{t.loyalty.redeemTitle}</h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {REDEEM_OPTIONS.map((option) => {
            const ready = card.points >= option.points;
            return (
              <button
                key={option.points}
                type="button"
                disabled={pending || !ready}
                onClick={() => start(() => void redeemPointsAction(option.points))}
                className="rounded-2xl border border-sand bg-ivory px-2 py-3 text-center transition hover:border-forest/30 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <span className="block text-[0.78rem] font-semibold text-ink">{fmt(t.account.pointsShort, { n: option.points })}</span>
                <span className="mt-1 block text-[0.68rem] leading-tight text-sage">
                  {fmt(t.account.off, { price: formatPrice(option.discountCents, locale) })}
                </span>
              </button>
            );
          })}
        </div>

        {card.vouchers.length > 0 && (
          <ul className="mt-4 space-y-2">
            {card.vouchers.map((voucher) => (
              <li key={voucher.id} className="rounded-2xl border border-sand px-4 py-3">
                <p className="text-[0.88rem] font-medium text-ink">{voucher.title}</p>
                <p className="mt-1 text-[0.78rem] text-sage">
                  {t.loyalty.code} <span className="font-medium text-ink">{voucher.code}</span>
                  {voucher.serviceName ? `, ${voucher.serviceName}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
