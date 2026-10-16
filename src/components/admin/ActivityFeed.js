'use client';
import { useState } from 'react';
import ConfirmDialog from './ConfirmDialog';

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ActivityFeed({ initialActivity }) {
  const [activity, setActivity] = useState(initialActivity);
  const [confirmClear, setConfirmClear] = useState(false);

  async function clearAll() {
    setConfirmClear(false);
    setActivity([]);
    await fetch('/api/activity', { method: 'DELETE' }).catch(() => {});
  }

  return (
    <>
      <div className="works-toolbar">
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12.5px', color: 'var(--muted)' }}>
          {activity.length} events
        </span>
        {activity.length > 0 && (
          <button className="add-btn" onClick={() => setConfirmClear(true)}>Clear All</button>
        )}
      </div>

      <div className="panel">
        {activity.length === 0 ? (
          <div className="empty-panel">No activity recorded yet.</div>
        ) : (
          activity.map((item) => (
            <div className="activity-item" key={item.id}>
              <span className={`dot ${item.type}`} />
              <div>
                <div className="activity-text">{item.message}</div>
                <div className="activity-time">{timeAgo(item.createdAt)}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={confirmClear}
        title="Clear all activity?"
        message="This permanently deletes the entire activity log. This cannot be undone."
        confirmLabel="Clear All"
        danger
        onCancel={() => setConfirmClear(false)}
        onConfirm={clearAll}
      />
    </>
  );
}
