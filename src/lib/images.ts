import { BLUR_DATA } from "./image-blur";

const local = (name: string) => `/images/${name}.webp`;

/** next/image props that show a blurred preview of the photo until it has loaded. */
export function blurProps(src: string) {
  const blurDataURL = BLUR_DATA[src];
  return blurDataURL ? ({ placeholder: "blur", blurDataURL } as const) : {};
}

export const images = {
  hero: local("hero"),
  about: local("about"),
  reservationHero: local("reservation-hero"),
  swedish: local("treatments/swedish"),
  deepTissue: local("deep-tissue"),
  aromatherapy: local("treatments/aroma"),
  relaxation: local("relaxation"),
  thaiOil: local("treatments/thai-oil-massage"),
  headNeck: local("treatments/head-neck-shoulder"),
  thai: local("treatments/thai-massage"),
  sports: local("treatments/sports-massage"),
  footReflexology: local("treatments/foot-reflexology"),
  herbalCompress: local("treatments/herbal-compress"),
  testimonial: local("testimonial"),
  avatar: local("avatar"),
  cta: local("cta"),
  /** Real photos of the salon. */
  gallery: Array.from({ length: 8 }, (_, i) => local(`space/space-${i + 1}`)),
};

const imageBySlug: Record<string, string> = {
  "swedish-massage": images.swedish,
  "thai-oil-massage": images.thaiOil,
  "aroma-massage": images.aromatherapy,
  "head-neck-shoulder-massage": images.headNeck,
  "thai-massage": images.thai,
  "sports-massage": images.sports,
  "foot-reflexology": images.footReflexology,
  "hot-herbal-compress": images.herbalCompress,
};

export function serviceImage(slug: string): string {
  return imageBySlug[slug] ?? images.gallery[0];
}

/** Wide 16:9 photos with the subject in the left third, for the booking cards that reveal the full image on hover. */
const cardFileBySlug: Record<string, string> = {
  "head-neck-shoulder-massage": "head-neck",
  "thai-oil-massage": "thai-oil",
  "thai-massage": "thai",
  "sports-massage": "sports",
};

export function serviceCardImage(slug: string): string {
  return slug in imageBySlug ? local(`treatments/wide/${cardFileBySlug[slug] ?? slug}`) : serviceImage(slug);
}
