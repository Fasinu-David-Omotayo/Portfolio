'use client';
import { motion, AnimatePresence } from 'framer-motion';

// A small, non-blocking notification - used instead of alert() for things
// like "copied to clipboard" that don't need a decision from the admin.
export default function Toast({ message, show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0.2, 0.7, 0.3, 1] }}
          style={{
            position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
            background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)',
            padding: '12px 20px', fontFamily: "'JetBrains Mono', monospace", fontSize: '12.5px',
            letterSpacing: '.03em', zIndex: 500, boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
