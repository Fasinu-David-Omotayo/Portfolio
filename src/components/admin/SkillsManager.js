'use client';
import { useState } from 'react';
import { safeJson } from '@/lib/apiClient';
import Toast from './Toast';

export default function SkillsManager({ initialSkills }) {
  const [skills, setSkills] = useState(initialSkills);
  const [newCategory, setNewCategory] = useState('');
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const grouped = {};
  for (const s of skills) {
    if (!grouped[s.category]) grouped[s.category] = [];
    grouped[s.category].push(s);
  }
  const categories = Object.keys(grouped);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  }

  async function addSkill(e) {
    e.preventDefault();
    if (!newCategory.trim() || !newName.trim()) return;
    setAdding(true);
    setError('');
    try {
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCategory.trim(), name: newName.trim() }),
      });
      const data = await safeJson(res);
      if (!res.ok) {
        setError(data.error || 'Could not add that skill.');
        return;
      }
      setSkills((list) => [...list, data]);
      setNewName('');
      showToast('Skill added.');
    } catch {
      setError('Could not reach the server.');
    } finally {
      setAdding(false);
    }
  }

  async function removeSkill(id) {
    setSkills((list) => list.filter((s) => s.id !== id));
    await fetch(`/api/skills/${id}`, { method: 'DELETE' }).catch(() => {});
  }

  return (
    <div className="panel settings-panel">
      {categories.length === 0 ? (
        <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>No skills yet — add your first one below.</p>
      ) : (
        categories.map((cat) => (
          <div className="skills-admin-cat" key={cat}>
            <h4>{cat}</h4>
            <div className="skills-admin-chips">
              {grouped[cat].map((s) => (
                <span className="skill-chip" key={s.id}>
                  {s.name}
                  <button type="button" onClick={() => removeSkill(s.id)} aria-label={`Remove ${s.name}`}>×</button>
                </span>
              ))}
            </div>
          </div>
        ))
      )}

      <form className="skill-add-row" onSubmit={addSkill}>
        <input
          placeholder="Category (e.g. Languages)"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          maxLength={60}
          list="existing-categories"
        />
        <datalist id="existing-categories">
          {categories.map((c) => <option value={c} key={c} />)}
        </datalist>
        <input
          placeholder="Skill name (e.g. Python)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          maxLength={60}
        />
        <button type="submit" className="add-btn" disabled={adding}>
          {adding ? 'Adding…' : '+ Add'}
        </button>
      </form>

      {error && <p className="inline-msg err">{error}</p>}

      <Toast message={toast} show={!!toast} />
    </div>
  );
}
