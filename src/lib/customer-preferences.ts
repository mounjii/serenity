import type { Goal } from "@/lib/service-details";

export const WELLNESS_GOALS = ["relax", "pain", "neck", "sport", "feet", "flexibility"] as const satisfies readonly Goal[];
export const VISIT_FREQUENCIES = ["first", "sometimes", "monthly", "weekly"] as const;
export const DISCOVERY_SOURCES = ["google", "instagram", "facebook", "friend", "passing"] as const;

export type VisitFrequency = (typeof VISIT_FREQUENCIES)[number];
export type DiscoverySource = (typeof DISCOVERY_SOURCES)[number];

export function isWellnessGoal(value: string): value is Goal {
  return (WELLNESS_GOALS as readonly string[]).includes(value);
}

export function isVisitFrequency(value: string): value is VisitFrequency {
  return (VISIT_FREQUENCIES as readonly string[]).includes(value);
}

export function isDiscoverySource(value: string): value is DiscoverySource {
  return (DISCOVERY_SOURCES as readonly string[]).includes(value);
}
