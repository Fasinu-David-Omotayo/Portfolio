'use client';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CATEGORIES, CATEGORY_LABELS } from '@/lib/categories';

const TYPE_FILTERS = [
  { value: 'all', label: 'All work' },
  { value: 'dev', label: 'Software development' },
  { value: 'design', label: 'Graphic design' },
  { value: 'data', label: 'Data analysis' },
];

const TYPE_LABEL = { dev: 'Development', design: 'Design', data: 'Data' };

// Matches the grid's `grid-auto-rows: 1px` in globals.css - each card is
// given an explicit row-span (in 1px units + gap) equal to its own
// rendered height, which is what actually produces the masonry effect.
// Without this the grid has no idea how tall any card is and every card
// would be clipped to a single 1px row.
const ROW_GAP = 28;

function trackFilter(type) {
  fetch('/api/activity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'filter_click', meta: { type } }),
  }).catch(() => {});
}

function useMasonry(items) {
  const gridRef = useRef(null);
  const cardRefs = useRef(new Map());

  const relayout = useRef(() => {
    const grid = gridRef.current;
    if (!grid) return;
    for (const el of cardRefs.current.values()) {
      if (!el) continue;
      const h = el.getBoundingClientRect().height;
      const span = Math.ceil((h + ROW_GAP) / (1 + ROW_GAP));
      el.style.gridRowEnd = `span ${span}`;
    }
  });

  useLayoutEffect(() => {
    relayout.current();
  }, [items]);

  useEffect(() => {
    const onResize = () => relayout.current();
    window.addEventListener('resize', onResize);

    // Images load async and change card height after the initial layout
    // pass - re-measure once each has finished loading.
    const imgs = gridRef.current ? gridRef.current.querySelectorAll('img') : [];
    imgs.forEach((img) => {
      if (!img.complete) img.addEventListener('load', onResize, { once: true });
    });

    let ro;
    if (typeof ResizeObserver !== 'undefined' && gridRef.current) {
      ro = new ResizeObserver(onResize);
      ro.observe(gridRef.current);
    }

    return () => {
      window.removeEventListener('resize', onResize);
      imgs.forEach((img) => img.removeEventListener('load', onResize));
      if (ro) ro.disconnect();
    };
  }, [items]);

  function setCardRef(id) {
    return (el) => {
      if (el) cardRefs.current.set(id, el);
      else cardRefs.current.delete(id);
    };
  }

  return { gridRef, setCardRef };
}

