import { Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Icon } from './Icon';
import { AppText } from './Text';
import { role, radius, space } from '../theme/tokens';

/** Teal outline counterpart to the primary GlowButton — for secondary actions
 *  that still read as "the app's voice", not a muted afterthought. */
export function SecondaryButton({
  label,
  onPress,
  icon,
}: {
  label: string;
  onPress: () => void;
  icon?: keyof typeof import('@expo/vector-icons').Feather.glyphMap;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress();
      }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        gap: space.sm,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: role.action,
        borderRadius: radius.md,
        paddingVertical: space.md,
        paddingHorizontal: space.xl,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {icon ? <Icon name={icon} color={role.actionDeep} /> : null}
      <AppText variant="h2" color={role.actionDeep}>
        {label}
      </AppText>
    </Pressable>
  );
}
