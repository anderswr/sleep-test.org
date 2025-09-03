"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/app/providers/I18nProvider";
import { t } from "@/lib/i18n";
import Image from "next/image";
import * as React from "react";

export default function SiteHeader() {
  const { dict, lang, setLang } = useI18n();
  const pathname = usePathname();

  const NavItem = ({ href, k }: { href: string; k: string }) => (
    <Link
      href={href}
      className={pathname === href || pathname.startsWith(href + "/") ? "active" : ""}
    >
      {t(dict, k)}
    </Link>
  );

  return (
    <header className="topbar" style={{ gap: 16 }}>
      {/* Left: logo + nav */}
      <div className="row" style={{ gap: 24 }}>
        <Link href="/" className="row" style={{ gap: 8, alignItems: "center" }}>
          <Image
            src="/favicon.ico"
            alt="Sleep Test"
            width={28}
            height={28}
            style={{ borderRadius: 6 }}
          />
          <span className="sr-only">{t(dict, "ui.home.title", "Sleep Test")}</span>
        </Link>
        <nav className="nav">
          <NavItem href="/" k="ui.nav.home" />
          <NavItem href="/result" k="ui.nav.result" />
          <NavItem href="/compare" k="ui.nav.compare" />
          <NavItem href="/articles" k="ui.nav.articles" />
          <NavItem href="/about" k="ui.nav.about" />
        </nav>
      </div>

      {/* Right: language select */}
      <div>
        <label className="visually-hidden" htmlFor="langselect">
          Language
        </label>
        <div
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          <select
            id="langselect"
            value={lang}
            onChange={(e) => setLang(e.target.value as any)}
            aria-label="Language"
            className="modern-select"
          >
            <option value="nb">Norsk</option>
            <option value="en">English</option>
          </select>
          <span className="select-caret" aria-hidden>
            ▾
          </span>
        </div>
      </div>

      <style jsx>{`
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          border: 0;
          white-space: nowrap;
        }
        .modern-select {
          appearance: none;
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 8px 34px 8px 12px;
          font-size: 0.95rem;
          box-shadow: var(--shadow);
          color: var(--text);
        }
        .modern-select:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-weak);
        }
        .select-caret {
          position: absolute;
          right: 10px;
          pointer-events: none;
          color: var(--muted);
          font-size: 12px;
        }
      `}</style>
    </header>
  );
}
