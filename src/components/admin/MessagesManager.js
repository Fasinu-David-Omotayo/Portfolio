'use client';
import { useState } from 'react';
import ConfirmDialog from './ConfirmDialog';

function formatDate(date) {
  return new Date(date).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

export default function MessagesManager({ initialMessages }) {
  const [messages, setMessages] = useState(initialMessages);
  const [pendingDelete, setPendingDelete] = useState(null);

  async function toggleRead(msg) {
    const next = !msg.read;
    setMessages((list) => list.map((m) => (m.id === msg.id ? { ...m, read: next } : m)));
    await fetch(`/api/messages/${msg.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: next }),
    }).catch(() => {});
  }

  async function confirmDelete() {
    const msg = pendingDelete;
    setPendingDelete(null);
    if (!msg) return;
    setMessages((list) => list.filter((m) => m.id !== msg.id));
    await fetch(`/api/messages/${msg.id}`, { method: 'DELETE' }).catch(() => {});
  }

  if (messages.length === 0) {
    return (
      <div className="panel">
        <div className="empty-panel">No messages yet — they&apos;ll show up here as visitors reach out.</div>
      </div>
    );
  }

  return (
    <>
      <div className="panel">
        {messages.map((msg) => (
          <div
            className="activity-item"
            key={msg.id}
            style={{ alignItems: 'flex-start', flexDirection: 'column', gap: 10 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div className="activity-text" style={{ fontWeight: 600 }}>
                  {msg.name} {!msg.read && <span className="status-badge live" style={{ marginLeft: 8 }}>New</span>}
                </div>
                <div className="activity-time">{msg.email} · {msg.projectType} · {formatDate(msg.createdAt)}</div>
              </div>
              <div className="row-actions">
                <button onClick={() => toggleRead(msg)}>{msg.read ? 'Mark Unread' : 'Mark Read'}</button>
                <button className="del" onClick={() => setPendingDelete(msg)}>Delete</button>
              </div>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
              {msg.message}
            </p>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this message?"
        message={`The message from "${pendingDelete?.name}" will be permanently removed.`}
        confirmLabel="Delete"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
