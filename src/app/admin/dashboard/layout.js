'use client';
import { useState } from 'react';
import Sidebar from '@/components/admin/Sidebar';

export default function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="admin-shell">
      <div className="admin-mobile-topbar">
        <span className="sb-brand">FASINU<span>.</span></span>
        <button className="admin-mobile-menu-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </div>

      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <main className="admin-main">{children}</main>
    </div>
  );
}
