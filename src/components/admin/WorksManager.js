'use client';
import { useState } from 'react';
import { safeJson } from '@/lib/apiClient';
import { CATEGORIES } from '@/lib/categories';
import ConfirmDialog from './ConfirmDialog';
import Toast from './Toast';

const TYPES = [
  { value: 'dev', label: 'Software Development' },
  { value: 'design', label: 'Graphic Design' },
  { value: 'data', label: 'Data Analysis' },
];

const EMPTY_FORM = {
  id: null,
  title: '',
  type: 'dev',
  subCategory: '',
  description: '',
  techStack: '',
  liveUrl: '',
  githubUrl: '',
  status: 'live',
  featured: false,
  imageUrl: '',
  thumbUrl: '',
  blurDataUrl: '',
  problem: '',
  approach: '',
  result: '',
  images: [],
};

async function uploadFile(file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.error || 'Upload failed.');
  return data;
}

export default function WorksManager({ initialWorks }) {
  const [works, setWorks] = useState(initialWorks);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingSub, setUploadingSub] = useState(false); // false | { done, total }
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2400);
  }

  function openAdd() {
    setForm(EMPTY_FORM);
    setCoverFile(null);
    setCoverPreview('');
    setError('');
    setModalOpen(true);
  }

  function openEdit(work) {
    setForm({
      id: work.id,
      title: work.title,
      type: work.type,
      subCategory: work.subCategory || '',
      description: work.description || '',
      techStack: work.techStack || '',
      liveUrl: work.liveUrl || '',
      githubUrl: work.githubUrl || '',
      status: work.status,
      featured: work.featured,
      imageUrl: work.imageUrl,
      thumbUrl: work.thumbUrl,
      blurDataUrl: work.blurDataUrl || '',
      problem: work.problem || '',
      approach: work.approach || '',
      result: work.result || '',
      images: work.images || [],
    });
    setCoverFile(null);
    setCoverPreview(work.imageUrl);
    setError('');
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
  }

  function onCoverChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      let imageFields = {};
      if (coverFile) {
        const uploaded = await uploadFile(coverFile);
        imageFields = uploaded;
      } else if (!form.id) {
        setError('Please choose a cover image.');
        setSaving(false);
        return;
      }

      const payload = {
        title: form.title,
        type: form.type,
        subCategory: form.type === 'design' ? (form.subCategory || null) : null,
        description: form.description,
        techStack: form.techStack,
        liveUrl: form.liveUrl,
        githubUrl: form.githubUrl,
        status: form.status,
        featured: form.featured,
        problem: form.problem,
        approach: form.approach,
        result: form.result,
        ...imageFields,
      };

      const url = form.id ? `/api/works/${form.id}` : '/api/works';
      const method = form.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await safeJson(res);
      if (!res.ok) {
        setError(data.error || 'Could not save this work.');
        setSaving(false);
        return;
      }

      if (form.id) {
        setWorks((list) => list.map((w) => (w.id === data.id ? { ...data, images: form.images } : w)));
        showToast('Work updated.');
        setModalOpen(false);
      } else {
        // Extra gallery images attach to a work that already exists (they
        // upload to /api/works/[id]/images), so a brand-new work has
        // nowhere to attach them to yet. Rather than close the modal and
        // make the person hunt for an "Edit" button to add more images,
        // drop the freshly-created work's id into the form right away -
        // that flips this same modal into edit mode and reveals the
        // "Additional Images" section below, with no extra step needed.
        setWorks((list) => [{ ...data, images: [] }, ...list]);
        setForm((f) => ({ ...f, id: data.id, imageUrl: data.imageUrl, thumbUrl: data.thumbUrl }));
        setCoverFile(null);
        showToast('Work added — add more images below, then close when you’re done.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  async function uploadSubImage(file) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`/api/works/${form.id}/images`, { method: 'POST', body: fd });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data.error || 'Upload failed.');
    return data;
  }

  // Accepts several files from one file-picker selection (the input below
  // has `multiple`) and uploads them one at a time - the upload route only
  // takes a single file per request, and going one-by-one lets each image
  // land in the gallery and the progress count update as soon as it's
  // done, instead of the person staring at a blank "Uploading..." for
  // everything at once.
  async function onSubImageChange(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !form.id) return;
    setUploadingSub({ done: 0, total: files.length });
    setError('');

    let uploadedCount = 0;
    for (const file of files) {
      try {
        const data = await uploadSubImage(file);
        setForm((f) => ({ ...f, images: [...f.images, data] }));
        setWorks((list) =>
          list.map((w) => (w.id === form.id ? { ...w, images: [...(w.images || []), data] } : w))
        );
        uploadedCount += 1;
      } catch (err) {
        setError(
          files.length > 1
            ? `Stopped after ${uploadedCount} of ${files.length} images: ${err.message || 'upload failed.'}`
            : err.message || 'Could not upload that image.'
        );
        break;
      }
      setUploadingSub((s) => (s ? { done: s.done + 1, total: s.total } : s));
    }

    setUploadingSub(false);
    e.target.value = '';
  }

  async function deleteSubImage(imageId) {
    if (!form.id) return;
    await fetch(`/api/works/${form.id}/images/${imageId}`, { method: 'DELETE' }).catch(() => {});
    setForm((f) => ({ ...f, images: f.images.filter((img) => img.id !== imageId) }));
    setWorks((list) =>
      list.map((w) =>
        w.id === form.id ? { ...w, images: (w.images || []).filter((img) => img.id !== imageId) } : w
      )
    );
  }

  async function confirmDelete() {
    const work = pendingDelete;
    setPendingDelete(null);
    if (!work) return;
    await fetch(`/api/works/${work.id}`, { method: 'DELETE' }).catch(() => {});
    setWorks((list) => list.filter((w) => w.id !== work.id));
    showToast('Work deleted.');
  }

  return (
    <>
      <div className="works-toolbar">
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12.5px', color: 'var(--muted)' }}>
          {works.length} total
        </span>
        <button className="add-btn" onClick={openAdd}>+ Add Work</button>
      </div>

      <div className="panel">
        <div className="works-table-wrap">
          <table className="works-table">
            <thead>
              <tr>
                <th>Work</th>
                <th>Type</th>
                <th>Status</th>
                <th>Images</th>
                <th>Views</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {works.map((work) => (
                <tr key={work.id}>
                  <td data-label="">
                    <div className="work-name-cell">
                      <img className="thumb" src={work.thumbUrl || work.imageUrl} alt="" />
                      <span>{work.title}</span>
                    </div>
                  </td>
                  <td data-label="Type">
                    <span className="cat-badge">
                      {TYPES.find((t) => t.value === work.type)?.label || work.type}
                      {work.subCategory ? ` · ${work.subCategory}` : ''}
                    </span>
                  </td>
                  <td data-label="Status">
                    <span className={`status-badge ${work.status}`}>{work.status}</span>
                  </td>
                  <td data-label="Images">
                    <span className="sub-count-badge">{(work.images?.length || 0) + 1}</span>
                  </td>
                  <td data-label="Views">{work.views}</td>
                  <td data-label="">
                    <div className="row-actions">
                      <button onClick={() => openEdit(work)}>Edit</button>
                      <button className="del" onClick={() => setPendingDelete(work)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {works.length === 0 && (
          <div className="empty-panel">No works yet — add your first one above.</div>
        )}
      </div>

      <div className={`modal-overlay${modalOpen ? ' active' : ''}`} onClick={closeModal}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <h3>{form.id ? 'Edit Work' : 'Add Work'}</h3>
          <form onSubmit={submit}>
            {coverPreview && <img className="upload-preview" src={coverPreview} alt="" />}

            <div className="mgroup">
              <label>Cover Image {form.id ? '(leave empty to keep current)' : ''}</label>
              <input type="file" accept="image/*" onChange={onCoverChange} />
            </div>

            {!form.id && (
              <p className="field-hint" style={{ marginBottom: 16 }}>
                Save this work first — once it&apos;s created, you&apos;ll be able to add extra gallery
                images (screenshots, mockups, other angles) right here in this same window.
              </p>
            )}

            {form.id && (
              <div className="mgroup">
                <label>Additional Images (screenshots, mockups, other angles… — the gallery shown in the lightbox, e.g. for Data Analysis projects)</label>
                {form.images.length > 0 && (
                  <div className="sub-image-grid">
                    {form.images.map((img) => (
                      <div className="sub-image-item" key={img.id}>
                        <img src={img.imageUrl} alt="" />
                        <button
                          type="button"
                          className="sub-image-del"
                          onClick={() => deleteSubImage(img.id)}
                          aria-label="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onSubImageChange}
                  disabled={!!uploadingSub}
                />
                <p className="field-hint">Select as many images as you like at once — they&apos;ll be added one by one.</p>
                {uploadingSub && (
                  <p className="inline-msg">Uploading image {uploadingSub.done + 1} of {uploadingSub.total}…</p>
                )}
              </div>
            )}

            <div className="mgroup">
              <label>Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
                maxLength={200}
              />
            </div>

            <div className="mgroup-row">
              <div className="mgroup" style={{ flex: 1 }}>
                <label>Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value, subCategory: '' }))}
                >
                  {TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              {form.type === 'design' && (
                <div className="mgroup" style={{ flex: 1 }}>
                  <label>Sub-category</label>
                  <select
                    value={form.subCategory}
                    onChange={(e) => setForm((f) => ({ ...f, subCategory: e.target.value }))}
                  >
                    <option value="">None</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="mgroup">
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                maxLength={2000}
              />
            </div>

            {(form.type === 'dev' || form.type === 'data') && (
              <div className="mgroup">
                <label>Tech Stack (comma-separated)</label>
                <input
                  value={form.techStack}
                  onChange={(e) => setForm((f) => ({ ...f, techStack: e.target.value }))}
                  placeholder="Next.js, Prisma, PostgreSQL"
                />
              </div>
            )}

            <div className="mgroup-row">
              <div className="mgroup" style={{ flex: 1 }}>
                <label>Live URL</label>
                <input
                  value={form.liveUrl}
                  onChange={(e) => setForm((f) => ({ ...f, liveUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div className="mgroup" style={{ flex: 1 }}>
                <label>GitHub URL</label>
                <input
                  value={form.githubUrl}
                  onChange={(e) => setForm((f) => ({ ...f, githubUrl: e.target.value }))}
                  placeholder="https://github.com/..."
                />
              </div>
            </div>

            <div className="mgroup-row">
              <div className="mgroup" style={{ flex: 1 }}>
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                >
                  <option value="live">Live</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div className="mgroup-check" style={{ flex: 1, marginTop: '26px' }}>
                <input
                  type="checkbox"
                  id="featured"
                  checked={form.featured}
                  onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                />
                <label htmlFor="featured" style={{ marginBottom: 0 }}>Featured</label>
              </div>
            </div>

            <div className="mgroup">
              <label>Case study — Problem (optional; shown in the lightbox below the description)</label>
              <textarea
                value={form.problem}
                onChange={(e) => setForm((f) => ({ ...f, problem: e.target.value }))}
                maxLength={1000}
                placeholder="What problem or brief was this work solving?"
              />
            </div>
            <div className="mgroup">
              <label>Case study — Approach (optional)</label>
              <textarea
                value={form.approach}
                onChange={(e) => setForm((f) => ({ ...f, approach: e.target.value }))}
                maxLength={1000}
                placeholder="How did you go about solving it?"
              />
            </div>
            <div className="mgroup">
              <label>Case study — Result (optional)</label>
              <textarea
                value={form.result}
                onChange={(e) => setForm((f) => ({ ...f, result: e.target.value }))}
                maxLength={1000}
                placeholder="What was the outcome?"
              />
            </div>

            {error && <p className="inline-msg err">{error}</p>}

            <div className="modal-actions">
              <button type="button" onClick={closeModal} disabled={saving}>Cancel</button>
              <button type="submit" className="save-btn" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this work?"
        message={`"${pendingDelete?.title}" will be permanently removed from the portfolio.`}
        confirmLabel="Delete"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />

      <Toast message={toast} show={!!toast} />
    </>
  );
}