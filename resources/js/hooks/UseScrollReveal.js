import { useEffect, useRef, useState } from 'react';

/**
 * useScrollReveal
 * Returns a ref to attach to an element and a boolean `visible`
 * that becomes true once the element enters the viewport.
 *
 * @param {number} threshold  - 0–1, how much of element must be visible (default 0.15)
 * @param {string} rootMargin - CSS margin to expand/shrink the trigger zone (default '0px')
 */
export function useScrollReveal(threshold = 0.15, rootMargin = '0px') {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // only fire once
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, visible };
}

/**
 * Inline style helpers — pass to style prop
 * All transitions use a cubic-bezier that feels snappy and modern.
 *
 * @param {boolean} visible   - from useScrollReveal
 * @param {number}  delay     - delay in seconds (default 0)
 * @param {string}  direction - 'up' | 'down' | 'left' | 'right' | 'none'
 * @param {number}  distance  - px to travel (default 28)
 */
export function revealStyle(visible, delay = 0, direction = 'up', distance = 28) {
  const translate = {
    up:    `translateY(${visible ? 0 : distance}px)`,
    down:  `translateY(${visible ? 0 : -distance}px)`,
    left:  `translateX(${visible ? 0 : distance}px)`,
    right: `translateX(${visible ? 0 : -distance}px)`,
    none:  'none',
  }[direction] ?? `translateY(${visible ? 0 : distance}px)`;

  return {
    opacity:    visible ? 1 : 0,
    transform:  translate,
    transition: `opacity 0.65s cubic-bezier(.22,1,.36,1) ${delay}s, transform 0.65s cubic-bezier(.22,1,.36,1) ${delay}s`,
  };
}