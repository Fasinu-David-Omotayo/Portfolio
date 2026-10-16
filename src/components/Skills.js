'use client';
import { motion } from 'framer-motion';

export default function Skills({ skills }) {
  const grouped = {};
  for (const s of skills) {
    if (!grouped[s.category]) grouped[s.category] = [];
    grouped[s.category].push(s);
  }
  const categories = Object.keys(grouped);

  return (
    <section className="skills" id="skills">
      <div className="container">
        <div className="section-head">
          <span className="section-num">03 — Skills</span>
          <h2 className="section-title">What I work with</h2>
          <p>The languages, tools, and software I reach for most, grouped by discipline.</p>
        </div>

        {categories.length === 0 ? (
          <div className="empty-state">Skills coming soon.</div>
        ) : (
          <div className="skills-grid">
            {categories.map((cat, i) => (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: Math.min(i, 3) * 0.07, ease: [0.2, 0.7, 0.3, 1] }}
              >
                <div className="skill-cat-label">{cat}</div>
                <ul className="skill-list">
                  {grouped[cat].map((s) => (
                    <li key={s.id}>{s.name}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
