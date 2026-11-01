"use client";

import { useActionState, useTransition } from "react";
import { redeemPointsAction, saveBirthdayAction, type LoyaltyFormState } from "@/app/account/actions";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/i18n/client";
import { fmt } from "@/i18n/format";
import { formatPrice } from "@/lib/format";
import { REDEEM_OPTIONS, type LoyaltyTier } from "@/lib/loyalty-rules";
import type { LoyaltyCard as Card } from "@/server/loyalty/engine";

const TIER_LOOK: Record<LoyaltyTier, string> = {
  BRONZE: "border-[#d8b896] bg-[#f6eee4]",
  SILVER: "border-[#c5cdd6] bg-[#eef2f6]",
  GOLD: "border-[#e0d09a] bg-[#fbf7ec]",
};

export default function LoyaltyCard({ card }: { card: Card }) {
  const { t, locale } = useI18n();
  const [pending, start] = useTransition();
  const [birthdayState, birthdayAction, birthdayPending] = useActionState(saveBirthdayAction, { error: null } satisfies LoyaltyFormState);
  const nextLabel = card.next.next ? t.loyalty.tiers[card.next.next] : null;

  return (
    <section className={`rounded-lg border p-5 shadow-[0_20px_40px_-32px_rgba(60,40,20,0.35)] sm:p-6 ${TIER_LOOK[card.tier]}`}>
      <p className="text-[0.7rem] tracking-[0.32em] text-bronze uppercase">{t.loyalty.cardEyebrow}</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-serif text-3xl text-ink">{t.loyalty.tiers[card.tier]}</h2>
        <p className="text-[1.35rem] font-medium text-ink">{fmt(t.loyalty.points, { n: card.points })}</p>
      </div>
      <p className="mt-2 text-[0.9rem] text-ink-soft">{t.loyalty.perks[card.tier]}</p>
      {nextLabel && (
        <p className="mt-3 text-[0.82rem] text-ink-soft">{fmt(t.loyalty.nextTier, { n: card.next.remaining, tier: nextLabel })}</p>
      )}

      {card.vouchers.length > 0 && (
        <div className="mt-6">
          <h3 className="text-[0.78rem] tracking-wide text-muted uppercase">{t.loyalty.vouchersTitle}</h3>
          <ul className="mt-3 space-y-2">
            {card.vouchers.map((voucher) => (
              <li key={voucher.id} className="rounded-lg border border-ink/10 bg-white/80 px-4 py-3">
                <p className="font-medium text-ink">{voucher.title}</p>
                <p className="mt-1 text-[0.8rem] text-ink-soft">
                  {t.loyalty.code} <span className="font-medium tracking-wide text-ink">{voucher.code}</span>
                  {voucher.serviceName ? ` · ${voucher.serviceName}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-[0.78rem] tracking-wide text-muted uppercase">{t.loyalty.redeemTitle}</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {REDEEM_OPTIONS.map((option) => (
            <Button
              key={option.points}
              type="button"
              variant="outline"
              size="sm"
              disabled={pending || card.points < option.points}
              loading={pending}
              onClick={() => start(() => void redeemPointsAction(option.points))}
            >
              {fmt(t.loyalty.redeem, { points: option.points, price: formatPrice(option.discountCents, locale) })}
            </Button>
          ))}
        </div>
      </div>

      <form action={birthdayAction} className="mt-6 border-t border-ink/10 pt-5">
        <label htmlFor="birthday" className="mb-1.5 block text-[0.8rem]">
          {t.loyalty.birthday}
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            id="birthday"
            name="birthday"
            type="date"
            defaultValue={card.birthday ?? ""}
            className="block w-full rounded-sm border border-sand bg-white px-4 py-3 text-[0.95rem] text-ink outline-none focus:border-ink sm:max-w-56"
          />
          <Button type="submit" variant="outline" size="sm" loading={birthdayPending}>
            {t.loyalty.saveBirthday}
          </Button>
        </div>
        <p className="mt-2 text-[0.75rem] text-muted">{t.loyalty.birthdayHint}</p>
        {birthdayState.error && <p className="mt-2 text-[0.78rem] text-red-700">{birthdayState.error}</p>}
        {birthdayState.saved && <p className="mt-2 text-[0.78rem] text-olive-dark">{t.loyalty.birthdaySaved}</p>}
      </form>
    </section>
  );
}
