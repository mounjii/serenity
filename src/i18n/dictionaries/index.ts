import type { Locale } from "../config";
import ar from "./ar";
import en, { type Dictionary } from "./en";
import fr from "./fr";

const dictionaries: Record<Locale, Dictionary> = { en, fr, ar };

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale];

export type { Dictionary };
