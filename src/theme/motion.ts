import { Easing } from 'react-native-reanimated';

// Motion discipline (§3): ease-out (expo/quint) or gentle springs with NO overshoot.
// No bounce, no elastic. Every screen degrades to a crossfade/instant under reduce-motion.
export const motion = {
  fast: 180,
  base: 260,
  slow: 420,
  easeOut: Easing.out(Easing.exp),
  easeOutQuint: Easing.bezier(0.22, 1, 0.36, 1),
  spring: { damping: 18, stiffness: 160, mass: 1 } as const, // tuned to not overshoot
} as const;
