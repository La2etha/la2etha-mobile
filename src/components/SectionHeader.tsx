import { ReactNode } from 'react';
import { View } from 'react-native';
import { Icon } from './Icon';
import { AppText } from './Text';
import { colors, space } from '../theme/tokens';

export function SectionHeader({
  title,
  icon,
  action,
}: {
  title: string;
  icon?: keyof typeof import('@expo/vector-icons').Feather.glyphMap;
  action?: ReactNode;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.sm,
        marginBottom: space.sm,
      }}
    >
      {icon ? <Icon name={icon} size={18} color={colors.inkSoft} /> : null}
      <AppText variant="h2" style={{ flex: 1 }}>
        {title}
      </AppText>
      {action ?? null}
    </View>
  );
}
