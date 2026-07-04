import { ReactNode } from 'react';
import { View } from 'react-native';
import { MotiView } from 'moti';
import { colors } from '../theme';

/** The enrollment scan ring: a glowing circular frame around the camera preview
 *  with one pip per required sample, filled as each angle is captured. This is a
 *  designated glow peak (§2.4). Reduced motion drops the breathing pulse.
 *  ponytail: pulse + static ring, not a rotating conic gradient — add the sweep
 *  in a polish pass if the demo needs more dazzle. */
export function ScanRing({
  size = 260,
  total,
  captured,
  reduceMotion = false,
  children,
}: {
  size?: number;
  total: number;
  captured: number;
  reduceMotion?: boolean;
  children?: ReactNode;
}) {
  const r = size / 2;
  const pipR = r + 14; // pips sit just outside the ring

  return (
    <View
      accessibilityLabel={`Captured ${captured} of ${total}`}
      style={{ width: size + 40, height: size + 40, alignItems: 'center', justifyContent: 'center' }}
    >
      {/* Breathing glow halo */}
      <MotiView
        from={{ opacity: reduceMotion ? 0.5 : 0.35, scale: 1 }}
        animate={{ opacity: reduceMotion ? 0.5 : 0.6, scale: reduceMotion ? 1 : 1.04 }}
        transition={{ type: 'timing', duration: 1400, loop: !reduceMotion, repeatReverse: true }}
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: r,
          shadowColor: colors.glowTeal,
          shadowOpacity: 0.9,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 0 },
          backgroundColor: colors.glowTeal,
        }}
      />

      {/* Circular preview window */}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: r,
          overflow: 'hidden',
          borderWidth: 3,
          borderColor: colors.glowTeal,
          backgroundColor: colors.ink,
        }}
      >
        {children}
      </View>

      {/* Progress pips around the ring */}
      {Array.from({ length: total }).map((_, i) => {
        const angle = (-90 + (i * 360) / total) * (Math.PI / 180);
        const filled = i < captured;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: size / 2 + 20 + pipR * Math.cos(angle) - 6,
              top: size / 2 + 20 + pipR * Math.sin(angle) - 6,
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: filled ? colors.glowHot : colors.line,
            }}
          />
        );
      })}
    </View>
  );
}
