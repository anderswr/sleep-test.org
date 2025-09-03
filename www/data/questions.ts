// /data/questions.ts
import { CategoryId, Question } from "@/lib/types";

/**
 * Viktig:
 * - w1–w6 er de nye, enklere feltspørsmålene (chips) vi bruker i stedet for komplisert tidslinje.
 * - Likert-spørsmålene (q1–q25) er uendret.
 * - f4 (hypertension) ligger SIST, og autosubmitter fra test-siden.
 */

export const QUESTION_BANK: Question[] = [
  // --- Nye "wake/sleep" felt (enkle chips) ---
  { id: "w1", kind: "field", category: CategoryId.Pattern, textKey: "f.wake_work.title",   field: { subtype: "select", key: "wakeTimeWorkday" } },
  { id: "w2", kind: "field", category: CategoryId.Pattern, textKey: "f.sleep_bucket.title", field: { subtype: "select", key: "sleepHoursBucketWorkday" } },
  { id: "w3", kind: "field", category: CategoryId.Pattern, textKey: "f.weekend_shift.title", field: { subtype: "select", key: "weekendWakeShift" } },
  { id: "w4", kind: "field", category: CategoryId.Pattern, textKey: "f.wake_usual.title",   field: { subtype: "select", key: "wakeTimeUsual" } },
  { id: "w5", kind: "field", category: CategoryId.Pattern, textKey: "f.shift_work.title",   field: { subtype: "select", key: "shiftWork" } },
  { id: "w6", kind: "field", category: CategoryId.Pattern, textKey: "f.nap_freq.title",     field: { subtype: "select", key: "napFreq" } },

  // --- Likert (som før) ---
  // 1) Søvnmønster & varighet (Pattern)
  { id: "q1", kind: "likert", category: CategoryId.Pattern,   textKey: "q.pattern.too_short" },
  { id: "q2", kind: "likert", category: CategoryId.Pattern,   textKey: "q.pattern.irregular_times" },
  { id: "q3", kind: "likert", category: CategoryId.Pattern,   textKey: "q.pattern.late_long_naps" },

  // 2) Innsovning & natt (Insomnia)
  { id: "q4", kind: "likert", category: CategoryId.Insomnia,  textKey: "q.insomnia.long_sleep_onset" },
  { id: "q5", kind: "likert", category: CategoryId.Insomnia,  textKey: "q.insomnia.frequent_awakenings" },
  { id: "q6", kind: "likert", category: CategoryId.Insomnia,  textKey: "q.insomnia.early_morning_awakenings" },
  { id: "q7", kind: "likert", category: CategoryId.Insomnia,  textKey: "q.insomnia.unrefreshed_mornings" },
  { id: "q8", kind: "likert", category: CategoryId.Insomnia,  textKey: "q.insomnia.daytime_impact" },

  // 3) Søvnkvalitet & fornøydhet (Quality)
  { id: "q9",  kind: "likert", category: CategoryId.Quality,  textKey: "q.quality.overall_poor" },
  { id: "q10", kind: "likert", category: CategoryId.Quality,  textKey: "q.quality.dissatisfied" },
  { id: "q11", kind: "likert", category: CategoryId.Quality,  textKey: "q.quality.restless_nights" },

  // 4) Dagtid & søvnighet (Daytime)
  { id: "q12", kind: "likert", category: CategoryId.Daytime,  textKey: "q.daytime.doze_easily" },
  { id: "q13", kind: "likert", category: CategoryId.Daytime,  textKey: "q.daytime.struggle_stay_awake" },
  { id: "q14", kind: "likert", category: CategoryId.Daytime,  textKey: "q.daytime.tired_most_day" },

  // 5) Søvnhygiene & rutiner (Hygiene)
  { id: "q15", kind: "likert", category: CategoryId.Hygiene,  textKey: "q.hygiene.screens_before_bed" },
  { id: "q16", kind: "likert", category: CategoryId.Hygiene,  textKey: "q.hygiene.late_caffeine" },
  { id: "q17", kind: "likert", category: CategoryId.Hygiene,  textKey: "q.hygiene.alcohol_near_bed" },
  { id: "q18", kind: "likert", category: CategoryId.Hygiene,  textKey: "q.hygiene.big_meal_late" },
  { id: "q19", kind: "likert", category: CategoryId.Hygiene,  textKey: "q.hygiene.hard_exercise_late" },

  // 6) Søvnmiljø (Environment)
  { id: "q20", kind: "likert", category: CategoryId.Environment, textKey: "q.env.too_light_noise_temp" },
  { id: "q21", kind: "likert", category: CategoryId.Environment, textKey: "q.env.uncomfortable_bed" },
  { id: "q22", kind: "likert", category: CategoryId.Environment, textKey: "q.env.bad_associations" },

  // 7) Snorking & pustesignal (Breathing)
  { id: "q23", kind: "likert", category: CategoryId.Breathing, textKey: "q.breathing.loud_snoring" },
  { id: "q24", kind: "likert", category: CategoryId.Breathing, textKey: "q.breathing.observed_apneas" },
  { id: "q25", kind: "likert", category: CategoryId.Breathing, textKey: "q.breathing.daytime_tired_despite" },

  // --- Siste: blodtrykk (autosubmit) ---
  { id: "f4", kind: "field", category: CategoryId.Breathing, textKey: "f.hypertension_dx", field: { subtype: "select", key: "hypertensionDx", optionsKey: "f.hypertension_dx.options" } },
];
