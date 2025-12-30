// app/api/submit/util.ts
import {
  AnswerMap,
  CategoryId,
  CategoryScores,
  ComputedResult,
  BANK_VERSION,
} from "@/lib/types";
import { computeCategoryScores, computeTotalRaw } from "@/lib/scoring";
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
  [CategoryId.Mental]:        ["q31", "q32", "q33", "q34"],
  [CategoryId.Chronotype]:    ["q35", "q36", "q37"],
};

const hasAnyAnswer = (answers: AnswerMap, ids: string[]) =>
  ids.some((id) => typeof answers[id] === "number");

/**
 * Compute the full result doc from answers.
 * Fields are no longer part of the pipeline.
 */
export async function computeAllServer(answers: AnswerMap): Promise<ComputedResult> {
  const categoryScores: CategoryScores = computeCategoryScores(answers, BY_CAT);

  const includeMental = hasAnyAnswer(answers, BY_CAT[CategoryId.Mental]);

  // totalRaw is the weighted average across categories (0–100; higher is worse)
  const totalRaw = computeTotalRaw(categoryScores, { includeMental });

  // sleepScore is the “positive” score (higher is better)
  const sleepScore = Math.max(0, 100 - totalRaw);

  const flags = computeFlags(answers);

  const suggestedTips = {} as ComputedResult["suggestedTips"];

  const mentalScore = categoryScores[CategoryId.Mental] ?? 0;
  const mentalDisplay = 100 - mentalScore;
  const mentalColor =
    mentalDisplay <= 30 ? "red" : mentalDisplay <= 70 ? "yellow" : "green";

  if (includeMental) {
    suggestedTips[CategoryId.Mental] =
      mentalColor === "green"
        ? ["tips.mental.maintain"]
        : [
            "tips.mental.wind_down_45",
            "tips.mental.write_worries",
            "tips.mental.calm_breath",
            "tips.mental.stimulus_control",
          ];
  }

  const shiftWork = answers["q36"];
  const eveningType = answers["q35"];
  const shiftWorkHigh = typeof shiftWork === "number" && shiftWork >= 4;
  const eveningTypeHigh = typeof eveningType === "number" && eveningType >= 4;

  if (hasAnyAnswer(answers, BY_CAT[CategoryId.Chronotype])) {
    if (shiftWorkHigh) {
      suggestedTips[CategoryId.Chronotype] = [
        "tips.chrono.light_management",
        "tips.chrono.anchoring",
        "tips.chrono.short_naps",
        "tips.chrono.caffeine_cutoff",
      ];
    } else if (eveningTypeHigh) {
      suggestedTips[CategoryId.Chronotype] = [
        "tips.chrono.shift_gradual",
        "tips.chrono.morning_light",
      ];
    } else {
      suggestedTips[CategoryId.Chronotype] = [
        "tips.chrono.maintain",
        "tips.chrono.morning_light",
      ];
    }
  }

  return {
    version: BANK_VERSION,
    categoryScores,
    totalRaw,
    sleepScore,
    flags,
    suggestedTips,
  };
}
