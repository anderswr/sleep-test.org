export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>© {new Date().getFullYear()} Sleep Test</div>
        <nav className="footer-nav">
          <a href="/legal">Privacy · Terms · Contact</a>
        </nav>
      </div>
    </footer>
  );
}
