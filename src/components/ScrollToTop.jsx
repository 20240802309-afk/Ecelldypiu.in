import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  const lenisRef = useRef(null);

  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;
    window.lenis = lenis; // Expose for other components if needed

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      cancelAnimationFrame(rafId);
      window.lenis = null;
    };
  }, []);

  useEffect(() => {
    // Handle navigation scroll reset
    if (!hash) {
      // Immediate scroll to top
      window.scrollTo(0, 0);

      // Force Lenis to update its internal state
      if (lenisRef.current) {
        lenisRef.current.scrollTo(0, { immediate: true });
      }
    } else {
      // Optional: logic to scroll to hash using Lenis
      // const element = document.getElementById(hash.replace('#', ''));
      // if (element && lenisRef.current) lenisRef.current.scrollTo(element);
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
