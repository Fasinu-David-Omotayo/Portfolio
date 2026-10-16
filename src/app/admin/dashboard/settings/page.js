'use client';
import { useState } from 'react';
import { safeJson } from '@/lib/apiClient';

export default function SettingsPage() {
  const [emailForm, setEmailForm] = useState({ currentPassword: '', newEmail: '' });
  const [emailStatus, setEmailStatus] = useState({ error: '', ok: '' });
  const [emailSaving, setEmailSaving] = useState(false);

  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passStatus, setPassStatus] = useState({ error: '', ok: '' });
  const [passSaving, setPassSaving] = useState(false);

  async function submitEmail(e) {
    e.preventDefault();
    setEmailSaving(true);
    setEmailStatus({ error: '', ok: '' });
    try {
      const res = await fetch('/api/auth/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailForm),
      });
      const data = await safeJson(res);
      if (!res.ok) {
        setEmailStatus({ error: data.error || 'Could not update email.', ok: '' });
        return;
      }
      setEmailStatus({ error: '', ok: `Login email updated to ${data.email}.` });
      setEmailForm({ currentPassword: '', newEmail: '' });
    } catch {
      setEmailStatus({ error: 'Could not reach the server.', ok: '' });
    } finally {
      setEmailSaving(false);
    }
  }

  async function submitPassword(e) {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassStatus({ error: 'New passwords do not match.', ok: '' });
      return;
    }
    setPassSaving(true);
    setPassStatus({ error: '', ok: '' });
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passForm.currentPassword,
          newPassword: passForm.newPassword,
        }),
      });
      const data = await safeJson(res);
      if (!res.ok) {
        setPassStatus({ error: data.error || 'Could not update password.', ok: '' });
        return;
      }
      setPassStatus({ error: '', ok: 'Password updated.' });
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      setPassStatus({ error: 'Could not reach the server.', ok: '' });
    } finally {
      setPassSaving(false);
    }
  }

  return (
    <>
      <h1 className="page-title">Settings</h1>
      <p className="page-sub">Manage your admin login credentials.</p>

      <form onSubmit={submitEmail} className="panel settings-panel" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 20 }}>Change Login Email</h3>
        <div className="mgroup">
          <label>Current Password</label>
          <input
            type="password"
            value={emailForm.currentPassword}
            onChange={(e) => setEmailForm((f) => ({ ...f, currentPassword: e.target.value }))}
            required
          />
        </div>
        <div className="mgroup">
          <label>New Email</label>
          <input
            type="email"
            value={emailForm.newEmail}
            onChange={(e) => setEmailForm((f) => ({ ...f, newEmail: e.target.value }))}
            required
          />
        </div>
        {emailStatus.error && <p className="inline-msg err">{emailStatus.error}</p>}
        {emailStatus.ok && <p className="inline-msg ok">{emailStatus.ok}</p>}
        <button type="submit" className="add-btn" style={{ marginTop: 10 }} disabled={emailSaving}>
          {emailSaving ? 'Saving…' : 'Update Email'}
        </button>
      </form>

      <form onSubmit={submitPassword} className="panel settings-panel">
        <h3 style={{ marginBottom: 20 }}>Change Password</h3>
        <div className="mgroup">
          <label>Current Password</label>
          <input
            type="password"
            value={passForm.currentPassword}
            onChange={(e) => setPassForm((f) => ({ ...f, currentPassword: e.target.value }))}
            required
          />
        </div>
        <div className="mgroup-row">
          <div className="mgroup" style={{ flex: 1 }}>
            <label>New Password</label>
            <input
              type="password"
              value={passForm.newPassword}
              onChange={(e) => setPassForm((f) => ({ ...f, newPassword: e.target.value }))}
              minLength={8}
              required
            />
          </div>
          <div className="mgroup" style={{ flex: 1 }}>
            <label>Confirm New Password</label>
            <input
              type="password"
              value={passForm.confirmPassword}
              onChange={(e) => setPassForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              minLength={8}
              required
            />
          </div>
        </div>
        {passStatus.error && <p className="inline-msg err">{passStatus.error}</p>}
        {passStatus.ok && <p className="inline-msg ok">{passStatus.ok}</p>}
        <button type="submit" className="add-btn" style={{ marginTop: 10 }} disabled={passSaving}>
          {passSaving ? 'Saving…' : 'Update Password'}
        </button>
      </form>

      <div className="security-note">
        <b>Security note:</b> sessions last 7 days. Changing your password or email does not
        automatically sign out other devices — if you suspect unauthorized access, change both
        and redeploy with a new <b>JWT_SECRET</b> to invalidate every existing session.
      </div>
    </>
  );
}
