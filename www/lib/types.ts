export const BANK_VERSION = "1.0.0" as const;

export enum CategoryId {
  Pattern = "pattern",
  Insomnia = "insomnia",
  Quality = "quality",
  Daytime = "daytime",
  Hygiene = "hygiene",
  Environment = "environment",
  Breathing = "breathing",
}

export const ALL_CATEGORIES: CategoryId[] = [
  CategoryId.Pattern,
  CategoryId.Insomnia,
  CategoryId.Quality,
  CategoryId.Daytime,
  CategoryId.Hygiene,
  CategoryId.Environment,
  CategoryId.Breathing,
];

export type LikertValue = 1 | 2 | 3 | 4 | 5;
export type QuestionKind = "likert" | "field";
export type FieldSubtype = "time" | "number" | "select";

export interface BaseQuestion {
  id: string;
  category: CategoryId;
  textKey: string;      // i18n nøkkel
  infoKey?: string;     // valgfri hjelpetekst
  weight?: number;      // default 1
}

export interface LikertQuestion extends BaseQuestion { kind: "likert" }

export interface FieldQuestion extends BaseQuestion {
  kind: "field";
  field: { subtype: FieldSubtype; key: string; optionsKey?: string };
}

export type Question = LikertQuestion | FieldQuestion;

export type AnswerMap = Record<string, LikertValue>;

export type FieldMap = {
  bedtime?: string;            // "23:15"
  waketime?: string;           // "07:00"
  sleepHours?: number;         // 7.2
  hypertensionDx?: "yes" | "no" | "unknown";
};

export type CategoryScores = Record<CategoryId, number>; // 0–100 (høyere = verre)

export interface Flags {
  osaSignal: boolean;
  excessiveSleepiness: boolean;
}

export interface ComputedResult {
  version: string;               // BANK_VERSION
  categoryScores: CategoryScores;
  totalRaw: number;              // 0–100 (høyere = verre)
  sleepScore: number;            // 0–100 (høyere = bedre) = 100 - totalRaw
  flags: Flags;
  suggestedTips: Record<CategoryId, string[]>; // i18n keys for tips per kategori
}
