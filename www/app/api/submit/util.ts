// app/api/submit/util.ts
import { AnswerMap, CategoryId, CategoryScores, ComputedResult, BANK_VERSION } from "@/lib/types";
import { computeCategoryScores } from "@/lib/scoring";
import { computeFlags } from "@/lib/flags";

/**
 * Server-side category mapping (Likert-only ids).
 * Keep in sync with /data/questions.ts groupings.
 */
const BY_CAT: Record<CategoryId, string[]> = {
  pattern:     ["q1", "q2", "q3"],
  insomnia:    ["q4", "q5", "q6", "q7", "q8"],
  quality:     ["q9", "q10", "q11"],
  daytime:     ["q12", "q13", "q14"],
  hygiene:     ["q15", "q16", "q17", "q18", "q19"],
  environment: ["q20", "q21", "q22"],
  breathing:   ["q23", "q24", "q25"],
};

/**
 * Compute the full result doc from answers.
 * Fields are no longer part of the pipeline.
 */
export async function computeAllServer(answers: AnswerMap): Promise<ComputedResult> {
  const categoryScores: CategoryScores = computeCategoryScores(answers, BY_CAT);

  // totalRaw is the average across categories (0–100; higher worse)
  const catVals = Object.values(categoryScores);
  const totalRaw =
    catVals.length ? Math.round(catVals.reduce((a, b) => a + b, 0) / catVals.length) : 0;

  // sleepScore is the “positive” score (higher better)
  const sleepScore = Math.max(0, 100 - totalRaw);

  const flags = computeFlags(answers);

  // Suggested tips are still grouped per category by color buckets on the client,
  // so server leaves this empty; client picks i18n tips per category/color as before.
  const suggestedTips = {} as ComputedResult["suggestedTips"];

  return {
    version: BANK_VERSION,
    categoryScores,
    totalRaw,
    sleepScore,
    flags,
    suggestedTips,
  };
}
