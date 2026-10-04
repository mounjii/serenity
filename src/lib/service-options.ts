export type ServiceOptionValue = { durationMinutes: number; priceCents: number };

/** The requested duration, or the shortest one when none is given. Null when that duration is not offered. */
export function pickOption<T extends ServiceOptionValue>(options: T[], durationMinutes?: number | null): T | null {
  const sorted = [...options].sort((a, b) => a.durationMinutes - b.durationMinutes);
  if (durationMinutes == null) return sorted[0] ?? null;
  return sorted.find((o) => o.durationMinutes === durationMinutes) ?? null;
}

export function lowestPrice(options: ServiceOptionValue[]): number {
  return Math.min(...options.map((o) => o.priceCents));
}
