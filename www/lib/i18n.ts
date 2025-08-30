// lib/i18n.ts
export type Dict = Record<string, any>;

export function t(dict: Dict, key?: string, fallback = ""): string {
  if (!key) return fallback;
  return key.split(".").reduce((obj: any, k) => (obj ? obj[k] : undefined), dict) ?? fallback;
}
