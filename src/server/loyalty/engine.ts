import { addDays } from "date-fns";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { serviceText } from "@/i18n/services";
import {
  BIRTHDAY_PERCENT,
  BIRTHDAY_VALID_DAYS,
  GOLD_BIRTHDAY_PERCENT,
  PERSONALIZED_MIN_VISITS,
  PERSONALIZED_PERCENT,
  PERSONALIZED_VALID_DAYS,
  REDEEM_OPTIONS,
  newVoucherCode,
  pointsForSpend,
  tierFromVisits,
  visitsToNextTier,
  voucherDiscount,
  type LoyaltyTier,
} from "@/lib/loyalty-rules";
import { toLocalDateString } from "@/lib/time";
import { getDb } from "@/server/db";
import { businessRule, invalidInput, notFound } from "@/server/errors";

export type PublicVoucher = {
  id: string;
  code: string;
  kind: "REWARD" | "BIRTHDAY" | "PERSONALIZED" | "PROMO";
  title: string;
  discountCents: number | null;
  discountPercent: number | null;
  serviceId: string | null;
  serviceName: string | null;
  expiresAt: string;
};

export type LoyaltyCard = {
  points: number;
  tier: LoyaltyTier;
  completedVisits: number;
  next: { next: LoyaltyTier | null; remaining: number };
  birthday: string | null;
  vouchers: PublicVoucher[];
  alerts: { id: string; kind: string; payload: Record<string, string>; createdAt: string; read: boolean }[];
};

function monthDay(value: Date): string {
  return toLocalDateString(value).slice(5);
}

async function completedVisitsFor(phone: string): Promise<number> {
  return getDb().booking.count({ where: { customerPhone: phone, status: "COMPLETED" } });
}

async function addAlert(customerId: string, kind: "POINTS" | "TIER" | "BIRTHDAY" | "PERSONALIZED" | "PROMO" | "VOUCHER", payload: Record<string, string>) {
  await getDb().loyaltyAlert.create({ data: { customerId, kind, payload } });
}

export async function getLoyaltyCard(customerId: string, locale: Locale): Promise<LoyaltyCard> {
  const db = getDb();
  const customer = await db.customer.findUnique({ where: { id: customerId } });
  if (!customer) throw notFound("Account not found.");

  await refreshCustomerOffers(customer.id);

  const fresh = await db.customer.findUniqueOrThrow({
    where: { id: customerId },
    include: {
      vouchers: { where: { usedAt: null, expiresAt: { gt: new Date() } }, orderBy: { expiresAt: "asc" } },
      alerts: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  const visits = await completedVisitsFor(fresh.phone);
  const t = getDictionary(locale);
  const serviceIds = [...new Set(fresh.vouchers.map((v) => v.serviceId).filter((id): id is string => Boolean(id)))];
  const services = serviceIds.length
    ? await db.service.findMany({ where: { id: { in: serviceIds } }, select: { id: true, slug: true, name: true, description: true } })
    : [];
  const serviceName = (id: string | null) => {
    if (!id) return null;
    const service = services.find((s) => s.id === id);
    return service ? serviceText(t, service).name : null;
  };

  return {
    points: fresh.points,
    tier: tierFromVisits(visits),
    completedVisits: visits,
    next: visitsToNextTier(visits),
    birthday: fresh.birthday ? toLocalDateString(fresh.birthday) : null,
    vouchers: fresh.vouchers.map((v) => ({
      id: v.id,
      code: v.code,
      kind: v.kind,
      title: v.title,
      discountCents: v.discountCents,
      discountPercent: v.discountPercent,
      serviceId: v.serviceId,
      serviceName: serviceName(v.serviceId),
      expiresAt: v.expiresAt.toISOString(),
    })),
    alerts: fresh.alerts.map((a) => ({
      id: a.id,
      kind: a.kind,
      payload: (a.payload ?? {}) as Record<string, string>,
      createdAt: a.createdAt.toISOString(),
      read: Boolean(a.readAt),
    })),
  };
}

/** Award points once when a visit is marked completed. Safe to call again. */
export async function awardVisitPoints(bookingId: string): Promise<void> {
  const db = getDb();
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, status: true, priceCents: true, customerPhone: true, customerName: true },
  });
  if (!booking || booking.status !== "COMPLETED") return;

  const customer = await db.customer.findUnique({ where: { phone: booking.customerPhone } });
  if (!customer) return;

  const already = await db.loyaltyLedger.findFirst({ where: { bookingId: booking.id, reason: "VISIT" } });
  if (already) return;

  const visitsBefore = await db.booking.count({
    where: { customerPhone: booking.customerPhone, status: "COMPLETED", id: { not: booking.id } },
  });
  const tierBefore = tierFromVisits(visitsBefore);
  const earned = pointsForSpend(booking.priceCents, tierBefore);
  const visitsAfter = visitsBefore + 1;
  const tierAfter = tierFromVisits(visitsAfter);

  await db.$transaction([
    db.loyaltyLedger.create({ data: { customerId: customer.id, bookingId: booking.id, points: earned, reason: "VISIT" } }),
    db.customer.update({ where: { id: customer.id }, data: { points: { increment: earned } } }),
  ]);
  await addAlert(customer.id, "POINTS", { points: String(earned) });
  if (tierAfter !== tierBefore) {
    await addAlert(customer.id, "TIER", { tier: tierAfter });
  }
  await refreshCustomerOffers(customer.id);
}

