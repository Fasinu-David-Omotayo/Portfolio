'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { safeJson } from '@/lib/apiClient';
import ConfirmDialog from './ConfirmDialog';
import Toast from './Toast';

const EMPTY = { name: '', role: '', quote: '' };

export default function TestimonialsManager({ initialTestimonials }) {
  const [items, setItems] = useState(initialTestimonials);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  }

  function openAdd() {
    setEditing(null);
    setForm(EMPTY);
    setError('');
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({ name: item.name, role: item.role, quote: item.quote });
    setError('');
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim() || !form.quote.trim()) {
      setError('Name, role, and quote are all required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const url = editing ? `/api/testimonials/${editing.id}` : '/api/testimonials';
      const res = await fetch(url, {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await safeJson(res);
      if (!res.ok) {
        setError(data.error || 'Could not save that testimonial.');
        return;
      }
      if (editing) {
        setItems((list) => list.map((t) => (t.id === data.id ? data : t)));
      } else {
        setItems((list) => [...list, data]);
      }
      setModalOpen(false);
      showToast(editing ? 'Testimonial updated.' : 'Testimonial added.');
    } catch {
      setError('Could not reach the server.');
    } finally {
      setSaving(false);
    }
  }

  function requestDelete(item) {
    setPendingDelete(item);
  }

  async function confirmDelete() {
    const item = pendingDelete;
    setPendingDelete(null);
    if (!item) return;
    setItems((list) => list.filter((t) => t.id !== item.id));
    await fetch(`/api/testimonials/${item.id}`, { method: 'DELETE' }).catch(() => {});
    showToast('Testimonial removed.');
  }

  async function move(item, direction) {
    const sorted = [...items].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((t) => t.id === item.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const other = sorted[swapIdx];
    const a = { ...item, order: other.order };
    const b = { ...other, order: item.order };
    setItems((list) => list.map((t) => (t.id === a.id ? a : t.id === b.id ? b : t)));

    await Promise.all([
      fetch(`/api/testimonials/${a.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: a.order }),
      }),
      fetch(`/api/testimonials/${b.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: b.order }),
      }),
    ]).catch(() => {});
  }

  const sorted = [...items].sort((a, b) => a.order - b.order);

  return (
    <div className="panel settings-panel">
      <div className="works-toolbar" style={{ marginBottom: 20 }}>
        <span style={{ color: 'var(--muted)', fontSize: 13.5 }}>
          Shown in the Testimonials section of the public site, in this order.
        </span>
        <button type="button" className="add-btn" onClick={openAdd}>+ Add testimonial</button>
      </div>

      {sorted.length === 0 ? (
        <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>No testimonials yet — add your first one above.</p>
      ) : (
        <div className="testimonial-admin-list">
          {sorted.map((t, i) => (
            <div className="testimonial-admin-row" key={t.id}>
              <div className="t-body">
                <p className="t-quote">&ldquo;{t.quote}&rdquo;</p>
                <span className="t-meta">{t.name} — {t.role}</span>
              </div>
              <div className="testimonial-admin-actions">
                <button type="button" onClick={() => move(t, 'up')} disabled={i === 0} aria-label="Move up">↑</button>
                <button type="button" onClick={() => move(t, 'down')} disabled={i === sorted.length - 1} aria-label="Move down">↓</button>
                <button type="button" onClick={() => openEdit(t)}>Edit</button>
                <button type="button" className="del" onClick={() => requestDelete(t)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="modal-overlay active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeModal}
          >
            <motion.form
              className="modal"
              onSubmit={submit}
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.25, ease: [0.2, 0.7, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>{editing ? 'Edit testimonial' : 'Add testimonial'}</h3>

              <div className="mgroup">
                <label>Name</label>
                <input value={form.name} onChange={(e) => set('name', e.target.value)} maxLength={80} />
              </div>
              <div className="mgroup">
                <label>Role / company</label>
                <input value={form.role} onChange={(e) => set('role', e.target.value)} maxLength={120} placeholder="e.g. Founder, Studio X" />
              </div>
              <div className="mgroup">
                <label>Quote</label>
                <textarea value={form.quote} onChange={(e) => set('quote', e.target.value)} maxLength={600} rows={4} />
              </div>

              {error && <p className="inline-msg err">{error}</p>}

              <div className="modal-actions">
                <button type="button" onClick={closeModal}>Cancel</button>
                <button type="submit" className="save-btn" disabled={saving}>
                  {saving ? 'Saving…' : editing ? 'Save changes' : 'Add testimonial'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this testimonial?"
        message={pendingDelete ? `The quote from "${pendingDelete.name}" will be permanently removed.` : ''}
        confirmLabel="Delete"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />

      <Toast message={toast} show={!!toast} />
    </div>
  );
}
