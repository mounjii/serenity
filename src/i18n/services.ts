import { serviceDetails, type ServiceDetails } from "@/lib/service-details";
import type { Dictionary } from "./dictionaries/en";

type ServiceLike = { slug: string; name: string; description: string };

/** Translated name and short description; the database text (English) when there is no translation. */
export function serviceText(t: Dictionary, service: ServiceLike): { name: string; description: string } {
  return t.serviceNames[service.slug] ?? { name: service.name, description: service.description };
}

/** Treatment details in the visitor's language, keeping the language-independent fields (goals, pressure). */
export function localizedServiceDetails(t: Dictionary, service: ServiceLike): ServiceDetails {
  const base = serviceDetails(service.slug, service.description);
  const text = t.serviceDetails[service.slug];
  return text ? { ...base, ...text } : base;
}
