import { Pressable, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AppText } from './Text';
import { colors, radius, space } from '../theme/tokens';

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
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        onPress();
      }}
      style={({ pressed }) => ({
        backgroundColor: pressed ? colors.stampDeep : colors.stamp,
        opacity: disabled ? 0.5 : 1,
        borderRadius: radius.md,
        paddingVertical: space.md + 2,
        paddingHorizontal: space.xl,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 200,
        // base glow; the breathing gradient-fill is layered on-device in polish
        shadowColor: colors.glowHot,
        shadowOpacity: 0.4,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
      })}
    >
      {loading ? (
        <ActivityIndicator color={colors.paper} />
      ) : (
        <AppText variant="h2" color={colors.paper}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}
