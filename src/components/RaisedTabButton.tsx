import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Icon } from './Icon';
import { colors, role, tint } from '../theme/tokens';

/** The raised ＋ tab button (D4): sits above the bar, always teal, always the
 *  same shape whether it's root (Create/Join) or in-event (Add photos). */
export function RaisedTabButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Add"
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        onPress();
      }}
      style={{ top: -16, alignItems: 'center', justifyContent: 'center' }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: role.actionDeep,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: role.action,
          shadowOpacity: 0.5,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
          borderWidth: 3,
          borderColor: colors.paper,
        }}
      >
        <Icon name="plus" size={26} color={colors.paper} />
      </View>
    </Pressable>
  );
}

export const tabBarStyle = {
  backgroundColor: colors.card,
  borderTopColor: colors.line,
  shadowColor: tint.shadow,
};
