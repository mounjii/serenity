const local = (name: string) => `/images/${name}.jpg`;

export const images = {
  hero: local("hero"),
  about: local("about"),
  swedish: local("swedish"),
  deepTissue: local("deep-tissue"),
  aromatherapy: local("aromatherapy"),
  relaxation: local("relaxation"),
  testimonial: local("testimonial"),
  avatar: local("avatar"),
  cta: local("cta"),
  gallery: [local("gallery-1"), local("gallery-2"), local("gallery-3"), local("gallery-4")],
};
