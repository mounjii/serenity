"use client";

import { useEffect } from "react";
import { markAlertsReadAction } from "@/app/account/actions";
import { useI18n } from "@/i18n/client";
import { fmt } from "@/i18n/format";
import type { LoyaltyCard } from "@/server/loyalty/engine";

function alertText(kind: string, payload: Record<string, string>, t: ReturnType<typeof useI18n>["t"]): string {
  if (kind === "POINTS") return fmt(t.loyalty.alertPoints, { n: payload.points ?? "0" });
  if (kind === "TIER") return fmt(t.loyalty.alertTier, { tier: t.loyalty.tiers[(payload.tier as "BRONZE" | "SILVER" | "GOLD") ?? "BRONZE"] });
  if (kind === "BIRTHDAY") return fmt(t.loyalty.alertBirthday, { percent: payload.percent ?? "15", code: payload.code ?? "" });
  if (kind === "PERSONALIZED") return fmt(t.loyalty.alertPersonalized, { percent: payload.percent ?? "10", service: payload.service ?? "", code: payload.code ?? "" });
  if (kind === "PROMO") return payload.message ?? t.loyalty.alertPromo;
  if (kind === "VOUCHER") return fmt(t.loyalty.alertVoucher, { amount: payload.amount ?? "", code: payload.code ?? "" });
  return t.loyalty.alertPromo;
}

export default function LoyaltyAlerts({ alerts }: { alerts: LoyaltyCard["alerts"] }) {
  const { t } = useI18n();
  const unread = alerts.some((a) => !a.read);

  useEffect(() => {
    if (unread) void markAlertsReadAction();
  }, [unread]);

  if (alerts.length === 0) return null;

  return (
    <section className="rounded-lg bg-white p-5 shadow-[0_20px_40px_-32px_rgba(60,40,20,0.35)] sm:p-6">
      <h2 className="font-serif text-2xl text-ink">{t.loyalty.alertsTitle}</h2>
      <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto pe-1">
        {alerts.map((alert) => (
          <li
            key={alert.id}
            className={`rounded-lg border px-4 py-3 text-[0.88rem] ${alert.read ? "border-sand/70 text-ink-soft" : "border-gold/40 bg-gold/10 text-ink"}`}
          >
            {alertText(alert.kind, alert.payload, t)}
          </li>
        ))}
      </ul>
    </section>
  );
}
