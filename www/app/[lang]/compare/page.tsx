// app/[lang]/compare/page.tsx
export { default } from "@/app/compare/page";

import type { Metadata } from "next";
import { seoForPath } from "../_seo";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  const path = params.lang === "en" ? "/compare" : `/${params.lang}/compare`;
  return { ...seoForPath(path) };
}
