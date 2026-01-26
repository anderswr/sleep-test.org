// /lib/types.ts

export const BANK_VERSION = "1.4.0" as const;

export enum CategoryId {
  Pattern = "pattern",
  Insomnia = "insomnia",
  Quality = "quality",
  Daytime = "daytime",
  Hygiene = "hygiene",
  Environment = "environment",
  Breathing = "breathing",
  BloodPressure = "bloodpressure",
  Hormone = "hormone",
  Mental = "mental",
  Chronotype = "chronotype",
}

export const ALL_CATEGORIES: CategoryId[] = [
  CategoryId.Pattern,
  CategoryId.Insomnia,
  CategoryId.Quality,
  CategoryId.Daytime,
  CategoryId.Hygiene,
  CategoryId.Environment,
  CategoryId.Breathing,
  CategoryId.BloodPressure,
  CategoryId.Mental,
  CategoryId.Chronotype,
];

export type LikertValue = 1 | 2 | 3 | 4 | 5;
export type GenderSelection = "female" | "male" | "na";

/** Kun likert-spørsmål fra nå av */
export interface BaseQuestion {
  id: string;
  category: CategoryId;
  textKey: string;   // i18n nøkkel
  infoKey?: string;  // valgfri hjelpetekst
  weight?: number;   // default 1
  femaleOnly?: boolean;
}

export interface LikertQuestion extends BaseQuestion {
  kind: "likert";
}

export type Question = LikertQuestion;

/** Map fra questionId -> likertverdi (1–5) */
export type AnswerMap = Record<string, LikertValue>;

/** Kategori-score: 0–100 (høyere = verre) */
export type CategoryScores = Record<CategoryId, number>;

/** Varsler / signals i resultatet */
export interface Flags {
  osaSignal: boolean;
  excessiveSleepiness: boolean;
  highBpRisk?: boolean; // ny: rolig hint hvis BP-risiko-snitt er høyt
}

export interface HormoneResult {
  status: "high" | "low" | "mid";
  trigger: boolean;
  signals: {
    variability: boolean;
    nightSweats: boolean;
    restlessLegs: boolean;
  };
}

/** Beregnet resultat-objekt som API/klient forventer */
export interface ComputedResult {
  version: string;               // BANK_VERSION
  categoryScores: CategoryScores;
  totalRaw: number;              // 0–100 (høyere = verre)
  sleepScore: number;            // 0–100 (høyere = bedre) = 100 - totalRaw
  flags: Flags;
  suggestedTips: Record<CategoryId, string[]>; // i18n keys per kategori
  gender?: GenderSelection;
  hormone?: HormoneResult | null;
}
