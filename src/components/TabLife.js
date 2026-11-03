'use client';
import { useEffect } from 'react';

// Keeps the browser tab feeling alive: when a visitor switches to another
// tab, the title nudges them back, then returns to normal when they do.
export default function TabLife() {
  useEffect(() => {
    const original = document.title;
    const away = 'Come back, Dee misses you';
    function onVisibility() {
      document.title = document.hidden ? away : original;
    }
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      document.title = original;
    };
  }, []);
  return null;
}