// app/api/submit/util.ts
import {
  AnswerMap,
  CategoryId,
  CategoryScores,
  ComputedResult,
  BANK_VERSION,
} from "@/lib/types";
import { computeCategoryScores } from "@/lib/scoring";
import { computeFlags } from "@/lib/flags";

/**
 * Server-side category mapping (Likert-only ids).
 * Keep in sync with /data/questions.ts groupings.
 */
const BY_CAT: Record<CategoryId, string[]> = {
  [CategoryId.Pattern]:       ["q1", "q2", "q3"],
  [CategoryId.Insomnia]:      ["q4", "q5", "q6", "q7", "q8"],
  [CategoryId.Quality]:       ["q9", "q10", "q11"],
  [CategoryId.Daytime]:       ["q12", "q13", "q14"],
  [CategoryId.Hygiene]:       ["q15", "q16", "q17", "q18", "q19"],
  [CategoryId.Environment]:   ["q20", "q21", "q22"],
  [CategoryId.Breathing]:     ["q23", "q24", "q25"],
  // NEW: Blood pressure lifestyle risk (Likert-only)
  [CategoryId.BloodPressure]: ["q26", "q27", "q28", "q29", "q30"],
};

/**
 * Compute the full result doc from answers.
 * Fields are no longer part of the pipeline.
 */
export async function computeAllServer(answers: AnswerMap): Promise<ComputedResult> {
  const categoryScores: CategoryScores = computeCategoryScores(answers, BY_CAT);

  // totalRaw is the average across categories (0–100; higher is worse)
  const catVals = Object.values(categoryScores);
  const totalRaw = catVals.length
    ? Math.round(catVals.reduce((a, b) => a + b, 0) / catVals.length)
    : 0;

  // sleepScore is the “positive” score (higher is better)
  const sleepScore = Math.max(0, 100 - totalRaw);

  const flags = computeFlags(answers);

  // Suggested tips are populated client-side from i18n per category/color.
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
