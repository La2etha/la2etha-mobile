import { Modal, Pressable, View } from 'react-native';
import { Icon } from './Icon';
import { AppText } from './Text';
import { colors, radius, role, space } from '../theme/tokens';

export type ActionSheetItem = {
  icon: keyof typeof import('@expo/vector-icons').Feather.glyphMap;
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

/** Formalizes the lightbox "⋯" pattern into a reusable bottom sheet of
 *  icon+label actions (FR-001 applies here too — no bare icon rows). */
export function ActionSheet({
  visible,
  onClose,
  items,
}: {
  visible: boolean;
  onClose: () => void;
  items: ActionSheetItem[];
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(11,59,58,0.35)', justifyContent: 'flex-end' }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: colors.card,
            borderTopLeftRadius: radius.lg,
            borderTopRightRadius: radius.lg,
            paddingVertical: space.md,
            paddingBottom: space.xl,
          }}
        >
          {items.map((item, i) => (
            <Pressable
              key={i}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              onPress={() => {
                onClose();
                item.onPress();
              }}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.md,
                paddingVertical: space.md,
                paddingHorizontal: space.xl,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Icon name={item.icon} color={item.destructive ? colors.danger : role.actionDeep} />
              <AppText variant="h2" color={item.destructive ? colors.danger : colors.ink}>
                {item.label}
              </AppText>
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
