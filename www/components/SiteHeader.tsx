"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/app/providers/I18nProvider";
import { t } from "@/lib/i18n";

export default function SiteHeader() {
  const { dict } = useI18n();
  const pathname = usePathname();

  const item = (href: string, key: string) => (
    <Link href={href} className={pathname === href || pathname.startsWith(href + "/") ? "active" : ""}>
      {t(dict, key)}
    </Link>
  );

  return (
    <header className="topbar">
      <Link href="/" className="font-bold text-lg">
        {t(dict, "ui.home.title", "Sleep Test")}
      </Link>
      <nav className="nav">
        {item("/", "ui.menu.home")}
        {item("/result", "ui.menu.result")}
        {item("/compare", "ui.menu.compare")}
        {item("/articles", "ui.menu.articles")}
        {item("/about", "ui.menu.about")}
      </nav>
    </header>
  );
}
