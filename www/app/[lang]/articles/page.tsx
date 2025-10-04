// app/[lang]/articles/page.tsx
export { default } from "@/app/articles/page";

import type { Metadata } from "next";
import { seoForPath } from "../_seo";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  const path = params.lang === "en" ? "/articles" : `/${params.lang}/articles`;
  return { ...seoForPath(path) };
}
