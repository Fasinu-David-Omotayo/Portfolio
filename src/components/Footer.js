export default function Footer({ name }) {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-left">
          <span>© {year} {name || 'Fasinu David Omotayo'}</span>
          <a href="/admin" className="footer-admin-link" aria-label="Studio login" title="Studio login">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="11" width="14" height="10" rx="1" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </a>
        </div>
        <div className="footer-right">
          <a href="#home">Back to top</a>
        </div>
      </div>
    </footer>
  );
}
