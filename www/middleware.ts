// middleware.ts
import { NextRequest, NextResponse } from "next/server";

// Språk vi støtter (må matche next.config.js og locales)
const SUPPORTED = ["en","ar","de","es","fr","hi","ja","ko","nb","pt-BR","ru","sk","zh"];
const DEFAULT = "en";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Vi vil bare gjøre noe på rot ("/") eller evt. ukjente stier uten språk
  if (pathname === "/") {
    const langHeader = req.headers.get("accept-language") || "";
    const detected = detectLang(langHeader);

    const target = SUPPORTED.includes(detected) ? detected : DEFAULT;
    return NextResponse.redirect(new URL(`/${target}`, req.url));
  }

  return NextResponse.next();
}

// Enkel funksjon for å mappe browser-språk til våre koder
function detectLang(header: string): string {
  const langs = header
    .split(",")
    .map((l) => l.split(";")[0].trim().toLowerCase());

  for (const l of langs) {
    if (SUPPORTED.includes(l)) return l;
    if (l.startsWith("nb") || l.startsWith("no") || l.startsWith("nn")) return "nb";
    if (l.startsWith("pt")) return "pt-BR"; // fanger brasiliansk portugisisk
    if (l.startsWith("zh")) return "zh";
    if (l.startsWith("en")) return "en";
    if (l.startsWith("de")) return "de";
    if (l.startsWith("fr")) return "fr";
    if (l.startsWith("es")) return "es";
    if (l.startsWith("ja")) return "ja";
    if (l.startsWith("ko")) return "ko";
    if (l.startsWith("ru")) return "ru";
    if (l.startsWith("sk")) return "sk";
    if (l.startsWith("hi")) return "hi";
    if (l.startsWith("ar")) return "ar";
  }

  return DEFAULT;
}
