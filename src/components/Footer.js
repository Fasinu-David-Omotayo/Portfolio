export default function Footer({ name, content }) {
  const year = new Date().getFullYear();
  const links = [
    content?.githubUrl && { label: 'GitHub', href: content.githubUrl },
    content?.linkedinUrl && { label: 'LinkedIn', href: content.linkedinUrl },
    content?.contactEmail && { label: 'Email', href: `mailto:${content.contactEmail}` },
  ].filter(Boolean);

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-left">
          <span>&copy; {year} {name || 'Fasinu David Omotayo'}</span>
        </div>
        <div className="footer-right">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              {...(l.label === 'Email' ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
            >
              {l.label}
            </a>
          ))}
          <a href="#home">Back to top</a>
        </div>
      </div>
    </footer>
  );
}