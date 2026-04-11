// app/layout.tsx
import "./globals.css";
import { I18nProvider } from "./providers/I18nProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import Script from "next/script";
import { SEGMENT_TO_LANG } from "@/lib/lang";

export const metadata: Metadata = {
  metadataBase: new URL("https://sleep-test.org"),
  title: "Sleep Test – Free - No login 5-Minute Sleep Quality Report",
  description:
    "Take a free sleep test in 5–10 minutes. Answer 39–42 simple questions and get an instant report with sleep score, patterns, and practical tips.",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Sleep Test – Free 5-Minute Sleep Quality Report",
    description:
      "Take a free sleep test in 5–10 minutes. Answer 39–42 simple questions and get an instant report with sleep score, patterns, and practical tips.",
    url: "https://sleep-test.org/",
    siteName: "Sleep Test",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Sleep Test – Free 5-Minute Sleep Quality Report",
    description:
      "Take a free sleep test in 5–10 minutes. Answer 39–42 simple questions and get an instant report with sleep score, patterns, and practical tips.",
  },
};

// Runs before React mounts: choose theme + language with minimal flash
const bootScript = `
(function () {
  try {
    var localeMap = ${JSON.stringify(SEGMENT_TO_LANG)};
    var pathSeg = (window.location.pathname.split("/")[1] || "").toLowerCase();
    var langFromPath = localeMap[pathSeg] || null;

    // ---------- THEME ----------
    // User override: localStorage.theme in {"light","dark","system"}
    var pref = localStorage.getItem("theme");
    var theme =
      pref === "light" ? "light" :
      pref === "dark"  ? "dark"  :
      // default to dark
      "dark";

    // Our CSS defaults to dark unless data-theme="light" is set.
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }

    // ---------- LANGUAGE ----------
    // If user has chosen a language before, honor it.
    var savedLang = localStorage.getItem("lang");
    var navLangs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "en"]).map(String);
    // any Norwegian variant? (nb, no, nn)
    var wantsNb = navLangs.some(function (l) { l = l.toLowerCase(); return l === "nb" || l.startsWith("nb-") || l === "no" || l.startsWith("no-") || l === "nn" || l.startsWith("nn-"); });

    var lang = langFromPath || savedLang || (wantsNb ? "nb" : "en");
    document.documentElement.lang = lang;
    document.documentElement.setAttribute("data-lang", lang);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="dark light" />
        <meta
          name="google-adsense-account"
          content="ca-pub-2004312209927228"
        />
        {/* Set theme & lang before paint */}
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <Script id="google-consent-default" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              analytics_storage: 'denied',
              wait_for_update: 500
            });
          `}
        </Script>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-4D4N3LYB13"
          strategy="afterInteractive"
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2004312209927228"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-4D4N3LYB13');
          `}
        </Script>
      </head>
      <body className="app-shell">
        <I18nProvider>{children}</I18nProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
