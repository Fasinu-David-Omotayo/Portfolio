'use client';
import { motion } from 'framer-motion';

export default function Testimonials({ testimonials = [] }) {
  if (testimonials.length === 0) return null;

  return (
    <section className="testimonials" id="testimonials">
      <div className="container">
        <div className="section-head">
          <span className="section-num">04 — What people say</span>
          <h2 className="section-title">Clients and collaborators</h2>
          <p>A few words from people I&apos;ve built, designed, or analyzed something for.</p>
        </div>

        <div className="testimonial-grid">
          {testimonials.map((t, i) => (
            <motion.div
              className="testimonial-card"
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: Math.min(i, 2) * 0.08, ease: [0.2, 0.7, 0.3, 1] }}
            >
              <p>&ldquo;{t.quote}&rdquo;</p>
              <div className="testimonial-author">
                <span className="t-name">{t.name}</span>
                <span className="t-role">{t.role}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
