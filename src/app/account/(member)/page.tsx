import Image from "next/image";
import Link from "next/link";
import LoyaltyAlerts from "@/components/account/LoyaltyAlerts";
import { CalendarIcon, ChevronRight, ClockIcon, PhoneIcon } from "@/components/Icons";
import { fmt } from "@/i18n/format";
import { getI18n } from "@/i18n/server";
import { formatDuration, formatPrice } from "@/lib/format";
import { blurProps, images, serviceImage } from "@/lib/images";
import { GOLD_VISITS, SILVER_VISITS } from "@/lib/loyalty-rules";
import { RESERVATION_PATH } from "@/lib/navigation";
import { formatPhone } from "@/lib/phone";
import { getCustomerBookings, type CustomerBooking } from "@/server/customer/bookings";
import { getCustomerProfile, preferredMassageName } from "@/server/customer/preferences";
import { getLoyaltyCard } from "@/server/loyalty/engine";
import { requireCustomerPage } from "@/server/customer/session";

export default async function AccountPage() {
  const session = await requireCustomerPage();
  const { t, locale, href } = await getI18n();
  const [bookings, card, profile] = await Promise.all([
    getCustomerBookings(session.phone, locale),
    getLoyaltyCard(session.id, locale),
    getCustomerProfile(session.id),
  ]);
  const savedMassage = await preferredMassageName(profile?.preferredMassage ?? null, locale);
  const firstName = session.name.split(" ")[0] ?? session.name;
  const next = [...bookings].reverse().find((booking) => booking.upcoming) ?? null;
  const latest = bookings.find((booking) => !booking.upcoming) ?? null;
  const shown = next ?? latest;
  const goal = card.tier === "BRONZE" ? SILVER_VISITS : GOLD_VISITS;
  const progress = card.tier === "GOLD" ? 1 : Math.min(1, card.completedVisits / goal);
  const tierName = t.loyalty.tiers[card.tier];
  const massages = savedMassage ? [savedMassage] : [...new Set(bookings.map((booking) => booking.serviceName))];

  return (
    <div className="space-y-5">
      <LoyaltyAlerts alerts={card.alerts} vouchers={card.vouchers} limit={1} variant="banner" />

      <section className="overflow-hidden rounded-2xl border border-sand bg-white">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(16rem,38%)]">
          <div className="p-5 sm:p-7">
            <p className="text-[0.72rem] font-medium tracking-[0.18em] text-sage uppercase">{fmt(t.account.member, { tier: tierName })}</p>
            <h1 className="mt-2 text-[1.85rem] leading-tight font-semibold tracking-[-0.03em] text-forest sm:text-[2.15rem]">
              {fmt(t.account.hello, { name: firstName })}
            </h1>
            <p className="mt-2 max-w-md text-[0.92rem] leading-relaxed text-sage">{t.account.welcome}</p>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Link
                href={href(RESERVATION_PATH)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-forest px-5 text-[0.9rem] font-medium text-white transition hover:bg-forest-dark"
              >
                <CalendarIcon className="h-4 w-4" />
                {t.account.bookCta}
              </Link>
              <Link
                href={href("/#services")}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-sand bg-white px-5 text-[0.9rem] font-medium text-ink transition hover:border-forest/30"
              >
                {t.account.explore}
              </Link>
            </div>
          </div>
          <div className="relative min-h-52">
            <Image
              src={images.hero}
              {...blurProps(images.hero)}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 34vw, 100vw"
              className="object-cover object-[72%_center]"
            />
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white via-white/70 to-transparent lg:hidden" />
            <div className="absolute inset-y-0 start-0 hidden w-1/2 bg-gradient-to-r from-white via-white/55 to-transparent rtl:bg-gradient-to-l lg:block" />
          </div>
        </div>
      </section>

      <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(16rem,0.75fr)]">
        <section className="rounded-2xl border border-sand bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[1.05rem] font-semibold tracking-[-0.02em] text-ink">{next ? t.account.nextVisit : t.account.bookingsTitle}</h2>
            <Link href={href("/account/bookings")} className="text-[0.78rem] font-medium text-sage underline-offset-4 hover:text-ink hover:underline">
              {t.account.navBookings}
            </Link>
          </div>
          {shown ? (
            <VisitPreview
              booking={shown}
              label={next ? t.account.upcoming : t.account.past}
              href={href(`/reservation/confirmation/${shown.id}`)}
              durationLabel={formatDuration(shown.durationMinutes, locale)}
              priceLabel={formatPrice(shown.priceCents, locale)}
              statusLabel={t.account.status[shown.status]}
            />
          ) : (
            <div className="px-2 py-10 text-center">
              <p className="text-[0.85rem] text-sage">{t.account.noBookings}</p>
              <Link
                href={href(RESERVATION_PATH)}
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-forest px-5 text-[0.84rem] font-medium text-white transition hover:bg-forest-dark"
              >
                {t.account.bookCta}
              </Link>
            </div>
          )}
          {next && latest && (
            <p className="mt-3 text-[0.78rem] text-sage">
              {t.account.past}: {latest.serviceName}
            </p>
          )}
          {!next && bookings.length > 0 && <p className="mt-3 text-[0.78rem] text-sage">{t.account.noUpcoming}</p>}
        </section>

        <Link href={href("/account/loyalty")} className="flex flex-col rounded-2xl bg-forest p-5 text-white transition hover:bg-forest-dark sm:p-6">
          <p className="text-[0.68rem] font-medium tracking-[0.22em] text-white/55 uppercase">{t.loyalty.cardEyebrow}</p>
          <h2 className="mt-4 text-[1.55rem] leading-none font-semibold tracking-[-0.03em]">{fmt(t.account.member, { tier: tierName })}</h2>
          <p className="mt-3 text-[1.7rem] font-semibold tracking-[-0.03em]">{fmt(t.account.pointsShort, { n: card.points })}</p>
          <p className="mt-3 text-[0.84rem] leading-snug text-white/70">{t.loyalty.perks[card.tier]}</p>
          <div className="mt-auto pt-6">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-white" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
            <p className="mt-2 flex items-center justify-between gap-3 text-[0.75rem] text-white/65">
              <span>
                {card.next.next
                  ? fmt(t.loyalty.nextTier, { n: card.next.remaining, tier: t.loyalty.tiers[card.next.next] })
                  : fmt(t.account.visitsCount, { n: card.completedVisits })}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 rtl:-scale-x-100" />
            </p>
          </div>
        </Link>
      </div>

      <Link href={href("/account/info")} className="block rounded-2xl border border-sand bg-white p-4 transition hover:border-forest/30 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-forest text-[1rem] font-semibold text-white uppercase">
              {profile?.avatarType ? (
                <img src={`/account/avatar?v=${profile.updatedAt.getTime()}`} alt="" className="h-full w-full object-cover" />
              ) : (
                firstName.slice(0, 1)
              )}
            </span>
            <div className="min-w-0">
            <h2 className="text-[1.05rem] font-semibold tracking-[-0.02em] text-ink">{session.name}</h2>
            <p className="mt-1 flex items-center gap-2 text-[0.84rem] text-sage">
              <PhoneIcon className="h-4 w-4" />
              {formatPhone(session.phone)}
            </p>
            {massages.length > 0 && (
              <p className="mt-3 text-[0.8rem] text-sage">
                {t.account.preferredMassages}: {massages.slice(0, 3).join(", ")}
              </p>
            )}
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 text-[0.78rem] font-medium text-sage">
            {t.account.navProfile}
            <ChevronRight className="h-4 w-4 rtl:-scale-x-100" />
          </span>
        </div>
      </Link>
    </div>
  );
}

function VisitPreview({
  booking,
  label,
  href: to,
  durationLabel,
  priceLabel,
  statusLabel,
}: {
  booking: CustomerBooking;
  label: string;
  href: string;
  durationLabel: string;
  priceLabel: string;
  statusLabel: string;
}) {
  return (
    <Link href={to} className="mt-4 flex items-center gap-4 rounded-2xl border border-sand p-3 transition hover:border-black/25">
      <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-ivory">
        <Image src={serviceImage(booking.serviceSlug)} alt="" fill sizes="80px" className="object-cover" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-[0.68rem] font-medium tracking-[0.14em] text-sage uppercase">{label}</span>
        <span className="mt-1 block truncate text-[1.02rem] font-medium text-ink">{booking.serviceName}</span>
        <span className="mt-0.5 block truncate text-[0.82rem] text-sage">
          {booking.date}, {booking.time}
        </span>
        <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.75rem] text-sage">
          <span className="inline-flex items-center gap-1">
            <ClockIcon className="h-3.5 w-3.5" />
            {durationLabel}
          </span>
          <span>{priceLabel}</span>
          <span>{statusLabel}</span>
        </span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-sage rtl:-scale-x-100" />
    </Link>
  );
}
