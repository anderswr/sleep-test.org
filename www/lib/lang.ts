// lib/lang.ts
export const DEFAULT_LANG = "en";

export const SUPPORTED_LANGS = [
  "ar",
  "de",
  "en",
  "es",
  "fr",
  "hi",
  "ja",
  "ko",
  "nb",
  "pt-BR",
  "ru",
  "sk",
  "zh",
] as const;

export type Lang = (typeof SUPPORTED_LANGS)[number];

export const LANG_TO_SEGMENT: Record<Lang, string> = {
  ar: "ar",
  de: "de",
  en: "",
  es: "es",
  fr: "fr",
  hi: "hi",
  ja: "ja",
  ko: "ko",
  nb: "nb",
  "pt-BR": "pt-br",
  ru: "ru",
  sk: "sk",
  zh: "zh",
};

export const SEGMENT_TO_LANG: Record<string, Lang> = Object.fromEntries(
  Object.entries(LANG_TO_SEGMENT)
    .filter(([, segment]) => segment)
    .map(([lang, segment]) => [segment, lang as Lang])
) as Record<string, Lang>;

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (SUPPORTED_LANGS as readonly string[]).includes(value);
}

export function langFromSegment(segment?: string | null): Lang | null {
  if (!segment) return null;
  return SEGMENT_TO_LANG[segment.toLowerCase()] ?? null;
}

export function langFromPathname(pathname: string): Lang | null {
  const [, segment] = pathname.split("/");
  return langFromSegment(segment);
}

export function langToHomePath(lang: Lang): string {
  const segment = LANG_TO_SEGMENT[lang];
  return segment ? `/${segment}` : "/";
}

export function isLocaleHomePath(pathname: string): boolean {
  if (pathname === "/") return true;
  const lang = langFromPathname(pathname);
  return !!lang && pathname === langToHomePath(lang);
}
