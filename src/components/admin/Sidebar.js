'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV = [
  { href: '/admin/dashboard', label: 'Overview', icon: 'grid' },
  { href: '/admin/dashboard/works', label: 'Works', icon: 'layers' },
  { href: '/admin/dashboard/content', label: 'Site Content', icon: 'edit' },
  { href: '/admin/dashboard/skills', label: 'Skills', icon: 'star' },
  { href: '/admin/dashboard/testimonials', label: 'Testimonials', icon: 'quote' },
  { href: '/admin/dashboard/messages', label: 'Messages', icon: 'mail' },
  { href: '/admin/dashboard/activity', label: 'Activity', icon: 'clock' },
  { href: '/admin/dashboard/settings', label: 'Settings', icon: 'settings' },
];

function Icon({ name }) {
  const common = { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 };
  switch (name) {
    case 'grid':
      return <svg {...common}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>;
    case 'layers':
      return <svg {...common}><path d="M12 2 2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>;
    case 'edit':
      return <svg {...common}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>;
    case 'star':
      return <svg {...common}><path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21.1 7 14.2 2 9.3l6.9-1L12 2z" /></svg>;
    case 'mail':
      return <svg {...common}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 7l10 6 10-6" /></svg>;
    case 'quote':
      return <svg {...common}><path d="M7 7h4v6a4 4 0 0 1-4 4H6" /><path d="M15 7h4v6a4 4 0 0 1-4 4h-1" /></svg>;
    case 'clock':
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>;
    case 'settings':
      return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
    default:
      return null;
  }
}

function NavLinks({ pathname, onNavigate }) {
  return (
    <ul className="sb-nav">
      {NAV.map((item) => {
        const isActive = item.href === '/admin/dashboard'
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <li key={item.href}>
            <Link href={item.href} className={isActive ? 'active' : ''} onClick={onNavigate}>
              <Icon name={item.icon} />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    router.push('/admin');
    router.refresh();
  }
  return <button className="sb-logout" onClick={logout}>Log Out</button>;
}

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  const pathname = usePathname();

  return (
    <>
      <aside className="sidebar">
        <div className="sb-brand">FASINU<span>.</span></div>
        <div className="sb-role">Studio Admin</div>
        <a href="/" target="_blank" rel="noopener noreferrer" className="sb-view-site">
          View live site
        </a>
        <NavLinks pathname={pathname} />
        <LogoutButton />
      </aside>

      {mobileOpen && (
        <>
          <div className="admin-mobile-backdrop" onClick={onCloseMobile} />
          <aside className="sidebar admin-mobile-drawer" style={{ flexDirection: 'column' }}>
            <button className="admin-mobile-close" onClick={onCloseMobile} aria-label="Close menu">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
            <div className="sb-brand">FASINU<span>.</span></div>
            <div className="sb-role">Studio Admin</div>
            <a href="/" target="_blank" rel="noopener noreferrer" className="sb-view-site">
              View live site
            </a>
            <NavLinks pathname={pathname} onNavigate={onCloseMobile} />
            <LogoutButton />
          </aside>
        </>
      )}
    </>
  );
}
