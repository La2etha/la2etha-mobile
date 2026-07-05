import { View } from 'react-native';
import { AppText } from './Text';
import { colors, radius, role } from '../theme/tokens';
import type { FaceLabelVM } from '../features/gallery/faceLabel';

const tone = { self: role.identity, member: role.actionDeep, guest: colors.inkFaint } as const;

/** You(orange) / username(teal) / Guest(muted) (FR-017/018). */
export function FaceLabel({ vm }: { vm: FaceLabelVM }) {
  return (
    <View
      style={{
        backgroundColor: tone[vm.state],
        borderRadius: radius.sm,
        paddingHorizontal: 5,
        paddingVertical: 1,
      }}
    >
      <AppText variant="mono" color={colors.paper} numberOfLines={1}>
        {vm.text}
      </AppText>
    </View>
  );
}
