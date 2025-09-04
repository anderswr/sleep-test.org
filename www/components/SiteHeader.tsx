// components/SiteHeader.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useI18n } from "@/app/providers/I18nProvider";
import { t } from "@/lib/i18n";
import * as React from "react";

const LANGS = [
  { code: "nb", label: "Norsk", flag: "🇳🇴" },
  { code: "en", label: "English", flag: "🇺🇸" }, // or 🇺🇸🇬🇧 if you prefer
] as const;

export default function SiteHeader() {
  const { dict, lang, setLang } = useI18n();
  const pathname = usePathname();

  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  // Close on outside click / ESC
  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  const NavItem = ({ href, k }: { href: string; k: string }) => (
    <Link
      href={href}
      className={
        pathname === href || pathname.startsWith(href + "/") ? "active" : ""
      }
    >
      {t(dict, k)}
    </Link>
  );

  return (
    <header className="topbar" style={{ gap: 16 }}>
      {/* Left: logo + nav */}
      <div className="row" style={{ gap: 24 }}>
        <Link
          href="/"
          className="row"
          style={{ gap: 8, alignItems: "center" }}
          aria-label={t(dict, "ui.home.title", "Sleep Test")}
        >
          <Image
            src="/favicon.ico"
            alt=""
            width={28}
            height={28}
            style={{ borderRadius: 6 }}
          />
        </Link>

        <nav className="nav">
          <NavItem href="/" k="ui.nav.home" />
          <NavItem href="/result" k="ui.nav.result" />
          <NavItem href="/compare" k="ui.nav.compare" />
          <NavItem href="/articles" k="ui.nav.articles" />
          <NavItem href="/about" k="ui.nav.about" />
        </nav>
      </div>

      {/* Right: compact flag dropdown */}
      <div ref={ref} className="lang-wrap">
        <button
          type="button"
          className="lang-btn"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="flag" aria-hidden>
            {current.flag}
          </span>
          <span className="lang-label">{current.label}</span>
          <span className="caret" aria-hidden>
            ▾
          </span>
        </button>

        {open && (
          <div className="lang-menu" role="menu">
            {LANGS.map((l) => (
              <button
                key={l.code}
                type="button"
                role="menuitemradio"
                aria-checked={lang === l.code}
                className={`lang-item ${lang === l.code ? "active" : ""}`}
                onClick={() => {
                  setLang(l.code as any); // updates immediately
                  setOpen(false);
                }}
              >
                <span className="flag" aria-hidden>
                  {l.flag}
                </span>
                <span className="lang-label">{l.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .lang-wrap {
          position: relative;
        }
        .lang-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: #fff;
          box-shadow: var(--shadow);
          font: inherit;
        }
        .flag {
          font-size: 1rem; /* emoji flag size */
          line-height: 1;
        }
        .lang-label {
          font-size: 0.95rem;
        }
        .caret {
          margin-left: 2px;
          color: var(--muted);
          font-size: 12px;
        }
        .lang-menu {
          position: absolute;
          right: 0;
          top: calc(100% + 6px);
          min-width: 160px;
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: var(--shadow);
          padding: 6px;
          display: grid;
          gap: 4px;
          z-index: 20;
        }
        .lang-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 10px;
          border: 0;
          background: transparent;
          text-align: left;
          cursor: pointer;
        }
        .lang-item:hover {
          background: var(--primary-weak);
        }
        .lang-item.active {
          background: var(--primary-weak);
          outline: 1px solid var(--primary);
        }
      `}</style>
    </header>
  );
}
