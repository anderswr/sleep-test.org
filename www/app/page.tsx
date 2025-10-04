// app/page.tsx
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sleep Test – Free 5-Minute Sleep Quality Report",
  description:
    "Answer 30 quick questions in 5–10 minutes. Get a free sleep score with patterns, explanations, and tips.",
  alternates: {
    canonical: "https://sleep-test.org/",
    languages: {
      "x-default": "https://sleep-test.org/",
      en: "https://sleep-test.org/en",
      nb: "https://sleep-test.org/nb",
      de: "https://sleep-test.org/de",
      es: "https://sleep-test.org/es",
      fr: "https://sleep-test.org/fr",
      hi: "https://sleep-test.org/hi",
      ja: "https://sleep-test.org/ja",
      ko: "https://sleep-test.org/ko",
      "pt-BR": "https://sleep-test.org/pt-BR",
      ru: "https://sleep-test.org/ru",
      sk: "https://sleep-test.org/sk",
      zh: "https://sleep-test.org/zh",
      ar: "https://sleep-test.org/ar",
    },
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootRedirect() {
  // 🚀 Default: alltid til engelsk (SEO: x-default peker hit)
  redirect("/en");
}
