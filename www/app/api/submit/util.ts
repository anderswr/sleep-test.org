// app/api/submit/util.ts
import { AnswerMap, CategoryId, CategoryScores, ComputedResult, FieldMap } from "@/lib/types";
import { QUESTION_BANK } from "@/data/questions";
import { computeFlags } from "@/lib/flags";
import { avg, bucketColor, computeCategoryScores } from "@/lib/scoring";

const byCatIds: Record<CategoryId, string[]> = {
  pattern: [], insomnia: [], quality: [], daytime: [], hygiene: [], environment: [], breathing: [],
} as any;

QUESTION_BANK.forEach((q) => { if (q.kind === "likert") byCatIds[q.category].push(q.id); });

const RESULT_TIP_KEYS = {
  pattern: { green: ["tips.pattern.keep_routine", "tips.pattern.short_naps"], yellow: ["tips.pattern.consistent_bed_wake", "tips.pattern.plan_winddown"], red: ["tips.pattern.protect_7h", "tips.pattern.cut_late_naps"] },
  insomnia:{ green: ["tips.insomnia.maintain"], yellow: ["tips.insomnia.rule_20min", "tips.insomnia.fixed_wake"], red: ["tips.insomnia.stimulus_control", "tips.insomnia.consider_cbti"] },
  quality: { green: ["tips.quality.track_triggers"], yellow: ["tips.quality.address_disruptors"], red: ["tips.quality.consult_if_pain"] },
  daytime: { green: ["tips.daytime.morning_light"], yellow: ["tips.daytime.activity_breaks"], red: ["tips.daytime.consider_medical"] },
  hygiene: { green: ["tips.hygiene.keep_it_up"], yellow: ["tips.hygiene.screens_off_60", "tips.hygiene.limit_caffeine"], red: ["tips.hygiene.no_alcohol_late", "tips.hygiene.no_big_meals_late"] },
  environment: { green: ["tips.environment.keep_cool_dark"], yellow: ["tips.environment.test_blackout", "tips.environment.noise_control"], red: ["tips.environment.try_new_pillow", "tips.environment.cooler_temp"] },
  breathing: { green: ["tips.breathing.side_sleep"], yellow: ["tips.breathing.reduce_evening_alcohol"], red: ["tips.breathing.consider_gp_check"] },
} as const;

export async function computeAllServer(answers: AnswerMap, fields: FieldMap): Promise<ComputedResult> {
  const categoryScores: CategoryScores = computeCategoryScores(answers, byCatIds);
  const totalRaw = Math.round(avg(Object.values(categoryScores)));
  const sleepScore = 100 - totalRaw;

  const flags = computeFlags(answers, fields);

  const suggestedTips: Record<CategoryId, string[]> = { pattern: [], insomnia: [], quality: [], daytime: [], hygiene: [], environment: [], breathing: [], } as any;
  (Object.keys(categoryScores) as CategoryId[]).forEach((cat) => {
    const color = bucketColor(categoryScores[cat]);
    suggestedTips[cat] = (RESULT_TIP_KEYS as any)[cat][color];
  });

  return { version: "1.0.0", categoryScores, totalRaw, sleepScore, flags, suggestedTips };
}
