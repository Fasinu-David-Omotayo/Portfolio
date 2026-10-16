'use client';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const LINKS = [
  { href: '#work', label: 'Work' },
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#testimonials', label: 'Reviews' },
  { href: '#contact', label: 'Contact' },
];

const SECTION_IDS = ['home', 'work', 'about', 'skills', 'testimonials', 'contact'];

export default function Nav({ name, logoUrl }) {
  const [open, setOpen] = useState(false);
  const [light, setLight] = useState(false);
  const [activeId, setActiveId] = useState('home');
  const navRef = useRef(null);

  useEffect(() => {
    try {
      setLight(document.documentElement.classList.contains('light'));
    } catch {}
  }, []);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Nav is `position: fixed`, so page content needs a top padding equal to
  // its real rendered height (not a guessed constant) or it'll sit under
  // it. Re-measure on resize, since the height can change (e.g. wrapping
  // at narrow widths). Also exposed as a CSS var so in-page anchor jumps
  // (scroll-padding-top) land in the right place too.
  useEffect(() => {
    const navEl = navRef.current;
    if (!navEl) return;

    function syncNavHeight() {
      const h = navEl.offsetHeight;
      document.body.style.paddingTop = h + 'px';
      document.documentElement.style.setProperty('--nav-h', h + 'px');
    }
    syncNavHeight();

    window.addEventListener('resize', syncNavHeight);
    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(syncNavHeight);
      ro.observe(navEl);
    }
    return () => {
      window.removeEventListener('resize', syncNavHeight);
      if (ro) ro.disconnect();
    };
  }, []);

  // ---- scroll-spy: deterministic position check, rAF-throttled ----
  // Compares each section's offsetTop against scrollY + nav height + a
  // small offset, and takes the LAST section whose top has been passed.
  // Deliberately not an IntersectionObserver with a narrow rootMargin band
  // - a band can be narrower than a short section and get skipped entirely
  // on a fast scroll/drag; this check can't miss a section.
  useEffect(() => {
    const sections = SECTION_IDS
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (sections.length === 0) return;

    let ticking = false;
    function computeActive() {
      const navH = navRef.current ? navRef.current.offsetHeight : 0;
      const probe = window.scrollY + navH + 60;
      let current = sections[0];
      for (let i = 0; i < sections.length; i++) {
        if (sections[i].offsetTop <= probe) current = sections[i];
      }
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) current = sections[sections.length - 1];
      setActiveId(current.id);
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        computeActive();
        ticking = false;
      });
    }

    computeActive(); // set correct state on initial mount, not just on first scroll
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  function toggleTheme() {
    const next = !light;
    setLight(next);
    try {
      document.documentElement.classList.toggle('light', next);
      localStorage.setItem('theme', next ? 'light' : 'dark');
    } catch {}
  }

  const initials = (name || 'FD')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <>
      <nav className="site-nav" ref={navRef}>
        <div className="container nav-inner">
          <a href="#home" className="brand">
            <span className="brand-mark">
              {logoUrl ? <img src={logoUrl} alt="" /> : initials}
            </span>
            {name || 'Fasinu'}
            <span>.</span>
          </a>

          <ul className="nav-links">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className={activeId === l.href.slice(1) ? 'active' : ''}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="nav-right">
            <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme" title="Toggle theme">
              {light ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66 4.93 19.07M19.07 4.93l-1.41 1.41" />
                </svg>
              )}
            </button>
            <a href="#contact" className="btn-primary nav-cta-desktop">Start a project</a>
            <button className="nav-menu-btn" onClick={() => setOpen(true)} aria-label="Open menu">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="nav-mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="nav-mobile-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.2, 0.7, 0.3, 1] }}
            >
              <div className="nav-mobile-top">
                <span className="brand">
                  <span className="brand-mark">{logoUrl ? <img src={logoUrl} alt="" /> : initials}</span>
                  {name || 'Fasinu'}<span>.</span>
                </span>
                <button className="nav-mobile-close" onClick={() => setOpen(false)} aria-label="Close menu">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <ul className="nav-mobile-links">
                {LINKS.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      className={activeId === l.href.slice(1) ? 'active' : ''}
                      onClick={() => setOpen(false)}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
              <a href="#contact" className="btn-primary nav-mobile-cta" onClick={() => setOpen(false)}>
                Start a project
              </a>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
