import { useRef, useEffect, useState } from 'react';

export const useScrollReveal = (threshold = 0.1) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true); // stay visible once triggered
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observer.observe(element);
    return () => observer.unobserve(element);
  }, [threshold]);

  return { ref, visible };
};

export const revealStyle = (visible, delay = 0, direction = 'up', distance = 30) => {
  const transforms = {
    up:   `translateY(${distance}px)`,
    down: `translateY(-${distance}px)`,
    left: `translateX(${distance}px)`,
    right:`translateX(-${distance}px)`,
  };

  return {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translate(0,0)' : (transforms[direction] ?? transforms.up),
    transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
  };
};