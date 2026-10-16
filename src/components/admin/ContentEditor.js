'use client';
import { useState } from 'react';
import { safeJson } from '@/lib/apiClient';

async function uploadFile(file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.error || 'Upload failed.');
  return data;
}

async function uploadDocument(file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/upload-document', { method: 'POST', body: fd });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.error || 'Upload failed.');
  return data;
}

export default function ContentEditor({ initialContent }) {
  const [form, setForm] = useState(initialContent);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(initialContent.logoUrl || '');
  const [cvFile, setCvFile] = useState(null);
  const [cvFileName, setCvFileName] = useState('');
  const [aboutFile, setAboutFile] = useState(null);
  const [aboutPreview, setAboutPreview] = useState(initialContent.aboutImageUrl || '');
  const [artFile, setArtFile] = useState(null);
  const [artPreview, setArtPreview] = useState(initialContent.aboutArtImageUrl || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2400);
  }

  function onLogoFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  function onCvFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('CV must be a PDF file.');
      return;
    }
    setCvFile(file);
    setCvFileName(file.name);
  }

  function onAboutFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAboutFile(file);
    setAboutPreview(URL.createObjectURL(file));
  }

  function onArtFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setArtFile(file);
    setArtPreview(URL.createObjectURL(file));
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        heroName: form.heroName,
        heroRoles: form.heroRoles,
        heroTagline: form.heroTagline,
        heroSubtext: form.heroSubtext,
        heroStatProjects: form.heroStatProjects,
        heroStatYears: form.heroStatYears,
        heroStatClients: form.heroStatClients,
        cvUrl: form.cvUrl || '', // overwritten below if a new PDF was picked
        aboutHeadingLine1: form.aboutHeadingLine1,
        aboutHeadingLine2: form.aboutHeadingLine2,
        aboutParagraph1: form.aboutParagraph1,
        aboutParagraph2: form.aboutParagraph2,
        contactHeadingLine1: form.contactHeadingLine1,
        contactHeadingLine2: form.contactHeadingLine2,
        contactSubtext: form.contactSubtext,
        contactEmail: form.contactEmail,
        githubUrl: form.githubUrl || '',
        linkedinUrl: form.linkedinUrl || '',
        instagramUrl: form.instagramUrl || '',
        twitterUrl: form.twitterUrl || '',
        whatsappUrl: form.whatsappUrl || '',
      };

      if (logoFile) {
        const uploaded = await uploadFile(logoFile);
        payload.logoUrl = uploaded.imageUrl;
      }
      if (cvFile) {
        const uploaded = await uploadDocument(cvFile);
        payload.cvUrl = uploaded.fileUrl;
      }
      if (aboutFile) {
        const uploaded = await uploadFile(aboutFile);
        payload.aboutImageUrl = uploaded.imageUrl;
        payload.aboutImageBlurDataUrl = uploaded.blurDataUrl;
      }
      if (artFile) {
        const uploaded = await uploadFile(artFile);
        payload.aboutArtImageUrl = uploaded.imageUrl;
        payload.aboutArtImageBlurDataUrl = uploaded.blurDataUrl;
      }

      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await safeJson(res);
      if (!res.ok) {
        setError(data.error || 'Could not save changes.');
        setSaving(false);
        return;
      }
      setForm(data);
      setLogoFile(null);
      setAboutFile(null);
      setArtFile(null);
      setCvFile(null);
      setCvFileName('');
      showToast('Site content updated.');
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="panel settings-panel">
      <h3 style={{ marginBottom: 20 }}>Hero</h3>

      <div className="mgroup">
        <label>Name</label>
        <input value={form.heroName} onChange={(e) => set('heroName', e.target.value)} maxLength={300} />
      </div>
      <div className="mgroup">
        <label>Roles (comma-separated, rotates in the hero)</label>
        <input value={form.heroRoles} onChange={(e) => set('heroRoles', e.target.value)} maxLength={300} />
      </div>
      <div className="mgroup">
        <label>Tagline</label>
        <input value={form.heroTagline} onChange={(e) => set('heroTagline', e.target.value)} maxLength={300} />
      </div>
      <div className="mgroup">
        <label>Subtext</label>
        <textarea value={form.heroSubtext} onChange={(e) => set('heroSubtext', e.target.value)} maxLength={2000} />
      </div>
      <div className="mgroup-row">
        <div className="mgroup" style={{ flex: 1 }}>
          <label>Projects stat</label>
          <input type="number" value={form.heroStatProjects} onChange={(e) => set('heroStatProjects', e.target.value)} />
        </div>
        <div className="mgroup" style={{ flex: 1 }}>
          <label>Years stat</label>
          <input type="number" value={form.heroStatYears} onChange={(e) => set('heroStatYears', e.target.value)} />
        </div>
        <div className="mgroup" style={{ flex: 1 }}>
          <label>Clients stat</label>
          <input type="number" value={form.heroStatClients} onChange={(e) => set('heroStatClients', e.target.value)} />
        </div>
      </div>
      <div className="mgroup">
        <label>CV / résumé (PDF, uploaded from your computer)</label>
        {(cvFileName || form.cvUrl) && (
          <p className="upload-filename">
            {cvFileName || (form.cvUrl ? form.cvUrl.split('/').pop() : '')}
          </p>
        )}
        <input type="file" accept="application/pdf" onChange={onCvFile} />
        <p className="field-hint">
          The hero&apos;s &quot;Download CV&quot; button is hidden automatically until you upload one here.
        </p>
      </div>
      <div className="mgroup">
        <label>Logo (shown in the nav bar — falls back to initials when empty)</label>
        {logoPreview && <img className="upload-preview square" src={logoPreview} alt="" />}
        <input type="file" accept="image/*" onChange={onLogoFile} />
      </div>

      <h3 style={{ margin: '32px 0 20px' }}>About</h3>

      <div className="mgroup-row">
        <div className="mgroup" style={{ flex: 1 }}>
          <label>Portrait photo</label>
          {aboutPreview && <img className="upload-preview" src={aboutPreview} alt="" />}
          <input type="file" accept="image/*" onChange={onAboutFile} />
        </div>
        <div className="mgroup" style={{ flex: 1 }}>
          <label>&quot;Art version&quot; portrait (shown on hover)</label>
          {artPreview && <img className="upload-preview" src={artPreview} alt="" />}
          <input type="file" accept="image/*" onChange={onArtFile} />
        </div>
      </div>

      <div className="mgroup">
        <label>Heading line 1</label>
        <input value={form.aboutHeadingLine1} onChange={(e) => set('aboutHeadingLine1', e.target.value)} maxLength={300} />
      </div>
      <div className="mgroup">
        <label>Heading line 2 (accent color)</label>
        <input value={form.aboutHeadingLine2} onChange={(e) => set('aboutHeadingLine2', e.target.value)} maxLength={300} />
      </div>
      <div className="mgroup">
        <label>Paragraph 1</label>
        <textarea value={form.aboutParagraph1} onChange={(e) => set('aboutParagraph1', e.target.value)} maxLength={2000} />
      </div>
      <div className="mgroup">
        <label>Paragraph 2</label>
        <textarea value={form.aboutParagraph2} onChange={(e) => set('aboutParagraph2', e.target.value)} maxLength={2000} />
      </div>

      <h3 style={{ margin: '32px 0 20px' }}>Contact & Socials</h3>

      <div className="mgroup">
        <label>Heading line 1</label>
        <input value={form.contactHeadingLine1} onChange={(e) => set('contactHeadingLine1', e.target.value)} maxLength={300} />
      </div>
      <div className="mgroup">
        <label>Heading line 2 (accent color)</label>
        <input value={form.contactHeadingLine2} onChange={(e) => set('contactHeadingLine2', e.target.value)} maxLength={300} />
      </div>
      <div className="mgroup">
        <label>Subtext</label>
        <textarea value={form.contactSubtext} onChange={(e) => set('contactSubtext', e.target.value)} maxLength={2000} />
      </div>
      <div className="mgroup">
        <label>Contact email</label>
        <input type="email" value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} maxLength={300} />
      </div>
      <div className="mgroup-row">
        <div className="mgroup" style={{ flex: 1 }}>
          <label>GitHub URL</label>
          <input value={form.githubUrl || ''} onChange={(e) => set('githubUrl', e.target.value)} placeholder="https://github.com/..." />
        </div>
        <div className="mgroup" style={{ flex: 1 }}>
          <label>LinkedIn URL</label>
          <input value={form.linkedinUrl || ''} onChange={(e) => set('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/in/..." />
        </div>
      </div>
      <div className="mgroup-row">
        <div className="mgroup" style={{ flex: 1 }}>
          <label>Instagram URL</label>
          <input value={form.instagramUrl || ''} onChange={(e) => set('instagramUrl', e.target.value)} placeholder="https://instagram.com/..." />
        </div>
        <div className="mgroup" style={{ flex: 1 }}>
          <label>Twitter / X URL</label>
          <input value={form.twitterUrl || ''} onChange={(e) => set('twitterUrl', e.target.value)} placeholder="https://x.com/..." />
        </div>
      </div>
      <div className="mgroup">
        <label>WhatsApp number (country code + number, digits only)</label>
        <input value={form.whatsappUrl || ''} onChange={(e) => set('whatsappUrl', e.target.value)} placeholder="2348012345678" />
      </div>

      {error && <p className="inline-msg err">{error}</p>}
      {toast && <p className="inline-msg ok">{toast}</p>}

      <button type="submit" className="add-btn" style={{ marginTop: 16 }} disabled={saving}>
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  );
}
