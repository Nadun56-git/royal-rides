/**
 * animate-ui.jsx — Royal Rides Animation Primitives
 * Premium luxury animation components powered by Framer Motion.
 * Inspired by animate-ui.com — smooth, elegant, never flashy.
 * NO "use client" — this is Vite/React, not Next.js
 */

import {
  motion,
  useInView,
  useScroll,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

// ─── Shared Easing ─────────────────────────────────────────────────────────────
const LUXURY_EASE = [0.22, 1, 0.36, 1];
const SPRING = { type: 'spring', stiffness: 100, damping: 20 };

// ─── 1. FadeUp ─────────────────────────────────────────────────────────────────
export const FadeUp = ({ children, delay = 0, className = '', duration = 0.7 }) => (
  <motion.div
    initial={{ opacity: 0, y: 32 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration, delay, ease: LUXURY_EASE }}
    className={className}
  >
    {children}
  </motion.div>
);

// ─── 2. FadeIn ─────────────────────────────────────────────────────────────────
export const FadeIn = ({ children, delay = 0, className = '', duration = 0.6 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ duration, delay, ease: LUXURY_EASE }}
    className={className}
  >
    {children}
  </motion.div>
);

// ─── 3. SlideIn ────────────────────────────────────────────────────────────────
export const SlideIn = ({ children, delay = 0, className = '', from = 'left', duration = 0.7 }) => {
  const xFrom = from === 'left' ? -48 : from === 'right' ? 48 : 0;
  const yFrom = from === 'bottom' ? 48 : from === 'top' ? -48 : 0;
  return (
    <motion.div
      initial={{ opacity: 0, x: xFrom, y: yFrom }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration, delay, ease: LUXURY_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ─── 4. StaggerContainer ───────────────────────────────────────────────────────
export const StaggerContainer = ({
  children,
  className = '',
  staggerDelay = 0.1,
  delayChildren = 0,
}) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-60px' }}
    variants={{
      hidden: {},
      visible: {
        transition: {
          staggerChildren: staggerDelay,
          delayChildren,
        },
      },
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// ─── 5. StaggerItem ────────────────────────────────────────────────────────────
export const StaggerItem = ({ children, className = '' }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 24 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: LUXURY_EASE } },
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// ─── 6. SplittingText ──────────────────────────────────────────────────────────
export const SplittingText = ({
  text,
  type = 'words',
  delay = 0,
  className = '',
  charClassName = '',
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  const units = type === 'chars' ? text.split('') : text.split(' ');

  return (
    <span ref={ref} className={className} aria-label={text} style={{ display: 'inline' }}>
      {units.map((unit, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 28, filter: 'blur(4px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{
            duration: 0.55,
            delay: delay + i * (type === 'chars' ? 0.04 : 0.08),
            ease: LUXURY_EASE,
          }}
          style={{ display: 'inline-block' }}
          className={charClassName}
        >
          {unit}
          {type === 'words' && i < units.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </span>
  );
};

// ─── 7. TypingText ─────────────────────────────────────────────────────────────
export const TypingText = ({
  text,
  speed = 40,
  delay = 0,
  className = '',
  showCursor = true,
  cursorChar = '|',
}) => {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const timer = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [isInView, delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [started, text, speed]);

  return (
    <span ref={ref} className={className}>
      {displayed}
      {showCursor && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
          className="text-gold"
        >
          {cursorChar}
        </motion.span>
      )}
    </span>
  );
};

// ─── 8. ScrollFadeText ─────────────────────────────────────────────────────────
export const ScrollFadeText = ({ text, className = '' }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const words = text.split(' ');

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = (i + 1) / words.length;
        return (
          <ScrollWord
            key={i}
            word={word}
            progress={scrollYProgress}
            start={start}
            end={end}
          />
        );
      })}
    </p>
  );
};

function ScrollWord({ word, progress, start, end }) {
  const opacity = useTransform(progress, [start, end], [0.2, 1]);
  return (
    <motion.span style={{ opacity }} className="inline-block mr-[0.25em]">
      {word}
    </motion.span>
  );
}

// ─── 9. CountingNumber ─────────────────────────────────────────────────────────
export const CountingNumber = ({
  value,
  suffix = '',
  prefix = '',
  duration = 2,
  className = '',
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  // Parse raw numeric value (strip non-numeric except dot)
  const numericValue = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
  // Detect if original value has a trailing '+', '★' etc.
  const trailMatch = String(value).match(/[^0-9.]+$/);
  const trail = trailMatch ? trailMatch[0] : '';

  useEffect(() => {
    if (!isInView) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(eased * numericValue));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(numericValue);
    };
    requestAnimationFrame(step);
  }, [isInView, numericValue, duration]);

  const display = Number.isInteger(numericValue) ? count : count.toFixed(1);

  return (
    <span ref={ref} className={className}>
      {prefix}{display}{trail}{suffix}
    </span>
  );
};

// ─── 10. ScaleIn ───────────────────────────────────────────────────────────────
export const ScaleIn = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.88 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ duration: 0.65, delay, ease: LUXURY_EASE }}
    className={className}
  >
    {children}
  </motion.div>
);

// ─── 11. BlurIn ────────────────────────────────────────────────────────────────
export const BlurIn = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, filter: 'blur(12px)', y: 16 }}
    whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ duration: 0.8, delay, ease: LUXURY_EASE }}
    className={className}
  >
    {children}
  </motion.div>
);

// ─── 12. FloatingCard ──────────────────────────────────────────────────────────
export const FloatingCard = ({ children, className = '', amplitude = 8, duration = 4 }) => (
  <motion.div
    animate={{ y: [0, -amplitude, 0] }}
    transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

// ─── 13. MagneticButton ────────────────────────────────────────────────────────
export const MagneticButton = ({ children, className = '', strength = 0.3 }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });

  const handleMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ─── 14. ShimmerText ───────────────────────────────────────────────────────────
export const ShimmerText = ({ text, className = '' }) => (
  <span
    className={className}
    style={{
      background: 'linear-gradient(90deg, #C9A84C 0%, #fff8e7 40%, #C9A84C 60%, #C9A84C 100%)',
      backgroundSize: '200% auto',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      animation: 'shimmer 2.8s linear infinite',
    }}
  >
    {text}
    <style>{`
      @keyframes shimmer {
        0% { background-position: 200% center; }
        100% { background-position: -200% center; }
      }
    `}</style>
  </span>
);

// ─── 15. ScrollProgress ────────────────────────────────────────────────────────
export const ScrollProgress = ({ color = '#C9A84C' }) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      style={{
        scaleX,
        transformOrigin: '0%',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: color,
        zIndex: 9999,
      }}
    />
  );
};

// ─── 16. RevealOnScroll ────────────────────────────────────────────────────────
const REVEAL_VARIANTS = {
  fadeUp: { hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0 } },
  fadeIn: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  scaleIn: { hidden: { opacity: 0, scale: 0.88 }, visible: { opacity: 1, scale: 1 } },
  blurIn: { hidden: { opacity: 0, filter: 'blur(12px)' }, visible: { opacity: 1, filter: 'blur(0px)' } },
  slideLeft: { hidden: { opacity: 0, x: -48 }, visible: { opacity: 1, x: 0 } },
  slideRight: { hidden: { opacity: 0, x: 48 }, visible: { opacity: 1, x: 0 } },
};

export const RevealOnScroll = ({ children, className = '', animation = 'fadeUp', delay = 0 }) => {
  const variants = REVEAL_VARIANTS[animation] || REVEAL_VARIANTS.fadeUp;
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={variants}
      transition={{ duration: 0.7, delay, ease: LUXURY_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
