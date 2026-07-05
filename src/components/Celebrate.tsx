import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { role } from '../theme/tokens';

const PARTICLES = 10;
const COLORS = [role.action, role.identity] as const;

function Particle({ index, play }: { index: number; play: boolean }) {
  const t = useSharedValue(0);
  const angle = (index / PARTICLES) * Math.PI * 2;
  const distance = 60 + (index % 3) * 12;

  useEffect(() => {
    if (play) t.value = withDelay(index * 12, withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }));
  }, [play, index, t]);

  const style = useAnimatedStyle(() => ({
    opacity: 1 - t.value,
    transform: [
      { translateX: Math.cos(angle) * distance * t.value },
      { translateY: Math.sin(angle) * distance * t.value },
      { scale: 1 - t.value * 0.6 },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: COLORS[index % COLORS.length],
        },
        style,
      ]}
    />
  );
}

/** One-shot bloom+particle celebration (D3, hand-rolled Reanimated — no confetti
 *  lib): fires once on event-create and gallery-unlock. No-op under reduced
 *  motion (FR-021) — the caller just skips rendering this. */
export function Celebrate({ play }: { play: boolean }) {
  return (
    <View pointerEvents="none" style={{ width: 1, height: 1, alignSelf: 'center' }}>
      {Array.from({ length: PARTICLES }, (_, i) => (
        <Particle key={i} index={i} play={play} />
      ))}
    </View>
  );
}
