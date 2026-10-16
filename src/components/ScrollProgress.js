'use client';
import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { damping: 24, stiffness: 200, mass: 0.3 });

  return (
    <div className="scroll-progress-track">
      <motion.div className="scroll-progress-fill" style={{ scaleY: smoothProgress }} />
    </div>
  );
}
