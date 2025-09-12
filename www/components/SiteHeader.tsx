// components/SiteHeader.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useI18n } from "@/app/providers/I18nProvider";
import { t } from "@/lib/i18n";
import * as React from "react";

const LANGS = [
  { code: "nb", label: "Norsk",  flag: "🇳🇴" },
  { code: "en", label: "English", flag: "🇺🇸" },
] as const;

type Theme = "light" | "dark";

function getCurrentTheme(): Theme {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {}
  if (typeof document !== "undefined") {
    const fromHtml = document.documentElement.getAttribute("data-theme");
    if (fromHtml === "light" || fromHtml === "dark") return fromHtml;
  }
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}
function setTheme(next: Theme) {
  document.documentElement.setAttribute("data-theme", next);
  try { localStorage.setItem("theme", next); } catch {}
}

export default function SiteHeader() {
  const { dict, lang, setLang } = useI18n();
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = React.useState(false);
  const [theme, setThemeState] = React.useState<Theme>(() =>
    typeof window === "undefined" ? "light" : getCurrentTheme()
  );
  const langRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const current = getCurrentTheme();
    setThemeState(current);
    document.documentElement.setAttribute("data-theme", current);
  }, []);

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!langRef.current) return;
      if (!langRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
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
      className={pathname === href || pathname.startsWith(href + "/") ? "active" : ""}
    >
      {t(dict, k)}
    </Link>
  );

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setThemeState(next);
    setTheme(next);
  }

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
          <Image src="/favicon.ico" alt="" width={28} height={28} style={{ borderRadius: 6 }} />
        </Link>

        <nav className="nav">
          <NavItem href="/"         k="ui.nav.home" />
          <NavItem href="/result"   k="ui.nav.result" />
          <NavItem href="/compare"  k="ui.nav.compare" />
          <NavItem href="/articles" k="ui.nav.articles" />
          <NavItem href="/about"    k="ui.nav.about" />
        </nav>
      </div>

      {/* Right: theme toggle + language */}
      <div className="row" style={{ gap: 10 }}>
        {/* Theme toggle */}
        <button
          type="button"
          className="theme-toggle"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Light mode" : "Dark mode"}
          aria-pressed={theme === "dark"}
          onClick={toggleTheme}
        >
          <span className="toggle-track" aria-hidden>
            <span className={`toggle-thumb ${theme === "dark" ? "is-right" : "is-left"}`} />
          </span>
          <span className="toggle-icons" aria-hidden>
            <svg className={`icon ${theme === "dark" ? "" : "icon-active"}`} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.76 4.84 5.34 3.42 3.92 4.84l1.42 1.42 1.42-1.42Zm10.48 0 1.42-1.42 1.42 1.42-1.42 1.42-1.42-1.42ZM12 2h0v2h0V2Zm0 18h0v2h0v-2ZM4 12H2v0h2v0Zm18 0h2v0h-2v0ZM6.76 19.16l-1.42 1.42-1.42-1.42 1.42-1.42 1.42 1.42Zm10.48 0 1.42 1.42 1.42-1.42-1.42-1.42-1.42 1.42ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z" />
            </svg>
            <svg className={`icon ${theme === "dark" ? "icon-active" : ""}`} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79Z" />
            </svg>
          </span>
        </button>

        {/* Language */}
        <div ref={langRef} className="lang-wrap">
          <button
            type="button"
            className="lang-btn"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="flag" aria-hidden>{current.flag}</span>
            <span className="lang-label">{current.label}</span>
            <span className="caret" aria-hidden>▾</span>
          </button>

          {menuOpen && (
            <div className="lang-menu" role="menu">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  role="menuitemradio"
                  aria-checked={lang === l.code}
                  className={`lang-item ${lang === l.code ? "active" : ""}`}
                  onClick={() => { setLang(l.code as any); setMenuOpen(false); }}
                >
                  <span className="flag" aria-hidden>{l.flag}</span>
                  <span className="lang-label">{l.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .lang-wrap { position: relative; }

        /* ✅ Fix: sørg for riktig tekstfarge i begge tema */
        .lang-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--card);
          box-shadow: var(--shadow);
          font: inherit;
          color: var(--text);           /* <- ny */
        }
        .lang-btn .lang-label { color: var(--text); }  /* <- ny, ekstra sikkerhet */
        .lang-btn .caret { color: var(--muted); }

        .flag { font-size: 1rem; line-height: 1; }
        .lang-label { font-size: 0.95rem; }

        .lang-menu {
          position: absolute;
          right: 0;
          top: calc(100% + 6px);
          min-width: 160px;
          background: var(--card);
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
          color: var(--text);           /* <- sikrer kontrast i begge tema */
        }
        .lang-item:hover { background: var(--primary-weak); }
        .lang-item.active {
          background: var(--primary-weak);
          outline: 1px solid var(--primary);
          color: var(--text);          /* <- behold kontrast når valgt */
        }

        /* Theme toggle */
        .theme-toggle {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--card);
          box-shadow: var(--shadow);
          font: inherit;
        }
        .toggle-track {
          position: relative;
          width: 36px;
          height: 20px;
          background: rgba(0,0,0,0.06);
          border-radius: 999px;
          border: 1px solid var(--border);
        }
        [data-theme="dark"] .toggle-track { background: rgba(255,255,255,0.08); }
        .toggle-thumb {
          position: absolute;
          top: 50%;
          width: 14px;
          height: 14px;
          transform: translateY(-50%);
          border-radius: 999px;
          background: var(--card);
          border: 1px solid var(--border);
          box-shadow: var(--shadow);
          transition: left .15s ease;
        }
        .toggle-thumb.is-left { left: 3px; }
        .toggle-thumb.is-right { left: 19px; }

        .toggle-icons { display: inline-flex; gap: 8px; align-items: center; color: var(--muted); }
        .icon { opacity: .6; }
        .icon-active { opacity: 1; color: var(--text); }

        .theme-toggle:hover, .lang-btn:hover {
          transform: translateY(-1px);
          transition: transform .06s ease;
        }
      `}</style>
    </header>
  );
}
