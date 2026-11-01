export const LOYALTY_TIERS = ["BRONZE", "SILVER", "GOLD"] as const;
export type LoyaltyTier = (typeof LOYALTY_TIERS)[number];

/** Completed visits needed to reach each tier. */
export const SILVER_VISITS = 3;
export const GOLD_VISITS = 7;

/** Extra points on top of the base earn rate. */
export const TIER_BONUS: Record<LoyaltyTier, number> = { BRONZE: 0, SILVER: 0.1, GOLD: 0.2 };

/** 1 point per 10 MAD spent (priceCents / 1000). */
export const CENTS_PER_POINT = 1000;

export const REDEEM_OPTIONS = [
  { points: 50, discountCents: 5000 },
  { points: 100, discountCents: 10000 },
  { points: 200, discountCents: 25000 },
] as const;

export const BIRTHDAY_PERCENT = 15;
export const GOLD_BIRTHDAY_PERCENT = 20;
export const BIRTHDAY_VALID_DAYS = 14;

export const PERSONALIZED_PERCENT = 10;
export const PERSONALIZED_MIN_VISITS = 2;
export const PERSONALIZED_VALID_DAYS = 30;

export function tierFromVisits(completedVisits: number): LoyaltyTier {
  if (completedVisits >= GOLD_VISITS) return "GOLD";
  if (completedVisits >= SILVER_VISITS) return "SILVER";
  return "BRONZE";
}

export function visitsToNextTier(completedVisits: number): { next: LoyaltyTier | null; remaining: number } {
  if (completedVisits >= GOLD_VISITS) return { next: null, remaining: 0 };
  if (completedVisits >= SILVER_VISITS) return { next: "GOLD", remaining: GOLD_VISITS - completedVisits };
  return { next: "SILVER", remaining: SILVER_VISITS - completedVisits };
}

export function pointsForSpend(priceCents: number, tier: LoyaltyTier): number {
  const base = Math.max(1, Math.floor(priceCents / CENTS_PER_POINT));
  return Math.max(1, Math.round(base * (1 + TIER_BONUS[tier])));
}

export function voucherDiscount(priceCents: number, voucher: { discountCents?: number | null; discountPercent?: number | null }): number {
  if (voucher.discountPercent && voucher.discountPercent > 0) {
    return Math.min(priceCents, Math.round((priceCents * voucher.discountPercent) / 100));
  }
  if (voucher.discountCents && voucher.discountCents > 0) {
    return Math.min(priceCents, voucher.discountCents);
  }
  return 0;
}

export function newVoucherCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return `TS${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("")}`;
}
