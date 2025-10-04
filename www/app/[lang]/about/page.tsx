// app/[lang]/about/page.tsx
export { default } from "@/app/about/page";

import type { Metadata } from "next";
import { seoForPath } from "../_seo";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  const path = params.lang === "en" ? "/about" : `/${params.lang}/about`;
  return { ...seoForPath(path) };
}
