import { useEffect, useState } from 'react';
import { AppText } from './Text';
import { colors } from '../theme';

/** Animated count for the gallery-unlock moment ("126 photos of you"). Reduced
 *  motion shows the final number immediately. */
export function CountUp({
  to,
  reduceMotion = false,
  variant = 'display',
  color = colors.ink,
}: {
  to: number;
  reduceMotion?: boolean;
  variant?: 'display' | 'h1';
  color?: string;
}) {
  const [n, setN] = useState(reduceMotion ? to : 0);

  useEffect(() => {
    if (reduceMotion) {
      setN(to);
      return;
    }
    let raf = 0;
    const start = Date.now();
    const duration = 800;
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      // ease-out so it decelerates into the final count (no overshoot).
      setN(Math.round((1 - Math.pow(1 - t, 3)) * to));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, reduceMotion]);

  return (
    <AppText variant={variant} color={color}>
      {n}
    </AppText>
  );
}
