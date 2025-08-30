// app/layout.tsx
import "./globals.css";
import { I18nProvider } from "./providers/I18nProvider";

export const metadata = {
  title: "DMZ Sleep Test",
  description: "Enkel, forskningsnær søvntest med flerspråk.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb">
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
