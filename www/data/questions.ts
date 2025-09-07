// /data/questions.ts
import { CategoryId, Question } from "@/lib/types";

/**
 * Nå kun Likert-spørsmål.
 * - q1–q25 som før (søvnkategoriene)
 * - q26–q30: Blodtrykksrisiko (nye, Likert)
 *
 * Fjernet:
 * - w1–w6 (field/chips)
 * - f4 (hypertensionDx autosubmit)
 */

export const QUESTION_BANK: Question[] = [
  // 1) Søvnmønster & varighet (Pattern)
  { id: "q1",  kind: "likert", category: CategoryId.Pattern,   textKey: "q.pattern.too_short" },
  { id: "q2",  kind: "likert", category: CategoryId.Pattern,   textKey: "q.pattern.irregular_times" },
  { id: "q3",  kind: "likert", category: CategoryId.Pattern,   textKey: "q.pattern.late_long_naps" },

  // 2) Innsovning & natt (Insomnia)
  { id: "q4",  kind: "likert", category: CategoryId.Insomnia,  textKey: "q.insomnia.long_sleep_onset" },
  { id: "q5",  kind: "likert", category: CategoryId.Insomnia,  textKey: "q.insomnia.frequent_awakenings" },
  { id: "q6",  kind: "likert", category: CategoryId.Insomnia,  textKey: "q.insomnia.early_morning_awakenings" },
  { id: "q7",  kind: "likert", category: CategoryId.Insomnia,  textKey: "q.insomnia.unrefreshed_mornings" },
  { id: "q8",  kind: "likert", category: CategoryId.Insomnia,  textKey: "q.insomnia.daytime_impact" },

  // 3) Søvnkvalitet & fornøydhet (Quality)
  { id: "q9",  kind: "likert", category: CategoryId.Quality,   textKey: "q.quality.overall_poor" },
  { id: "q10", kind: "likert", category: CategoryId.Quality,   textKey: "q.quality.dissatisfied" },
  { id: "q11", kind: "likert", category: CategoryId.Quality,   textKey: "q.quality.restless_nights" },

  // 4) Dagtid & søvnighet (Daytime)
  { id: "q12", kind: "likert", category: CategoryId.Daytime,   textKey: "q.daytime.doze_easily" },
  { id: "q13", kind: "likert", category: CategoryId.Daytime,   textKey: "q.daytime.struggle_stay_awake" },
  { id: "q14", kind: "likert", category: CategoryId.Daytime,   textKey: "q.daytime.tired_most_day" },

  // 5) Søvnhygiene & rutiner (Hygiene)
  { id: "q15", kind: "likert", category: CategoryId.Hygiene,   textKey: "q.hygiene.screens_before_bed" },
  { id: "q16", kind: "likert", category: CategoryId.Hygiene,   textKey: "q.hygiene.late_caffeine" },
  { id: "q17", kind: "likert", category: CategoryId.Hygiene,   textKey: "q.hygiene.alcohol_near_bed" },
  { id: "q18", kind: "likert", category: CategoryId.Hygiene,   textKey: "q.hygiene.big_meal_late" },
  { id: "q19", kind: "likert", category: CategoryId.Hygiene,   textKey: "q.hygiene.hard_exercise_late" },

  // 6) Søvnmiljø (Environment)
  { id: "q20", kind: "likert", category: CategoryId.Environment, textKey: "q.environment.too_light_noise_temp" },
  { id: "q21", kind: "likert", category: CategoryId.Environment, textKey: "q.environment.uncomfortable_bed" },
  { id: "q22", kind: "likert", category: CategoryId.Environment, textKey: "q.environment.bad_associations" },

  // 7) Snorking & pustesignal (Breathing)
  { id: "q23", kind: "likert", category: CategoryId.Breathing, textKey: "q.breathing.loud_snoring" },
  { id: "q24", kind: "likert", category: CategoryId.Breathing, textKey: "q.breathing.observed_apneas" },
  { id: "q25", kind: "likert", category: CategoryId.Breathing, textKey: "q.breathing.daytime_tired_despite" },

  // 8) Blodtrykksrisiko (BloodPressure) — nye Likert
  { id: "q26", kind: "likert", category: CategoryId.BloodPressure, textKey: "q.bloodpressure.diet_salty" },
  { id: "q27", kind: "likert", category: CategoryId.BloodPressure, textKey: "q.bloodpressure.activity_low" },
  { id: "q28", kind: "likert", category: CategoryId.BloodPressure, textKey: "q.bloodpressure.alcohol_often" },
  { id: "q29", kind: "likert", category: CategoryId.BloodPressure, textKey: "q.bloodpressure.stress_high" },
  { id: "q30", kind: "likert", category: CategoryId.BloodPressure, textKey: "q.bloodpressure.overweight_self" }
];
