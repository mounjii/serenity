export type ServiceDetails = {
  intro: string;
  highlights: string[];
  pressure: "Light" | "Light to medium" | "Medium" | "Medium to firm" | "Firm";
  idealFor: string;
};

const details: Record<string, ServiceDetails> = {
  "swedish-massage": {
    intro:
      "Our signature full-body massage. Long, flowing strokes and gentle kneading warm the muscles, ease everyday tension and leave you deeply relaxed.",
    highlights: ["Full-body massage with warm oil", "Long, soothing strokes", "Calms the mind and improves circulation"],
    pressure: "Light to medium",
    idealFor: "A first massage or a pure relaxation moment",
  },
  "thai-oil-massage": {
    intro:
      "The best of both worlds: traditional Thai pressure techniques combined with the glide of warm oil, to loosen tight muscles and restore your energy.",
    highlights: ["Thai pressure-point work", "Warm aromatic oil", "Releases deep muscle tension"],
    pressure: "Medium to firm",
    idealFor: "Tired muscles and low energy",
  },
  "aroma-massage": {
    intro:
      "A gentle, enveloping massage with essential oils chosen to calm, balance or uplift. A sensory escape for body and mind.",
    highlights: ["Selected essential oils", "Slow, relaxing rhythm", "Helps relieve stress and improve sleep"],
    pressure: "Light",
    idealFor: "Stress, fatigue and a busy mind",
  },
  "head-neck-shoulder-massage": {
    intro:
      "Focused work where most of us hold our tension. Targeted pressure on the head, neck and shoulders releases stiffness and clears the mind.",
    highlights: ["Scalp, neck and shoulder focus", "Eases stiffness from desk work", "Can help relieve tension headaches"],
    pressure: "Medium",
    idealFor: "Desk workers and stiff shoulders",
  },
  "thai-massage": {
    intro:
      "A traditional, fully clothed massage combining acupressure and assisted yoga-like stretches to improve flexibility and balance the body.",
    highlights: ["Performed in comfortable clothing", "Assisted stretching and acupressure", "Improves flexibility and circulation"],
    pressure: "Medium to firm",
    idealFor: "Flexibility and an energising session",
  },
  "sports-massage": {
    intro:
      "Deep, targeted pressure on the muscles you use the most, to relieve tightness, prevent injury and help your body recover faster.",
    highlights: ["Deep-tissue techniques", "Targets problem areas", "Supports recovery after training"],
    pressure: "Firm",
    idealFor: "Active people and post-workout recovery",
  },
  "foot-reflexology": {
    intro:
      "Precise pressure on the reflex points of the feet, said to correspond to the whole body. Light on the feet, deeply relaxing everywhere else.",
    highlights: ["Warm foot soak to begin", "Reflex-point pressure", "Relieves tired, heavy legs"],
    pressure: "Medium",
    idealFor: "Tired feet and a quick reset",
  },
  "hot-herbal-compress": {
    intro:
      "Warm Thai herbal compresses are pressed along the body, releasing soothing heat and natural aromas to melt away soreness.",
    highlights: ["Steamed Thai herbal compresses", "Soothing heat on sore muscles", "Combined with a relaxing massage"],
    pressure: "Medium",
    idealFor: "Sore muscles and deep relaxation",
  },
};

export function serviceDetails(slug: string, description: string): ServiceDetails {
  return (
    details[slug] ?? {
      intro: description,
      highlights: [],
      pressure: "Medium",
      idealFor: "Relaxation and well-being",
    }
  );
}
