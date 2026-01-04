// app/[lang]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HomeClient from "../home/HomeClient";
import {
  DEFAULT_LANG,
  LANG_TO_SEGMENT,
  SUPPORTED_LANGS,
  langFromSegment,
} from "@/lib/lang";
import { getHomeMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return SUPPORTED_LANGS
    .map((lang) => LANG_TO_SEGMENT[lang])
    .filter((segment) => segment)
    .map((segment) => ({ lang: segment }));
}

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  const lang = langFromSegment(params.lang);
  if (!lang) {
    return getHomeMetadata(DEFAULT_LANG);
  }
  return getHomeMetadata(lang);
}

export default function HomeLangPage({ params }: { params: { lang: string } }) {
  const lang = langFromSegment(params.lang);
  if (!lang) {
    notFound();
  }
  return <HomeClient />;
}
