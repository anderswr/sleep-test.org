import "./globals.css";
import { I18nProvider } from "./providers/I18nProvider";
import { Analytics } from "@vercel/analytics/react"; // 
import { SpeedInsights } from "@vercel/speed-insights/next";



export const metadata = {
  title: "Sleep Test",
  description: "Answer 30 questions and get a practical sleep report.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb">
      <body className="app-shell">
        <I18nProvider>{children}</I18nProvider>

     {/* Vercel Web Analytics og SpeedInsights – cookie-less, GDPR-vennlig */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
