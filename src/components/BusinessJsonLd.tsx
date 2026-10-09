import { headers } from "next/headers";
import { connection } from "next/server";
import { localizePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { serviceText } from "@/i18n/services";
import { NONCE_HEADER } from "@/lib/csp";
import { normalizePhone } from "@/lib/phone";
import { BUSINESS_ADDRESS, OG_IMAGE, OPENING_HOURS, SITE_NAME, SITE_URL, SOCIAL_LINKS } from "@/lib/site";
import { getActiveServices, type PublicService } from "@/server/booking/services";

const absolute = (path: string) => new URL(path, SITE_URL).toString();

async function loadServices(): Promise<PublicService[]> {
  try {
    return await getActiveServices();
  } catch {
    return [];
  }
}

/** schema.org description of the salon, read by Google for the business panel and local results. */
export default async function BusinessJsonLd() {
  await connection();
  const { t, locale } = await getI18n();
  const nonce = (await headers()).get(NONCE_HEADER) ?? undefined;
  const phone = normalizePhone(process.env.CONTACT_PHONE || process.env.OWNER_WHATSAPP_PHONE || "");
  const services = await loadServices();
  const prices = services.flatMap((s) => s.options.map((o) => o.priceCents / 100));
  const mapQuery = encodeURIComponent(`${SITE_NAME}, ${BUSINESS_ADDRESS.streetAddress}, ${BUSINESS_ADDRESS.addressLocality}`);

  const data = {
    "@context": "https://schema.org",
    "@type": "DaySpa",
    "@id": `${SITE_URL}/#business`,
    name: SITE_NAME,
    description: t.meta.description,
    url: absolute(localizePath(locale, "/")),
    image: absolute(OG_IMAGE.url),
    logo: absolute("/images/ts-logo-stacked.png"),
    ...(phone ? { telephone: phone } : {}),
    address: { "@type": "PostalAddress", ...BUSINESS_ADDRESS },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${mapQuery}`,
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: OPENING_HOURS.opens,
      closes: OPENING_HOURS.closes,
    },
    currenciesAccepted: "MAD",
    ...(prices.length > 0 ? { priceRange: `${Math.min(...prices)}–${Math.max(...prices)} MAD` } : {}),
    availableLanguage: ["English", "French", "Arabic"],
    sameAs: Object.values(SOCIAL_LINKS),
    potentialAction: {
      "@type": "ReserveAction",
      target: absolute(localizePath(locale, "/reservation")),
    },
    ...(services.length > 0
      ? {
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: t.treatments.eyebrow,
            itemListElement: services.map((s) => {
              const { name, description } = serviceText(t, s);
              return {
                "@type": "OfferCatalog",
                name,
                itemListElement: s.options.map((o) => ({
                  "@type": "Offer",
                  price: (o.priceCents / 100).toFixed(2),
                  priceCurrency: "MAD",
                  itemOffered: { "@type": "Service", name: `${name} (${o.durationMinutes} min)`, description },
                })),
              };
            }),
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