/** Credit past completed visits when someone creates an account with a booking phone. */
export async function importPastVisits(customerId: string, phone: string): Promise<void> {
  const rows = await getDb().booking.findMany({
    where: { customerPhone: phone, status: "COMPLETED" },
    select: { id: true },
    orderBy: { completedAt: "asc" },
  });
  for (const row of rows) await awardVisitPoints(row.id);
  await refreshCustomerOffers(customerId);
}

export async function refreshCustomerOffers(customerId: string): Promise<void> {
  const db = getDb();
  const customer = await db.customer.findUnique({ where: { id: customerId } });
  if (!customer) return;
  const now = new Date();
  const visits = await completedVisitsFor(customer.phone);
  const tier = tierFromVisits(visits);

  if (customer.birthday) {
    const today = monthDay(now);
    if (monthDay(customer.birthday) === today) {
      const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
      const existing = await db.voucher.findFirst({
        where: { customerId, kind: "BIRTHDAY", createdAt: { gte: yearStart } },
      });
      if (!existing) {
        const percent = tier === "GOLD" ? GOLD_BIRTHDAY_PERCENT : BIRTHDAY_PERCENT;
        const voucher = await db.voucher.create({
          data: {
            customerId,
            kind: "BIRTHDAY",
            code: newVoucherCode(),
            title: `Birthday ${percent}%`,
            discountPercent: percent,
            expiresAt: addDays(now, BIRTHDAY_VALID_DAYS),
          },
        });
        await addAlert(customerId, "BIRTHDAY", { code: voucher.code, percent: String(percent) });
      }
    }
  }

  const favorite = await db.booking.groupBy({
    by: ["serviceId"],
    where: { customerPhone: customer.phone, status: "COMPLETED" },
    _count: { serviceId: true },
    orderBy: { _count: { serviceId: "desc" } },
    take: 1,
  });
  const top = favorite[0];
  if (top && top._count.serviceId >= PERSONALIZED_MIN_VISITS) {
    const open = await db.voucher.findFirst({
      where: { customerId, kind: "PERSONALIZED", usedAt: null, expiresAt: { gt: now } },
    });
    if (!open) {
      const recent = await db.voucher.findFirst({
        where: { customerId, kind: "PERSONALIZED", createdAt: { gte: addDays(now, -PERSONALIZED_VALID_DAYS) } },
      });
      if (!recent) {
        const service = await db.service.findUnique({ where: { id: top.serviceId }, select: { name: true } });
        const voucher = await db.voucher.create({
          data: {
            customerId,
            kind: "PERSONALIZED",
            code: newVoucherCode(),
            title: service?.name ?? "Favorite treatment",
            discountPercent: PERSONALIZED_PERCENT,
            serviceId: top.serviceId,
            expiresAt: addDays(now, PERSONALIZED_VALID_DAYS),
          },
        });
        await addAlert(customerId, "PERSONALIZED", {
          code: voucher.code,
          percent: String(PERSONALIZED_PERCENT),
          service: service?.name ?? "",
        });
      }
    }
  }
}

export async function redeemPoints(customerId: string, points: number): Promise<PublicVoucher> {
  const option = REDEEM_OPTIONS.find((o) => o.points === points);
  if (!option) throw invalidInput("This reward is not available.");

  const db = getDb();
  const customer = await db.customer.findUnique({ where: { id: customerId } });
  if (!customer) throw notFound("Account not found.");
  if (customer.points < option.points) throw businessRule("INVALID_INPUT", "You do not have enough points yet.");

  const voucher = await db.$transaction(async (tx) => {
    const { count } = await tx.customer.updateMany({
      where: { id: customerId, points: { gte: option.points } },
      data: { points: { decrement: option.points } },
    });
    if (count === 0) throw businessRule("INVALID_INPUT", "You do not have enough points yet.");
    await tx.loyaltyLedger.create({ data: { customerId, points: -option.points, reason: "REDEEM" } });
    return tx.voucher.create({
      data: {
        customerId,
        kind: "REWARD",
        code: newVoucherCode(),
        title: `${option.discountCents / 100} MAD`,
        discountCents: option.discountCents,
        expiresAt: addDays(new Date(), 60),
      },
    });
  });
  await addAlert(customerId, "VOUCHER", { code: voucher.code, amount: String(option.discountCents / 100) });
  return {
    id: voucher.id,
    code: voucher.code,
    kind: voucher.kind,
    title: voucher.title,
    discountCents: voucher.discountCents,
    discountPercent: voucher.discountPercent,
    serviceId: voucher.serviceId,
    serviceName: null,
    expiresAt: voucher.expiresAt.toISOString(),
  };
}

