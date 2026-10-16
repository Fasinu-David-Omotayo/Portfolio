'use client';
import { useEffect, useRef, useState } from 'react';

const TYPE_MS = 55;
const DELETE_MS = 32;
const PAUSE_MS = 1500;

function useTypewriter(words) {
  const [text, setText] = useState(words[0] || '');
  const [reduced, setReduced] = useState(false);
  const stateRef = useRef({ wordIndex: 0, charIndex: words[0]?.length || 0, phase: 'pausing' });

  useEffect(() => {
    try {
      setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch {}
  }, []);

  useEffect(() => {
    if (reduced || words.length < 2) return;

    let timer;
    const tick = () => {
      const s = stateRef.current;
      const word = words[s.wordIndex];

      if (s.phase === 'typing') {
        s.charIndex += 1;
        setText(word.slice(0, s.charIndex));
        if (s.charIndex >= word.length) {
          s.phase = 'pausing';
          timer = setTimeout(tick, PAUSE_MS);
          return;
        }
        timer = setTimeout(tick, TYPE_MS);
      } else if (s.phase === 'pausing') {
        s.phase = 'deleting';
        timer = setTimeout(tick, DELETE_MS);
      } else if (s.phase === 'deleting') {
        s.charIndex -= 1;
        setText(word.slice(0, s.charIndex));
        if (s.charIndex <= 0) {
          s.wordIndex = (s.wordIndex + 1) % words.length;
          s.phase = 'typing';
          timer = setTimeout(tick, TYPE_MS);
          return;
        }
        timer = setTimeout(tick, DELETE_MS);
      }
    };

    timer = setTimeout(tick, PAUSE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, words.join('|')]);

  return reduced ? words[0] || '' : text;
}

function useReserveRoleWidth(roles, wrapRef, textRef) {
  useEffect(() => {
    if (!wrapRef.current || !textRef.current) return;
    const probe = document.createElement('span');
    probe.style.visibility = 'hidden';
    probe.style.position = 'absolute';
    probe.style.whiteSpace = 'nowrap';
    probe.style.font = window.getComputedStyle(textRef.current).font;
    document.body.appendChild(probe);
    let max = 0;
    roles.forEach((r) => {
      probe.textContent = r;
      max = Math.max(max, probe.offsetWidth);
    });
    document.body.removeChild(probe);
    wrapRef.current.style.minWidth = max + 'px';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roles.join('|')]);
}

export default function Hero({ content, skills = [] }) {
  const roles = (content?.heroRoles || 'Software Developer,Graphic Designer,Data Analyst')
    .split(',')
    .map((r) => r.trim())
    .filter(Boolean);
  const typed = useTypewriter(roles);
  const roleWrapRef = useRef(null);
  const roleTextRef = useRef(null);
  useReserveRoleWidth(roles, roleWrapRef, roleTextRef);

  const stats = [
    { num: `${content?.heroStatProjects ?? 20}+`, lbl: 'projects shipped' },
    { num: `${content?.heroStatYears ?? 2}+`, lbl: 'years building' },
    { num: `${content?.heroStatClients ?? 10}+`, lbl: 'clients served' },
    { num: `${roles.length || 3}`, lbl: 'disciplines, one standard' },
  ];

  const techNames = skills.map((s) => s.name).filter(Boolean);
  const socials = [
    content?.githubUrl && { label: 'GitHub', href: content.githubUrl, icon: 'github' },
    content?.linkedinUrl && { label: 'LinkedIn', href: content.linkedinUrl, icon: 'linkedin' },
    content?.contactEmail && { label: 'Email', href: `mailto:${content.contactEmail}`, icon: 'email' },
  ].filter(Boolean);

  return (
    <section className="hero" id="home">
      <div className="container hero-inner">
        <div className="hero-text">
          <p className="hero-greet">Hi, I&apos;m <span>{content?.heroName || 'Fasinu David Omotayo'}</span></p>
          <h1>
            I&apos;m a{' '}
            <span className="role-cycle" ref={roleWrapRef}>
              <span ref={roleTextRef}>{typed}</span>
              <span className="type-cursor" aria-hidden="true" />
            </span>
          </h1>

          <p className="hero-sub">
            {content?.heroSubtext ||
              "I write production software, design brand identities, and turn raw data into decisions worth acting on — three disciplines, one standard: done properly, not performed."}
          </p>

          <div className="hero-cta">
            <a href="#work" className="btn-primary">View Work</a>
            <a href="#contact" className="btn-ghost">Get In Touch</a>
            {content?.cvUrl && (
              <a href={content.cvUrl} className="btn-ghost" target="_blank" rel="noopener noreferrer" download>
                ↓ Download CV
              </a>
            )}
          </div>

          {socials.length > 0 && (
            <div className="hero-social">
              {socials.map((s) => (
                <a key={s.label} href={s.href} aria-label={s.label} target={s.icon === 'email' ? undefined : '_blank'} rel="noopener noreferrer">
                  {s.icon === 'github' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.1.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.3 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/></svg>
                  )}
                  {s.icon === 'linkedin' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.64h.05c.53-1 1.82-2.05 3.75-2.05 4.01 0 4.75 2.64 4.75 6.08V21h-4v-5.6c0-1.34-.02-3.06-1.86-3.06-1.87 0-2.16 1.46-2.16 2.96V21h-4V9Z"/></svg>
                  )}
                  {s.icon === 'email' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3 7 9 6 9-6"/></svg>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="hero-portrait">
          <div className="portrait-frame">
            {content?.heroPhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={content.heroPhotoUrl} alt={content?.heroName || 'Fasinu David Omotayo'} />
            ) : (
              <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">
                <rect width="400" height="500" fill="var(--card-ph)" />
                <circle cx="200" cy="190" r="64" fill="none" stroke="var(--accent)" strokeWidth="2" />
                <path d="M100 430c14-72 70-116 100-116s86 44 100 116" fill="none" stroke="var(--accent)" strokeWidth="2" />
              </svg>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        <div className="hero-stats">
          {stats.map((s) => (
            <div className="hero-stat" key={s.lbl}>
              <span className="num">{s.num}</span>
              <span className="lbl">{s.lbl}</span>
            </div>
          ))}
        </div>
      </div>

      {techNames.length > 0 && (
        <div className="tech-ticker">
          <div className="tech-ticker-track">
            {[0, 1].map((copy) => (
              <div className="tech-ticker-set" key={copy} aria-hidden={copy === 1}>
                {techNames.map((name, i) => (
                  <span key={`${copy}-${name}-${i}`}>
                    {name}
                    <span className="dot-sep">·</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
