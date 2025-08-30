import { CategoryId, Question } from "@/lib/types";

// Kun nøkler – all tekst kommer fra /locales/*.json
export const QUESTION_BANK: Question[] = [
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

  // Konkrete felt (frivillig, påvirker ikke skår direkte)
  { id: "f1", kind: "field", category: CategoryId.Pattern,   textKey: "f.bedtime",         field: { subtype: "time",   key: "bedtime" } },
  { id: "f2", kind: "field", category: CategoryId.Pattern,   textKey: "f.waketime",        field: { subtype: "time",   key: "waketime" } },
  { id: "f3", kind: "field", category: CategoryId.Pattern,   textKey: "f.sleep_hours",     field: { subtype: "number", key: "sleepHours" } },
  { id: "f4", kind: "field", category: CategoryId.Breathing, textKey: "f.hypertension_dx", field: { subtype: "select", key: "hypertensionDx", optionsKey: "f.hypertension_dx.options" } },
];
