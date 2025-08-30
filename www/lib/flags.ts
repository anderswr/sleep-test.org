// lib/flags.ts
import { AnswerMap, FieldMap, LikertValue } from "@/lib/types";
import { avg, likertTo100 } from "@/lib/scoring";

/**
 * Enkle varsler basert på svar:
 * - osaSignal: mulige tegn på obstruktiv søvnapné (snorking, pustestopp, sterk tretthet, hypertensjon)
 * - excessiveSleepiness: høy skår på dagtretthet-kategorien (≥60)
 */
export function computeFlags(answers: AnswerMap, fields: FieldMap) {
  // Pustesignaler (fra Breathing-kategorien)
  const snoring = answers["q23"] ?? 1;        // "Jeg snorker høyt."
  const apneas = answers["q24"] ?? 1;         // "Andre har observert pustestopp..."
  const tiredDespite = answers["q25"] ?? 1;   // "Kraftig trett på dagtid selv etter normal natt."
  const htn = fields.hypertensionDx;          // f4: Ja/Nei/Vet ikke

  const osaSignal = snoring >= 4 || apneas >= 3 || tiredDespite >= 4 || htn === "yes";

  // Dagtretthet (fra Daytime-kategorien): q12, q13, q14
  const daytimeRaw = [answers["q12"], answers["q13"], answers["q14"]]
    .filter((v): v is LikertValue => v !== undefined) as LikertValue[];

  const daytimeAvg = avg(daytimeRaw.map((v) => likertTo100(v)));

  const excessiveSleepiness = daytimeAvg >= 60;

  return { osaSignal, excessiveSleepiness };
}
