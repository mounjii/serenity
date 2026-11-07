"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { markAlertsReadAction } from "@/app/account/actions";
import { ChevronDown, ClockIcon } from "@/components/Icons";
import { useI18n } from "@/i18n/client";
import { fmt, formatLongDateIn } from "@/i18n/format";
import { serviceText } from "@/i18n/services";
import { toLocalTimeString } from "@/lib/time";
import type { Locale } from "@/i18n/config";
import type { LoyaltyCard } from "@/server/loyalty/engine";

const PREVIEW = 3;
const OFFER_PHOTO = "/images/offer-still.jpg";

type Alert = LoyaltyCard["alerts"][number];
type Voucher = LoyaltyCard["vouchers"][number];
type Copy = ReturnType<typeof useI18n>["t"];

function alertText(kind: string, payload: Record<string, string>, t: Copy, locale: Locale): string {
  if (kind === "CONFIRMED") {
    const start = payload.startAt ? new Date(payload.startAt) : null;
    const valid = Boolean(start && !Number.isNaN(start.getTime()));
    const service = serviceText(t, { slug: payload.slug ?? "", name: payload.service ?? "", description: "" }).name;
    return fmt(t.loyalty.alertConfirmed, {
      service,
      date: valid && start ? formatLongDateIn(locale, start) : "",
      time: valid && start ? toLocalTimeString(start) : "",
    });
  }
  if (kind === "POINTS") return fmt(t.loyalty.alertPoints, { n: payload.points ?? "0" });
  if (kind === "TIER") return fmt(t.loyalty.alertTier, { tier: t.loyalty.tiers[(payload.tier as "BRONZE" | "SILVER" | "GOLD") ?? "BRONZE"] });
  if (kind === "BIRTHDAY") return fmt(t.loyalty.alertBirthday, { percent: payload.percent ?? "15", code: payload.code ?? "" });
  if (kind === "PERSONALIZED") return fmt(t.loyalty.alertPersonalized, { percent: payload.percent ?? "10", service: payload.service ?? "", code: payload.code ?? "" });
  if (kind === "PROMO") {
    const message = payload.message ?? t.loyalty.alertPromo;
    return payload.code ? fmt(t.loyalty.alertPromoCode, { message, code: payload.code }) : message;
  }
  if (kind === "VOUCHER") return fmt(t.loyalty.alertVoucher, { amount: payload.amount ?? "", code: payload.code ?? "" });
  return t.loyalty.alertPromo;
}

function remaining(iso: string, now: number): { days: number; hours: number; minutes: number } | null {
  const diff = new Date(iso).getTime() - now;
  if (diff <= 0) return null;
  const total = Math.floor(diff / 60000);
  return {
    days: Math.floor(total / (60 * 24)),
    hours: Math.floor((total % (60 * 24)) / 60),
    minutes: total % 60,
  };
}

function OfferBanner({ alert, voucher, t }: { alert: Alert; voucher: Voucher; t: Copy }) {
  const { locale } = useI18n();
  const [now, setNow] = useState(() => Date.now());
  const payload = alert.payload;
  const countdown = remaining(voucher.expiresAt, now);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!countdown) return null;

  const headline = payload.percent
    ? fmt(t.loyalty.percentOff, { n: payload.percent })
    : payload.amount
      ? fmt(t.loyalty.amountOff, { amount: payload.amount })
      : alertText(alert.kind, payload, t, locale);

  const subtitle =
    alert.kind === "PERSONALIZED" && payload.service
      ? fmt(t.loyalty.offerOnService, { service: payload.service })
      : alert.kind === "PROMO" && payload.message
        ? payload.message
        : alert.kind === "VOUCHER"
          ? t.loyalty.offerReward
          : t.loyalty.offerAllServices;

  return (
    <article className="relative overflow-hidden rounded-2xl bg-forest text-white">
      <Image
        src={OFFER_PHOTO}
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-[78%_center] rtl:object-[22%_center]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-forest from-28% via-forest/90 via-[58%] to-transparent rtl:bg-gradient-to-l" />

      <div className="relative z-10 flex flex-col items-start gap-5 px-5 py-6 sm:flex-row sm:items-center sm:gap-8 sm:px-7 sm:py-7 lg:gap-10 lg:px-8">
        <div className="min-w-0 text-start">
          <p className="inline-flex rounded-full bg-gold px-3.5 py-1 font-display text-[0.72rem] font-semibold tracking-[0.12em] text-forest uppercase">
            {t.loyalty.offerBadge}
          </p>
          <p className="mt-2.5 font-display text-[2.75rem] leading-none font-semibold tracking-[-0.03em] text-gold sm:text-[3.15rem] lg:text-[3.45rem]">{headline}</p>
          {subtitle ? <p className="mt-2 font-display text-[1.08rem] font-medium text-white">{subtitle}</p> : null}
          {payload.code ? (
            <p className="mt-1.5 font-display text-[0.86rem] text-white/75">
              {t.loyalty.code}: <span dir="ltr">{payload.code}</span>
            </p>
          ) : null}
        </div>

        <span className="hidden h-20 w-px shrink-0 bg-gold/70 sm:block" aria-hidden />

        <div className="shrink-0 text-start">
          <p className="flex items-center gap-1.5 font-display text-[0.88rem] font-medium text-gold">
            <ClockIcon className="h-4 w-4" />
            {t.loyalty.endsIn}
          </p>
          <div className="mt-2.5 flex gap-2" dir="ltr">
            <TimeBox value={countdown.days} label={t.loyalty.days} />
            <TimeBox value={countdown.hours} label={t.loyalty.hours} />
            <TimeBox value={countdown.minutes} label={t.loyalty.minutesShort} />
          </div>
        </div>
      </div>
    </article>
  );
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-[4.7rem] rounded-lg border border-gold/40 bg-black/35 px-2 py-2 text-center">
      <span suppressHydrationWarning className="block font-display text-[1.55rem] leading-none font-semibold tracking-[-0.03em] text-white tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 block font-display text-[0.68rem] whitespace-nowrap text-white/75">{label}</span>
    </div>
  );
}