export async function saveBirthday(customerId: string, birthday: string | null): Promise<void> {
  if (birthday && !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) throw invalidInput("Please enter a valid date.");
  await getDb().customer.update({
    where: { id: customerId },
    data: { birthday: birthday ? new Date(`${birthday}T00:00:00.000Z`) : null },
  });
  await refreshCustomerOffers(customerId);
}

export async function markLoyaltyAlertsRead(customerId: string): Promise<void> {
  await getDb().loyaltyAlert.updateMany({ where: { customerId, readAt: null }, data: { readAt: new Date() } });
}

export async function usableVouchersForPhone(phone: string, serviceId?: string): Promise<PublicVoucher[]> {
  const customer = await getDb().customer.findUnique({ where: { phone } });
  if (!customer) return [];
  const now = new Date();
  const rows = await getDb().voucher.findMany({
    where: {
      customerId: customer.id,
      usedAt: null,
      expiresAt: { gt: now },
      OR: [{ serviceId: null }, ...(serviceId ? [{ serviceId }] : [])],
    },
    orderBy: { expiresAt: "asc" },
  });
  return rows.map((v) => ({
    id: v.id,
    code: v.code,
    kind: v.kind,
    title: v.title,
    discountCents: v.discountCents,
    discountPercent: v.discountPercent,
    serviceId: v.serviceId,
    serviceName: null,
    expiresAt: v.expiresAt.toISOString(),
  }));
}

export async function claimVoucher(code: string, phone: string, serviceId: string, priceCents: number) {
  const voucher = await getDb().voucher.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (!voucher || voucher.usedAt || voucher.expiresAt <= new Date()) {
    throw businessRule("INVALID_INPUT", "This voucher is not valid.");
  }
  const customer = await getDb().customer.findUnique({ where: { id: voucher.customerId } });
  if (!customer || customer.phone !== phone) {
    throw businessRule("INVALID_INPUT", "This voucher belongs to another account.");
  }
  if (voucher.serviceId && voucher.serviceId !== serviceId) {
    throw businessRule("INVALID_INPUT", "This voucher is for another treatment.");
  }
  const discountCents = voucherDiscount(priceCents, voucher);
  if (discountCents <= 0) throw businessRule("INVALID_INPUT", "This voucher cannot be used on this booking.");
  return { voucher, discountCents, priceCents: priceCents - discountCents };
}

export async function markVoucherUsed(voucherId: string): Promise<void> {
  await getDb().voucher.update({ where: { id: voucherId }, data: { usedAt: new Date() } });
}

export async function sendPromo(input: { message: string; percent?: number; days?: number }): Promise<number> {
  const message = input.message.replace(/\s+/g, " ").trim();
  if (message.length < 4 || message.length > 200) throw invalidInput("Please enter a short promo message.");
  const percent = input.percent && input.percent > 0 ? Math.min(50, Math.round(input.percent)) : undefined;
  const days = Math.min(90, Math.max(3, input.days ?? 14));
  const customers = await getDb().customer.findMany({ select: { id: true } });
  const expiresAt = addDays(new Date(), days);
  for (const customer of customers) {
    let code = "";
    if (percent) {
      const voucher = await getDb().voucher.create({
        data: {
          customerId: customer.id,
          kind: "PROMO",
          code: newVoucherCode(),
          title: message.slice(0, 120),
          discountPercent: percent,
          expiresAt,
        },
      });
      code = voucher.code;
    }
    await addAlert(customer.id, "PROMO", { message, ...(code ? { code } : {}), ...(percent ? { percent: String(percent) } : {}) });
  }
  return customers.length;
}

export async function listLoyaltyMembers() {
  const customers = await getDb().customer.findMany({
    orderBy: { points: "desc" },
    select: { id: true, name: true, phone: true, points: true, birthday: true, createdAt: true },
  });
  const visits =
    customers.length === 0
      ? []
      : await getDb().booking.groupBy({
          by: ["customerPhone"],
          where: { status: "COMPLETED", customerPhone: { in: customers.map((c) => c.phone) } },
          _count: { id: true },
        });
  const visitMap = new Map(visits.map((v) => [v.customerPhone, v._count.id]));
  return customers.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    points: c.points,
    visits: visitMap.get(c.phone) ?? 0,
    tier: tierFromVisits(visitMap.get(c.phone) ?? 0),
    birthday: c.birthday ? toLocalDateString(c.birthday) : null,
  }));
}
