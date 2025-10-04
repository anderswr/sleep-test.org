import type { Metadata } from "next";
import { LOCALES } from "@/lib/i18n-routing";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sleep-test.org";

type Props = {
  children: React.ReactNode;
  params: { lang: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = params;

  // Bygg canonical URL
  const canonical = `${BASE}/${lang}`;

  // Lag hreflang-lenker
  const alternates: Record<string, string> = {};
  for (const l of LOCALES) {
    alternates[l] = `${BASE}/${l}`;
  }

  return {
    metadataBase: new URL(BASE),
    alternates: {
      canonical,
      languages: alternates,
    },
    title: "Sleep Test", // ← du kan utvide med t(dict, "ui.home.title") hvis du vil
    description:
      "Free sleep test — science-based report with tips for better sleep.",
  };
}

export default function LangLayout({ children }: Props) {
  return <>{children}</>;
}
