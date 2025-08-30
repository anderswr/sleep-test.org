// components/SiteFooter.tsx
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>© {new Date().getFullYear()} DMZ DATA AS</div>
        <nav className="footer-nav">
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="#contact">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
