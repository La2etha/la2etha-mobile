import { View } from 'react-native';
import { Image } from 'expo-image';
import { AppText } from './Text';
import { colors, role, space } from '../theme/tokens';

/** Face thumbnail OR a non-identifying monogram (privacy-safe, D6): the people
 *  pass shows monogram avatars to non-hosts so it never leaks who's in an event. */
export function Avatar({
  uri,
  monogram,
  ring,
  size = 36,
}: {
  uri?: string;
  monogram?: string;
  ring?: 'identity' | null;
  size?: number;
}) {
  const ringColor = ring === 'identity' ? role.identity : 'transparent';
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: ring ? 2 : 0,
        borderColor: ringColor,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.paperSunk,
        overflow: 'hidden',
      }}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
      ) : (
        <AppText variant="mono" color={colors.inkSoft}>
          {(monogram ?? '?').slice(0, 2).toUpperCase()}
        </AppText>
      )}
    </View>
  );
}

export function AvatarRow({
  items,
  max = 4,
  size = 32,
}: {
  items: { uri?: string; monogram?: string; ring?: 'identity' | null }[];
  max?: number;
  size?: number;
}) {
  const shown = items.slice(0, max);
  const overflow = items.length - shown.length;
  return (
    <View style={{ flexDirection: 'row' }}>
      {shown.map((it, i) => (
        <View key={i} style={{ marginLeft: i === 0 ? 0 : -space.sm }}>
          <Avatar {...it} size={size} />
        </View>
      ))}
      {overflow > 0 ? (
        <View style={{ marginLeft: -space.sm }}>
          <View
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: colors.ink,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AppText variant="mono" color={colors.paper}>
              +{overflow}
            </AppText>
          </View>
        </View>
      ) : null}
    </View>
  );
}
