const local = (name: string) => `/images/${name}.jpg`;

export const images = {
  hero: local("hero"),
  about: local("about"),
  reservationHero: local("reservation-hero"),
  swedish: local("swedish"),
  deepTissue: local("deep-tissue"),
  aromatherapy: local("aromatherapy"),
  relaxation: local("relaxation"),
  thaiOil: local("thai-oil"),
  headNeck: local("head-neck"),
  thai: local("thai"),
  sports: local("sports"),
  footReflexology: local("foot-reflexology"),
  herbalCompress: local("herbal-compress"),
  testimonial: local("testimonial"),
  avatar: local("avatar"),
  cta: local("cta"),
  gallery: [local("gallery-1"), local("gallery-2"), local("gallery-3"), local("gallery-4")],
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
export function serviceCardImage(slug: string): string {
  return slug in imageBySlug ? `/images/cards/${slug}.jpg` : serviceImage(slug);
}
