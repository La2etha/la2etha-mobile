import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** Live reduced-motion preference. Every looping/decorative animation reads this. */
export function useReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduce);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => sub.remove();
  }, []);
  return reduce;
}
