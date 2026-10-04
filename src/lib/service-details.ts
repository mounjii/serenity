export type ServiceDetails = {
  /** Three short benefits shown with icons at the top of the treatment view. */
  benefits: [string, string, string];
  intro: string;
  highlights: string[];
  pressure: "Light" | "Light to medium" | "Medium" | "Medium to firm" | "Firm";
  idealFor: string;
  /** Why someone would pick this treatment, in one sentence. */
  why: string;
  /** Everyday complaints this treatment helps with. */
  helpsWith: string[];
};

const details: Record<string, ServiceDetails> = {
  "swedish-massage": {
    benefits: ["Relieves Tension", "Improves Circulation", "Promotes Relaxation"],
    intro:
      "Our signature full-body massage. Long, flowing strokes and gentle kneading warm the muscles, ease everyday tension and leave you deeply relaxed.",
    highlights: ["Full-body massage with warm oil", "Long, soothing strokes", "Calms the mind and improves circulation"],
    pressure: "Light to medium",
    idealFor: "A first massage or a pure relaxation moment",
    why: "Choose it when you simply want to switch off: it slows your breathing, lowers stress and lets the whole body unwind.",
    helpsWith: ["Stress & anxiety", "General muscle tension", "Poor sleep", "Fatigue", "Poor circulation"],
  },
  "thai-oil-massage": {
    benefits: ["Releases Muscle Knots", "Restores Energy", "Eases Stiffness"],
    intro:
      "The best of both worlds: traditional Thai pressure techniques combined with the glide of warm oil, to loosen tight muscles and restore your energy.",
    highlights: ["Thai pressure-point work", "Warm aromatic oil", "Releases deep muscle tension"],
    pressure: "Medium to firm",
    idealFor: "Tired muscles and low energy",
    why: "Choose it when your body feels heavy and tight: firmer pressure releases knots while the oil keeps it smooth and comfortable.",
    helpsWith: ["Muscle knots", "Back pain", "Stiffness", "Low energy", "Physical fatigue"],
  },
  "aroma-massage": {
    benefits: ["Reduces Stress", "Improves Sleep", "Calms the Mind"],
    intro:
      "A gentle, enveloping massage with essential oils chosen to calm, balance or uplift. A sensory escape for body and mind.",
    highlights: ["Selected essential oils", "Slow, relaxing rhythm", "Helps relieve stress and improve sleep"],
    pressure: "Light",
    idealFor: "Stress, fatigue and a busy mind",
    why: "Choose it when your mind needs a rest as much as your body: the scents and slow rhythm calm the nervous system.",
    helpsWith: ["Stress & anxiety", "Insomnia", "Mental fatigue", "Low mood", "Headaches"],
  },
  "head-neck-shoulder-massage": {
    benefits: ["Eases Neck Pain", "Relieves Headaches", "Clears the Mind"],
    intro:
      "Focused work where most of us hold our tension. Targeted pressure on the head, neck and shoulders releases stiffness and clears the mind.",
    highlights: ["Scalp, neck and shoulder focus", "Eases stiffness from desk work", "Can help relieve tension headaches"],
    pressure: "Medium",
    idealFor: "Desk workers and stiff shoulders",
    why: "Choose it when hours at a desk or on your phone leave your neck stiff and your head heavy.",
    helpsWith: ["Neck pain", "Tight shoulders", "Tension headaches", "Eye strain", "Poor posture"],
  },
  "thai-massage": {
    benefits: ["Improves Flexibility", "Boosts Energy", "Balances the Body"],
    intro:
      "A traditional, fully clothed massage combining acupressure and assisted yoga-like stretches to improve flexibility and balance the body.",
    highlights: ["Performed in comfortable clothing", "Assisted stretching and acupressure", "Improves flexibility and circulation"],
    pressure: "Medium to firm",
    idealFor: "Flexibility and an energising session",
    why: "Choose it when you feel stiff and want to leave lighter and more mobile, without oil.",
    helpsWith: ["Stiff joints", "Limited flexibility", "Lower back tension", "Low energy", "Poor posture"],
  },
  "sports-massage": {
    benefits: ["Relieves Soreness", "Speeds Up Recovery", "Improves Mobility"],
    intro:
      "Deep, targeted pressure on the muscles you use the most, to relieve tightness, prevent injury and help your body recover faster.",
    highlights: ["Deep-tissue techniques", "Targets problem areas", "Supports recovery after training"],
    pressure: "Firm",
    idealFor: "Active people and post-workout recovery",
    why: "Choose it when you train regularly or have a specific area that stays tight and sore.",
    helpsWith: ["Sore muscles", "Muscle tightness", "Post-workout recovery", "Reduced mobility", "Chronic back pain"],
  },
  "foot-reflexology": {
    benefits: ["Relieves Tired Feet", "Improves Circulation", "Deep Relaxation"],
    intro:
      "Precise pressure on the reflex points of the feet, said to correspond to the whole body. Light on the feet, deeply relaxing everywhere else.",
    highlights: ["Warm foot soak to begin", "Reflex-point pressure", "Relieves tired, heavy legs"],
    pressure: "Medium",
    idealFor: "Tired feet and a quick reset",
    why: "Choose it after long days on your feet, or when you want deep relaxation in a short time.",
    helpsWith: ["Tired, aching feet", "Heavy legs", "Stress", "Poor sleep", "Poor circulation"],
  },
  "hot-herbal-compress": {
    benefits: ["Soothes Muscle Aches", "Warms the Body", "Deep Relaxation"],
    intro:
      "Warm Thai herbal compresses are pressed along the body, releasing soothing heat and natural aromas to melt away soreness.",
    highlights: ["Steamed Thai herbal compresses", "Soothing heat on sore muscles", "Combined with a relaxing massage"],
    pressure: "Medium",
    idealFor: "Sore muscles and deep relaxation",
    why: "Choose it when your muscles ache and you want gentle heat to do the work, rather than strong pressure.",
    helpsWith: ["Muscle aches", "Joint stiffness", "Back pain", "Stress", "Cold, tired body"],
  },
};

export function serviceDetails(slug: string, description: string): ServiceDetails {
  return (
    details[slug] ?? {
      benefits: ["Relieves Tension", "Restores Energy", "Promotes Relaxation"],
      intro: description,
      highlights: [],
      pressure: "Medium",
      idealFor: "Relaxation and well-being",
      why: "",
      helpsWith: [],
    }
  );
}
