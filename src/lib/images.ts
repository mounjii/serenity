const local = (name: string) => `/images/${name}.jpg`;

export const images = {
  hero: local("hero"),
  about: local("about"),
  swedish: local("swedish"),
  deepTissue: local("deep-tissue"),
  aromatherapy: local("aromatherapy"),
  relaxation: local("relaxation"),
  thaiOil: local("deep-tissue"),
  headNeck: local("relaxation"),
  thai: local("gallery-1"),
  sports: local("deep-tissue"),
  footReflexology: local("gallery-2"),
  herbalCompress: local("gallery-3"),
  testimonial: local("testimonial"),
  avatar: local("avatar"),
  cta: local("cta"),
  gallery: [local("gallery-1"), local("gallery-2"), local("gallery-3"), local("gallery-4")],
};
