// app/[lang]/page.tsx
export { default } from "@/app/page";

import type { Metadata } from "next";
import { seoForPath } from "./_seo";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  const path = params.lang === "en" ? "/" : `/${params.lang}`;
  return {
    ...seoForPath(path),
  };
}
