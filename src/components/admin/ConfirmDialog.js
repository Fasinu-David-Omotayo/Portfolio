'use client';
import { motion, AnimatePresence } from 'framer-motion';

// Controlled confirm dialog - replaces window.confirm() with something that
// actually matches the site's design instead of a jarring OS-native popup.
//
// Usage:
//   const [pending, setPending] = useState(null);
//   <ConfirmDialog
//     open={!!pending}
//     title="Delete this work?"
//     message={`"${pending?.title}" will be permanently removed.`}
//     confirmLabel="Delete"
//     danger
//     onCancel={() => setPending(null)}
//     onConfirm={() => { doDelete(pending); setPending(null); }}
//   />
export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-overlay active"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onCancel}
        >
          <motion.div
            className="modal"
            style={{ width: '380px' }}
            initial={{ opacity: 0, scale: 0.92, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.25, ease: [0.2, 0.7, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{title}</h3>
            {message && (
              <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '8px' }}>
                {message}
              </p>
            )}
            <div className="modal-actions">
              <button onClick={onCancel}>{cancelLabel}</button>
              <motion.button
                className="save-btn"
                style={danger ? { background: 'var(--danger)', borderColor: 'var(--danger)', color: '#fff' } : undefined}
                onClick={onConfirm}
                whileTap={{ scale: 0.96 }}
              >
                {confirmLabel}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
