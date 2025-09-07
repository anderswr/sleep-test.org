// /lib/types.ts

export const BANK_VERSION = "1.2.0" as const;

export enum CategoryId {
  Pattern = "pattern",
  Insomnia = "insomnia",
  Quality = "quality",
  Daytime = "daytime",
  Hygiene = "hygiene",
  Environment = "environment",
  Breathing = "breathing",
  BloodPressure = "bloodpressure",
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
];

export type LikertValue = 1 | 2 | 3 | 4 | 5;

/** Kun likert-spørsmål fra nå av */
export interface BaseQuestion {
  id: string;
  category: CategoryId;
  textKey: string;   // i18n nøkkel
  infoKey?: string;  // valgfri hjelpetekst
  weight?: number;   // default 1
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

/** Beregnet resultat-objekt som API/klient forventer */
export interface ComputedResult {
  version: string;               // BANK_VERSION
  categoryScores: CategoryScores;
  totalRaw: number;              // 0–100 (høyere = verre)
  sleepScore: number;            // 0–100 (høyere = bedre) = 100 - totalRaw
  flags: Flags;
  suggestedTips: Record<CategoryId, string[]>; // i18n keys per kategori
}
