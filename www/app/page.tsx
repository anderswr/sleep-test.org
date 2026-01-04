// app/page.tsx
import type { Metadata } from "next";
import HomeClient from "./home/HomeClient";
import { DEFAULT_LANG } from "@/lib/lang";
import { getHomeMetadata } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return getHomeMetadata(DEFAULT_LANG);
}

export default function HomePage() {
  return <HomeClient />;
}
