// app/layout.tsx
import "./globals.css";
import { I18nProvider } from "./providers/I18nProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
  title: "Sleep Test",
  description: "Answer 30 questions and get a practical sleep report.",
};

// Runs before React mounts: choose theme + language with minimal flash
const bootScript = `
(function () {
  try {
    // ---------- THEME ----------
    // User override: localStorage.theme in {"light","dark","system"}
    var pref = localStorage.getItem("theme");
    var systemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme =
      pref === "light" ? "light" :
      pref === "dark"  ? "dark"  :
      // default to system
      (systemDark ? "dark" : "light");

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

    var lang = savedLang || (wantsNb ? "nb" : "en");
    document.documentElement.lang = lang;
    document.documentElement.setAttribute("data-lang", lang);
    // Note: don't write localStorage here unless you want auto-detection to stick.
    // Leave it to your language switcher to set localStorage.lang = "nb"|"en".
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
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
