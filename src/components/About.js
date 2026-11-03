'use client';
import { motion } from 'framer-motion';

export default function About({ content }) {
  return (
    <section className="about" id="about">
      <div className="container about-inner">
        <motion.div
          className="about-portrait"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.2, 0.7, 0.3, 1] }}
        >
          {content?.aboutImageUrl ? (
            <>
              <img className="photo-img" src={content.aboutImageUrl} alt={`Portrait of ${content.heroName || 'Fasinu David Omotayo'}`} />
              {content?.aboutArtImageUrl && (
                <img className="art-img" src={content.aboutArtImageUrl} alt={`${content.heroName || 'Portrait'}, illustrated version`} />
              )}
            </>
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
              Portrait coming soon
            </div>
          )}
        </motion.div>

        <motion.div
          className="about-right"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.2, 0.7, 0.3, 1] }}
        >
          <span className="section-num">02 / About</span>
          <h2>
            {content?.aboutHeadingLine1 || 'The short version:'}
            <br />
            {content?.aboutHeadingLine2 || 'builder, designer, analyst.'}
          </h2>
          <p>
            {content?.aboutParagraph1 ||
              "I am Fasinu David Omotayo, a software developer, data analyst and designer based in Lagos."}
          </p>
          {content?.aboutParagraph2 && <p>{content.aboutParagraph2}</p>}
          {content?.aboutParagraph3 && <p>{content.aboutParagraph3}</p>}
        </motion.div>
      </div>
    </section>
  );
}