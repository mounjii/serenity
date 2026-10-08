import { PRESSURE_LEVEL, serviceDetails, type Goal, type Pressure } from "./service-details";

export type FinderAnswers = {
  goal: Goal;
  /** 1 light, 3 medium, 5 firm, or null for "no preference". */
  pressure: 1 | 3 | 5 | null;
  minutes: number;
};

export type FinderService = {
  id: string;
  slug: string;
  name: string;
  description: string;
  options: { durationMinutes: number }[];
};

/** Why a treatment was suggested; worded in the visitor's language by the finder. */
export type FinderReason = { kind: "goal"; goal: Goal } | { kind: "pressure"; pressure: Pressure } | { kind: "duration"; minutes: number };

export type FinderMatch = {
  serviceId: string;
  /** The service duration closest to the time the guest has. */
  durationMinutes: number;
  score: number;
  reasons: FinderReason[];
};

export const GOAL_CHOICES: { value: Goal; label: string; hint: string }[] = [
  { value: "relax", label: "Stress & relaxation", hint: "Switch off and unwind" },
  { value: "pain", label: "Muscle pain & knots", hint: "Back, tight or aching muscles" },
  { value: "neck", label: "Neck, shoulders & headaches", hint: "Desk and phone tension" },
  { value: "sport", label: "Recovery after sport", hint: "Sore or overworked muscles" },
  { value: "feet", label: "Tired legs & feet", hint: "Long days standing or walking" },
  { value: "flexibility", label: "Stiffness & flexibility", hint: "Feel lighter and move better" },
];

export const PRESSURE_CHOICES: { value: FinderAnswers["pressure"]; label: string; hint: string }[] = [
  { value: 1, label: "Light", hint: "Soft and soothing" },
  { value: 3, label: "Medium", hint: "Relaxing but present" },
  { value: 5, label: "Firm", hint: "Deep and intense" },
  { value: null, label: "Not sure", hint: "Let the therapist adapt" },
];

export const TIME_CHOICES: { value: number; label: string }[] = [
  { value: 30, label: "30 min" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1 h 30" },
  { value: 120, label: "2 hours" },
];

/** Services ranked best first for the guest's answers. Ties keep the menu order. */
export function rankTreatments(services: FinderService[], answers: FinderAnswers): FinderMatch[] {
  return services
    .filter((s) => s.options.length > 0)
    .map((service, order) => {
      const info = serviceDetails(service.slug, service.description);
      const reasons: FinderReason[] = [];
      let score = 0;

      const goalIndex = info.goals.indexOf(answers.goal);
      if (goalIndex === 0) score += 6;
      else if (goalIndex > 0) score += 4;
      if (goalIndex >= 0) reasons.push({ kind: "goal", goal: answers.goal });

      if (answers.pressure !== null) {
        const gap = Math.abs(PRESSURE_LEVEL[info.pressure] - answers.pressure);
        score -= gap * 1.5;
        if (gap <= 1) reasons.push({ kind: "pressure", pressure: info.pressure });
      }

      const closest = service.options.reduce((best, o) =>
        Math.abs(o.durationMinutes - answers.minutes) < Math.abs(best.durationMinutes - answers.minutes) ? o : best,
      );
      if (closest.durationMinutes === answers.minutes) {
        score += 2;
        reasons.push({ kind: "duration", minutes: closest.durationMinutes });
      } else {
        score -= Math.abs(closest.durationMinutes - answers.minutes) / 60;
      }

      return { serviceId: service.id, durationMinutes: closest.durationMinutes, score: score - order * 0.001, reasons };
    })
    .sort((a, b) => b.score - a.score);
}
