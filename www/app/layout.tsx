import "./globals.css";
import { I18nProvider } from "./providers/I18nProvider";

export const metadata = { title: "Sleep Test" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb">
      <body className="site">
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
