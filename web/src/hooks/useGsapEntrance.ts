import { useEffect, useRef } from 'react';
import { fadeUp } from '@/lib/gsap';

export function useGsapEntrance<T extends HTMLElement>(
  enabled = true,
  selector = '[data-animate]',
) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const targets = containerRef.current.querySelectorAll(selector);
    if (targets.length === 0) return;

    const tween = fadeUp(targets);
    return () => {
      tween.kill();
    };
  }, [enabled, selector]);

  return containerRef;
}
