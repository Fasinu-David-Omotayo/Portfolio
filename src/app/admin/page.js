'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { safeJson } from '@/lib/apiClient';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await safeJson(res);
      if (!res.ok) {
        setError(data.error || 'Login failed.');
        setLoading(false);
        return;
      }
      router.push('/admin/dashboard');
      router.refresh();
    } catch {
      setError('Could not reach the server. Try again.');
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-screen">
      <form className="login-box" onSubmit={submit}>
        <div className="login-brand">FASINU DAVID<span>.</span></div>
        <div className="login-sub">Studio Admin</div>

        <div className="lgroup">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="lgroup">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="login-btn" type="submit" disabled={loading}>
          {loading ? 'Logging in…' : 'Log In'}
        </button>

        {error && <p className="login-error">{error}</p>}
      </form>
    </div>
  );
}
