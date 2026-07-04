import { ActivityIndicator, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AppText } from './Text';
import { useReducedMotion } from '../lib/reduceMotion';
import { colors, radius, space } from '../theme/tokens';

const APressable = Animated.createAnimatedComponent(Pressable);

export function GlowButton({
  label,
  onPress,
  loading,
  disabled,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const reduce = useReducedMotion();
  const press = useSharedValue(0); // 0 rest → 1 pressed
  const active = !disabled && !loading;

  // Slow breathing glow — the CTA's designed signature (§3). Off when disabled or
  // reduced motion. Drives shadow radius/opacity so the button gently pulses.
  const breath = useSharedValue(0);
  if (active && !reduce && breath.value === 0) {
    breath.value = withRepeat(withTiming(1, { duration: 1600 }), -1, true);
  }

  const style = useAnimatedStyle(() => {
    const glow = active && !reduce ? 0.35 + breath.value * 0.4 : 0.4;
    return {
      transform: [{ scale: 1 - press.value * 0.04 }],
      shadowOpacity: disabled ? 0 : glow,
      shadowRadius: 14 + (active && !reduce ? breath.value * 10 : 0),
    };
  });

  return (
    <APressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPressIn={() => {
        press.value = withTiming(1, { duration: 90 });
      }}
      onPressOut={() => {
        press.value = withSpring(0, { damping: 14, stiffness: 220 });
      }}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        onPress();
      }}
      style={[
        {
          backgroundColor: colors.stamp,
          opacity: disabled ? 0.5 : 1,
          borderRadius: radius.md,
          paddingVertical: space.md + 2,
          paddingHorizontal: space.xl,
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 200,
          shadowColor: colors.glowHot,
          shadowOffset: { width: 0, height: 6 },
          elevation: 6,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.paper} />
      ) : (
        <AppText variant="h2" color={colors.paper}>
          {label}
        </AppText>
      )}
    </APressable>
  );
}