export default function Portfolio({ works }) {
  const [typeFilter, setTypeFilter] = useState('all');
  const [subFilter, setSubFilter] = useState('all');
  const [active, setActive] = useState(null); // active work in lightbox
  const [slide, setSlide] = useState(0);
  // The lightbox is portaled straight to <body> (see the render below) so
  // it's never a DOM descendant of this section - .portfolio has
  // `content-visibility: auto` for scroll performance, and that property
  // quietly turns a section into a "containing block" for any
  // position:fixed element inside it. Left in place, the lightbox would
  // be positioned relative to this section's box instead of the actual
  // screen, which is exactly why it used to land in the wrong spot
  // depending on how far down the page you'd scrolled before opening it.
  // createPortal needs `document`, which doesn't exist during server
  // rendering, so it only portals once mounted in the browser.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const filtered = useMemo(() => {
    let list = works;
    if (typeFilter !== 'all') list = list.filter((w) => w.type === typeFilter);
    if (typeFilter === 'design' && subFilter !== 'all') {
      list = list.filter((w) => w.subCategory === subFilter);
    }
    return list;
  }, [works, typeFilter, subFilter]);

  const { gridRef, setCardRef } = useMasonry(filtered);

  function selectType(value) {
    setTypeFilter(value);
    setSubFilter('all');
    trackFilter(value);
  }

  function selectSub(value) {
    setSubFilter(value);
    trackFilter(value === 'all' ? 'design' : value);
  }

  function openWork(work) {
    setActive(work);
    setSlide(0);
  }

  function closeLightbox() {
    setActive(null);
  }

  const gallery = active
    ? [{ imageUrl: active.imageUrl }, ...(active.images || [])]
    : [];

  function next() {
    setSlide((s) => (s + 1) % gallery.length);
  }
  function prev() {
    setSlide((s) => (s - 1 + gallery.length) % gallery.length);
  }

  useEffect(() => {
    document.body.style.overflow = active ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [active]);

  useEffect(() => {
    if (!active) return;
    function onKey(e) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, gallery.length]);

  const techTags = (work) =>
    (work.techStack || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

  const caseStudy = active
    ? [
        active.problem && { label: 'Problem', text: active.problem },
        active.approach && { label: 'Approach', text: active.approach },
        active.result && { label: 'Result', text: active.result },
      ].filter(Boolean)
    : [];

  return (
    <section className="portfolio" id="work">
      <div className="container">
      <div className="section-head">
        <span className="section-num">01 — Selected work</span>
        <h2 className="section-title">Things I&apos;ve built, designed, and analyzed</h2>
        <p>A mix of shipped software, brand and design work, and data projects — filter by discipline below.</p>
      </div>

      <div className="filters-primary">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.value}
            className={`filter-btn${typeFilter === f.value ? ' active' : ''}`}
            onClick={() => selectType(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {typeFilter === 'design' && (
          <motion.div
            className="filters-secondary"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <button
              className={`filter-btn sub${subFilter === 'all' ? ' active' : ''}`}
              onClick={() => selectSub('all')}
            >
              All design
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                className={`filter-btn sub${subFilter === c.value ? ' active' : ''}`}
                onClick={() => selectSub(c.value)}
              >
                {c.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {filtered.length === 0 ? (
        <div className="empty-state">No work in this category yet — check back soon.</div>
      ) : (
        <div className="grid" ref={gridRef}>
          {filtered.map((work) => (
            <motion.div
              className="card"
              key={work.id}
              ref={setCardRef(work.id)}
              onClick={() => openWork(work)}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, ease: [0.2, 0.7, 0.3, 1] }}
            >
              <div className="card-media" style={{ aspectRatio: work.type === 'design' ? '3/4' : '16/10' }}>
                <img src={work.thumbUrl || work.imageUrl} alt={work.title} loading="lazy" decoding="async" />
                <span className="card-type-badge">{TYPE_LABEL[work.type]}</span>
                {work.images?.length > 0 && (
                  <span className="card-image-count">+{work.images.length}</span>
                )}
              </div>
              <div className="card-info">
                <h4>{work.title}</h4>

                {work.type === 'design' && work.subCategory && (
                  <p className="card-tag">{CATEGORY_LABELS[work.subCategory] || work.subCategory}</p>
                )}

                {(work.type === 'dev' || work.type === 'data') && techTags(work).length > 0 && (
                  <div className="card-tags">
                    {techTags(work).map((t) => (
                      <span className="tech-tag" key={t}>{t}</span>
                    ))}
                  </div>
                )}

                {(work.liveUrl || work.githubUrl) && (
                  <div className="card-links">
                    {work.liveUrl && (
                      <a href={work.liveUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                        {work.type === 'data' ? 'Visit live' : 'Live demo'}
                      </a>
                    )}
                    {work.githubUrl && (
                      <a href={work.githubUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                        Source
                      </a>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
      </div>

      {mounted && createPortal(
      <AnimatePresence>
        {active && (
          <motion.div
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            <button className="lightbox-close" onClick={closeLightbox} aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
              <div className="lightbox-media">
                <img src={gallery[slide]?.imageUrl} alt={active.title} />
              </div>

              {gallery.length > 1 && (
                <div className="lightbox-nav">
                  <button className="lb-arrow" onClick={prev} aria-label="Previous image">‹</button>
                  <span className="lb-count">{slide + 1} / {gallery.length}</span>
                  <button className="lb-arrow" onClick={next} aria-label="Next image">›</button>
                </div>
              )}

              <h3 className="lightbox-title">{active.title}</h3>
              {active.description && <p className="lightbox-desc">{active.description}</p>}

              {(techTags(active).length > 0 || active.liveUrl || active.githubUrl) && (
                <div className="lightbox-meta">
                  {techTags(active).map((t) => (
                    <span className="tech-tag" key={t} style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.25)' }}>{t}</span>
                  ))}
                  {active.liveUrl && (
                    <a href={active.liveUrl} target="_blank" rel="noopener noreferrer">
                      {active.type === 'data' ? 'Visit live' : 'View live'}
                    </a>
                  )}
                  {active.githubUrl && (
                    <a href={active.githubUrl} target="_blank" rel="noopener noreferrer">
                      View source
                    </a>
                  )}
                </div>
              )}

              {caseStudy.length > 0 && (
                <div className="case-study">
                  {caseStudy.map((row) => (
                    <div className="case-study-row" key={row.label}>
                      <span className="case-label">{row.label}</span>
                      <p>{row.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
      )}
    </section>
  );
}