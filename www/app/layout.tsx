// app/layout.tsx
import "./globals.css";
import { I18nProvider } from "./providers/I18nProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";

// Alle språk vi støtter
const SUPPORTED_LANGS = ["en", "nb", "de", "es", "fr", "hi", "ja", "ko", "pt-BR", "ru", "sk", "zh", "ar"] as const;
const DEFAULT_LANG = "en";

export const metadata: Metadata = {
  metadataBase: new URL("https://sleep-test.org"),
  title: "Sleep Test – Free - No login 5-Minute Sleep Quality Report",
  description:
    "Take a free sleep test in 5–10 minutes. Answer 30 simple questions and get an instant report with sleep score, patterns, and practical tips.",
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
  openGraph: {
    title: "Sleep Test – Free 5-Minute Sleep Quality Report",
    description:
      "Take a free sleep test in 5–10 minutes. Answer 30 simple questions and get an instant report with sleep score, patterns, and practical tips.",
    url: "https://sleep-test.org/",
    siteName: "Sleep Test",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Sleep Test – Free 5-Minute Sleep Quality Report",
    description:
      "Take a free sleep test in 5–10 minutes. Answer 30 simple questions and get an instant report with sleep score, patterns, and practical tips.",
  },
};

// Boot-script for språk og tema
const bootScript = `…samme som du har nå…`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="dark light" />
        {/* Set theme & lang before paint */}
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="app-shell">
        <I18nProvider>{children}</I18nProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
