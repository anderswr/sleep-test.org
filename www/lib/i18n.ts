// lib/i18n.ts
export type Dict = Record<string, any>;

// Overload 1: returnerer string (default bruk i JSX)
export function t(dict: Dict, key?: string, fallback?: string): string;

// Overload 2: generisk – bruk hvis du vil hente objekter/arrays
export function t<T>(dict: Dict, key?: string, fallback?: T): T;

// Implementasjon
export function t(dict: Dict, key?: string, fallback?: any) {
  if (!key) return fallback ?? "";
  const val = key.split(".").reduce((obj: any, k) => (obj ? obj[k] : undefined), dict);
  return (val ?? (fallback ?? "")) as any;
}
