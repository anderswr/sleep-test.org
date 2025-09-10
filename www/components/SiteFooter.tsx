"use client";

import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner" style={{ padding: "12px 0" }}>
        <div>© 2025 DMZ DATA AS</div>
        <nav className="footer-nav" style={{ gap: 20 }}>
          <Link href="/about">Privacy</Link>
          <Link href="/about">Terms</Link>
          <Link href="/about">Contact</Link>
        </nav>
      </div>
    </footer>
  );
}
