// lib/i18n.ts
export type Dict = Record<string, unknown>;

// --- Overloads ---
// 1) Vanlig UI-bruk: returnerer string, "" hvis ikke funnet
export function t(dict: Dict, key?: string): string;
export function t(dict: Dict, key: string, fallback: string): string;

// 2) Generisk bruk: krever fallback (objekt/array/number/bool), returnerer T
export function t<T>(dict: Dict, key: string, fallback: T): T;

// --- Implementasjon ---
export function t(dict: Dict, key?: string, fallback?: unknown): unknown {
  // Hvis ingen key: returner fallback hvis gitt, ellers "" (kun for string-varianten)
  if (!key) return (fallback as unknown) ?? "";

  // Slå opp nested verdi via "a.b.c"
  const parts = key.split(".");
  let cur: unknown = dict;

  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      // Ikke funnet: Hvis generisk (fallback gitt) → returner fallback.
      // Ellers (string-variant) → tom streng.
      return (arguments.length >= 3 ? fallback : "") as unknown;
    }
  }

  // Funnet verdi: Hvis undefined/null → fall tilbake som over.
  if (cur === undefined || cur === null) {
    return (arguments.length >= 3 ? fallback : "") as unknown;
  }

  return cur;
}
