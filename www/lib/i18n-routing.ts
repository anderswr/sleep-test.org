// lib/i18n-routing.ts
export const LOCALES = ["en","ar","de","es","fr","hi","ja","ko","nb","pt-BR","ru","sk","zh"] as const;
export type Locale = typeof LOCALES[number];

export const DEFAULT_LOCALE: Locale = "en";

// RTL-språk
export function isRTL(lang: string) {
  return lang === "ar";
}

export function langDir(lang: string): "rtl" | "ltr" {
  return isRTL(lang) ? "rtl" : "ltr";
}

// Bygger absolute URL
export function absUrl(base: string, path: string) {
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  return path ? `${b}${path.startsWith("/") ? "" : "/"}${path}` : b;
}

// Bygg hreflang-alternativer for en gitt "lokal" sti (uten domene)
export function buildAlternatesForPath(base: string, pathname: string) {
  // pathname forventes å være med språkprefiks, f.eks. /en/result
  // Vi speiler samme path for alle språk
  const parts = pathname.split("/").filter(Boolean);
  const maybeLocale = parts[0];
  const rest = parts.slice(1).join("/");
  const normalized = `/${rest || ""}`.replace(/\/+$/, "") || "/";

  const languages: Record<string, string> = {};
  for (const l of LOCALES) {
    const p = l === DEFAULT_LOCALE ? normalized : `/${l}${normalized === "/" ? "" : normalized}`;
    languages[l] = absUrl(base, p);
  }

  // x-default peker til defaultLocale
  const xDefault = languages[DEFAULT_LOCALE];

  return { languages, xDefault };
}
