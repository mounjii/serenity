import { CURRENCY } from "./booking-rules";

export function formatPrice(priceCents: number): string {
  const amount = priceCents / 100;
  const text = Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
  return `${text} ${CURRENCY}`;
}

export function formatDuration(minutes: number): string {
  return `${minutes} min`;
}
