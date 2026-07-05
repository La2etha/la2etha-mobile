import { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from './Icon';
import { AppText } from './Text';
import { colors, radius, space, tint } from '../theme/tokens';

/** The canonical icon+label control (FR-001): every actionable element in the app
 *  renders through this so nothing is ever icon-only or text-only. */
export function IconLabelAction({
  icon,
  label,
  onPress,
  variant = 'row',
  trailing,
  tone = colors.ink,
}: {
  icon: keyof typeof import('@expo/vector-icons').Feather.glyphMap;
  label: string;
  onPress: () => void;
  variant?: 'row' | 'card';
  trailing?: ReactNode;
  tone?: string;
}) {
  const isCard = variant === 'card';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.sm,
          paddingVertical: isCard ? space.md : space.sm,
          paddingHorizontal: isCard ? space.lg : space.xs,
          opacity: pressed ? 0.7 : 1,
        },
        isCard && {
          backgroundColor: colors.card,
          borderRadius: radius.md,
          shadowColor: tint.shadow,
          shadowOpacity: 1,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 2,
        },
      ]}
    >
      <Icon name={icon} color={tone} />
      <AppText variant={isCard ? 'h2' : 'body'} color={tone} style={{ flex: 1 }} numberOfLines={1}>
        {label}
      </AppText>
      {trailing ? <View>{trailing}</View> : null}
    </Pressable>
  );
}
