'use client';
import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const INTERACTIVE_SELECTOR = 'a, button, input, textarea, select, [role="button"], .card, .filter-btn';

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);

  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const ringX = useSpring(dotX, { damping: 28, stiffness: 320, mass: 0.5 });
  const ringY = useSpring(dotY, { damping: 28, stiffness: 320, mass: 0.5 });

  useEffect(() => {
    // Only take over the cursor on devices with a real mouse - never on
    // touch devices, where there's no cursor to replace.
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!isFinePointer) return;

    setEnabled(true);
    document.body.classList.add('custom-cursor-active');

    function handleMove(e) {
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      const target = e.target.closest(INTERACTIVE_SELECTOR);
      setHovering(Boolean(target));
    }
    function handleDown() { setClicking(true); }
    function handleUp() { setClicking(false); }
    function handleLeave() { dotX.set(-100); dotY.set(-100); }

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);
    document.documentElement.addEventListener('mouseleave', handleLeave);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
      document.documentElement.removeEventListener('mouseleave', handleLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        className="custom-cursor-dot"
        style={{ x: dotX, y: dotY }}
        animate={{ scale: clicking ? 0.6 : 1 }}
        transition={{ duration: 0.15 }}
      />
      <motion.div
        className="custom-cursor-ring"
        style={{ x: ringX, y: ringY }}
        animate={{
          scale: hovering ? 1.8 : clicking ? 0.85 : 1,
          opacity: hovering ? 0.5 : 1,
        }}
        transition={{ duration: 0.25, ease: [0.2, 0.7, 0.3, 1] }}
      />
    </>
  );
}