export function LimitedOffer({
  percent,
  message,
  expiresAt,
}: {
  percent: number | null;
  message: string;
  expiresAt: string;
}) {
  const { t } = useI18n();
  return (
    <OfferBanner
      alert={{
        id: "public-offer",
        kind: "PROMO",
        payload: { message, ...(percent ? { percent: String(percent) } : {}) },
        createdAt: expiresAt,
        read: true,
      }}
      voucher={{
        id: "public-offer",
        code: "",
        kind: "PROMO",
        title: message,
        discountCents: null,
        discountPercent: percent,
        serviceId: null,
        serviceName: null,
        expiresAt,
      }}
      t={t}
    />
  );
}

export default function LoyaltyAlerts({
  alerts,
  vouchers = [],
  limit = PREVIEW,
  variant = "list",
}: {
  alerts: LoyaltyCard["alerts"];
  vouchers?: LoyaltyCard["vouchers"];
  limit?: number;
  variant?: "list" | "banner";
}) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const unread = alerts.some((a) => !a.read);
  const confirmed = variant === "banner" ? alerts.filter((alert) => alert.kind === "CONFIRMED" && !alert.read) : [];
  const source =
    variant === "banner"
      ? alerts.filter((alert) => {
          const code = alert.payload.code;
          if (!code) return false;
          const voucher = vouchers.find((item) => item.code === code);
          return Boolean(voucher && new Date(voucher.expiresAt).getTime() > now);
        })
      : alerts;
  const visible = open ? source : source.slice(0, limit);
  const extra = source.length - limit;

  useEffect(() => {
    if (unread) void markAlertsReadAction();
  }, [unread]);

  useEffect(() => {
    if (variant !== "banner") return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [variant]);

  if (source.length === 0 && confirmed.length === 0) return null;

  if (variant === "list") {
    return (
      <section className="rounded-2xl border border-sand bg-white p-4 sm:p-5">
        <h2 className="text-[1.05rem] font-semibold tracking-[-0.02em] text-ink">{t.loyalty.alertsTitle}</h2>
        <ul className="mt-3 space-y-2">
          {visible.map((alert) => (
            <li
              key={alert.id}
              className={`rounded-2xl border px-4 py-3 text-[0.85rem] ${alert.read ? "border-sand text-sage" : "border-black/20 bg-ivory text-ink"}`}
            >
              {alertText(alert.kind, alert.payload, t, locale)}
            </li>
          ))}
        </ul>
        {limit > 1 && extra > 0 ? (
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="mt-3 inline-flex items-center gap-1 text-[0.82rem] font-medium text-ink"
          >
            {open ? t.loyalty.showLessAlerts : fmt(t.loyalty.showMoreAlerts, { n: extra })}
            <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
          </button>
        ) : null}
      </section>
    );
  }

  return (
    <section aria-label={t.loyalty.alertsTitle} className="space-y-4">
      {confirmed.map((alert) => (
        <p key={alert.id} className="rounded-2xl border border-forest/25 bg-ivory px-4 py-3.5 text-[0.92rem] text-ink">
          {alertText(alert.kind, alert.payload, t, locale)}
        </p>
      ))}
      {visible.map((alert) => {
        const voucher = vouchers.find((item) => item.code === alert.payload.code);
        if (!voucher) return null;
        return <OfferBanner key={alert.id} alert={alert} voucher={voucher} t={t} />;
      })}
      {limit > 1 && extra > 0 ? (
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex items-center gap-1 text-[0.82rem] font-medium text-sage hover:text-forest"
        >
          {open ? t.loyalty.showLessAlerts : fmt(t.loyalty.showMoreAlerts, { n: extra })}
          <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
        </button>
      ) : null}
    </section>
  );
}
