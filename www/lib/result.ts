import { ALL_CATEGORIES, CategoryId } from "@/lib/types";
import { Severity, severityFromScore } from "@/lib/scoring";

export type CategoryEntry = {
  id: CategoryId;
  raw: number | null;
  display: number;
  severity: Severity;
  hasAnswer: boolean;
};

export function buildCategoryEntries(
  categoryScores: Record<string, number> | null | undefined
): CategoryEntry[] {
  return ALL_CATEGORIES.map((cat) => {
    const rawVal = categoryScores?.[cat];
    const raw = typeof rawVal === "number" ? rawVal : null;
    const display = raw == null ? 0 : 100 - raw;
    const severity = raw == null ? "yellow" : severityFromScore(display);
    return {
      id: cat,
      raw,
      display,
      severity,
      hasAnswer: raw != null,
    };
  });
}
