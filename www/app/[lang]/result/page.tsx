// app/[lang]/result/page.tsx
export { default } from "@/app/result/page";

import type { Metadata } from "next";
import { seoForPath } from "../_seo";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  const path = params.lang === "en" ? "/result" : `/${params.lang}/result`;
  return { ...seoForPath(path) };
}
