'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { safeJson } from '@/lib/apiClient';

// Shown text only - the real link (with https://) stays on the href so it
// still opens correctly. Strips the protocol and any trailing slash.
function displayUrl(url) {
  return String(url || '')
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '');
}


const PROJECT_TYPES = ['Software Development', 'Graphic Design', 'Data Analysis', 'Something else'];

export default function Contact({ content }) {
  const [form, setForm] = useState({ name: '', email: '', projectType: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await safeJson(res);
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Try again.');
        setStatus('error');
        return;
      }
      setStatus('sent');
      setForm({ name: '', email: '', projectType: '', message: '' });
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
      setStatus('error');
    }
  }

  const socials = [
    content?.githubUrl && { label: 'GitHub', href: content.githubUrl },
    content?.linkedinUrl && { label: 'LinkedIn', href: content.linkedinUrl },
    content?.instagramUrl && { label: 'Instagram', href: content.instagramUrl },
    content?.twitterUrl && { label: 'Twitter / X', href: content.twitterUrl },
    content?.whatsappUrl && { label: 'WhatsApp', href: `https://wa.me/${content.whatsappUrl}` },
  ].filter(Boolean);

  return (
    <section className="contact" id="contact">
      <div className="container contact-inner">
      <motion.div
        className="contact-left"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, ease: [0.2, 0.7, 0.3, 1] }}
      >
        <span className="section-num">05 — Contact</span>
        <h2>
          {content?.contactHeadingLine1 || "Let's work"}
          <br />
          {content?.contactHeadingLine2 || 'together.'}
        </h2>
        <p>
          {content?.contactSubtext ||
            'Open to software, design, and data projects. Fill out the form or reach out directly.'}
        </p>

        <div className="contact-detail">
          <label>Email</label>
          <a href={`mailto:${content?.contactEmail || 'hello@fasinudavid.com'}`}>
            {content?.contactEmail || 'hello@fasinudavid.com'}
          </a>
        </div>

        {socials.map((s) => (
          <div className="contact-detail" key={s.label}>
            <label>{s.label}</label>
            <a href={s.href} target="_blank" rel="noopener noreferrer">{displayUrl(s.href)}</a>
          </div>
        ))}
      </motion.div>

      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.2, 0.7, 0.3, 1] }}
      >
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              required
              maxLength={200}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              required
              maxLength={200}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="projectType">Project Type</label>
          <select
            id="projectType"
            value={form.projectType}
            onChange={(e) => update('projectType', e.target.value)}
            required
          >
            <option value="" disabled>Select one</option>
            {PROJECT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            value={form.message}
            onChange={(e) => update('message', e.target.value)}
            required
            maxLength={5000}
          />
        </div>

        <button type="submit" className="submit-btn" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send Message'}
        </button>

        {status === 'sent' && <p className="form-success">Thanks — your message is in. I&apos;ll reply soon.</p>}
        {status === 'error' && <p className="form-error">{error}</p>}
      </motion.form>
      </div>
    </section>
  );
}