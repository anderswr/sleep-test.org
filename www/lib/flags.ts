// lib/flags.ts
import { AnswerMap, LikertValue } from "@/lib/types";

/**
 * Small helpers
 */
const get = (answers: AnswerMap, id: string): LikertValue | undefined =>
  answers[id] as LikertValue | undefined;

const gte = (answers: AnswerMap, id: string, n: number) => {
  const v = get(answers, id);
  return typeof v === "number" ? v >= n : false;
};

const avg = (ns: number[]) => (ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : 0);

/**
 * Flags are computed *only* from Likert answers now.
 * We intentionally do not use any field/metadata here anymore.
 */
export function computeFlags(answers: AnswerMap) {
  // OSA-ish signal from the “Breathing” trio
  const loudSnoring = gte(answers, "q23", 4);      // loud snoring: Often/Very often
  const apneas      = gte(answers, "q24", 3);      // witnessed apneas: Sometimes+
  const verySleepy  = gte(answers, "q25", 4);      // marked daytime sleepiness: Often+

  const osaSignal = !!(loudSnoring || apneas || verySleepy);

  // Excessive daytime sleepiness heuristic from Daytime cluster (q12–q14)
  const daytimeVals = ["q12", "q13", "q14"]
    .map((id) => answers[id])
    .filter((v): v is LikertValue => typeof v === "number");
  const daytimeAvg = avg(daytimeVals); // 1–5 scale
  const excessiveSleepiness = daytimeAvg >= 4; // Often+

  return { osaSignal, excessiveSleepiness };
}
