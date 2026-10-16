'use client';
import { useEffect } from 'react';

export default function PageViewTracker() {
  useEffect(() => {
    fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'page_view' }),
    }).catch(() => {});
  }, []);

  return null;
}
