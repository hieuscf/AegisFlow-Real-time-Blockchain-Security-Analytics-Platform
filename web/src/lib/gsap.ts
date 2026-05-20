import gsap from 'gsap';

export const entranceDefaults = {
  duration: 0.55,
  ease: 'power3.out',
  stagger: 0.08,
} as const;

export function fadeUp(
  targets: gsap.TweenTarget,
  options?: Partial<gsap.TweenVars>,
): gsap.core.Tween {
  return gsap.from(targets, {
    y: 24,
    opacity: 0,
    ...entranceDefaults,
    ...options,
  });
}

export function fadeIn(
  targets: gsap.TweenTarget,
  options?: Partial<gsap.TweenVars>,
): gsap.core.Tween {
  return gsap.from(targets, {
    opacity: 0,
    duration: 0.4,
    ease: 'power2.out',
    ...options,
  });
}
