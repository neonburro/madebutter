// src/components/Brand/ButterMark.jsx
// The butter character mark (icon only). Lives at /madebutter-mark.png.
// Optional gentle float/pulse animation for loading states.
import { motion } from 'framer-motion';

export default function ButterMark({ size = 48, animate = false, className = '' }) {
  if (animate) {
    return (
      <motion.img
        src="/madebutter-mark.png"
        alt="madebutter."
        width={size}
        height={size}
        className={className}
        style={{ display: 'block' }}
        animate={{ y: [0, -6, 0], rotate: [0, -3, 3, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      />
    );
  }
  return (
    <img src="/madebutter-mark.png" alt="madebutter." width={size} height={size} className={className} style={{ display: 'block' }} />
  );
}
