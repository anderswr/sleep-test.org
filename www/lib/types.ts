export const BANK_VERSION = "1.1.0" as const;

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

/**
 * Nye hjelpetyp­er for forenklet mønsterkartlegging
 * (chips i stedet for tidslinjer/slider).
 */
export type SleepHoursBucket =
  | "<6" | "6-7" | "7-8" | "8-9" | "9-10" | ">10" | "unknown";

export type ShiftWork =
  | "none" | "rotating" | "night" | "evening_morning";

/**
 * Felt som lagres sammen med svarene.
 * Vi beholder legacy-feltene (bedtime/waketime/sleepHours)
 * for bakoverkompatibilitet, men bruker primært de nye.
 */
export type FieldMap = {
  // Legacy (kan fortsatt komme fra eldre klienter)
  bedtime?: string;            // "23:15"
  waketime?: string;           // "07:00"
  sleepHours?: number;         // 7.2

  // Nye, enklere felter
  wakeTimeWorkday?: string | null;          // "HH:MM" eller null (varierer)
  sleepHoursBucketWorkday?: SleepHoursBucket;
  weekendWakeShift?: number | null;         // i timer (1.5, 2.5, …) eller null (ikke relevant)
  wakeTimeUsual?: string | null;            // fallback hvis ikke fast/arbeidsdag
  shiftWork?: ShiftWork;
  napFreq?: "never" | "sometimes" | "often";

  // Øvrige
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
