import { connection } from "next/server";
import TreatmentCarousel from "@/components/TreatmentCarousel";
import { getI18n } from "@/i18n/server";
import { serviceText } from "@/i18n/services";
import { serviceImage } from "@/lib/images";
import { RESERVATION_PATH } from "@/lib/navigation";
import { getActiveServices, type PublicService } from "@/server/booking/services";

const fallback = (slug: string, name: string, description: string): PublicService => ({
  id: slug,
  slug,
  name,
  description,
  options: [],
});

const fallbackServices: PublicService[] = [
  fallback("thai-massage", "Thai Massage", "Traditional Thai technique that restores energy and flexibility."),
  fallback("thai-oil-massage", "Thai Oil Massage", "A relaxing massage with natural oil to release tension and calm the mind."),
  fallback("swedish-massage", "Swedish Massage", "A gentle, full-body massage that relieves stress and improves circulation."),
  fallback("aroma-massage", "Aroma Massage", "A soothing massage with essential oils for deep relaxation."),
  fallback("head-neck-shoulder-massage", "Head, Neck & Shoulder", "Focused work to release stress, stiffness and headaches."),
  fallback("sports-massage", "Sports Massage", "Deep, targeted pressure to ease muscle tension and support recovery."),
  fallback("foot-reflexology", "Foot Reflexology", "Pressure on reflex points of the feet to relax the whole body."),
  fallback("hot-herbal-compress", "Hot Herbal Compress", "Warm Thai herbal compresses to soothe sore muscles."),
];

async function loadServices(): Promise<PublicService[]> {
  await connection();
  try {
    const services = await getActiveServices();
    return services.length > 0 ? services : fallbackServices;
  } catch (error) {
    console.error("[treatments] could not load services, using fallback list", error);
    return fallbackServices;
  }
}

export default async function Treatments() {
  const [treatments, { t, href }] = await Promise.all([loadServices(), getI18n()]);
  const cards = treatments.map((service) => {
    const { name, description } = serviceText(t, service);
    return {
      slug: service.slug,
      name,
      description,
      image: serviceImage(service.slug),
      href: href(`${RESERVATION_PATH}?service=${service.slug}`),
    };
  });

  return (
    <section id="services" className="bg-ivory">
      <div className="w-full px-5 py-16 font-display sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <TreatmentCarousel
          items={cards}
          detailsAria={t.treatments.detailsAria}
          eyebrow={t.treatments.eyebrow}
          title={t.treatments.title}
          swipeLabel={t.treatments.swipe}
          viewAll={t.treatments.viewAll}
          viewAllHref={href(RESERVATION_PATH)}
          prevLabel={t.treatments.prev}
          nextLabel={t.treatments.next}
        />
      </div>
    </section>
  );
}
