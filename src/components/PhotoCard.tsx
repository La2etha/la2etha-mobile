import { useRef } from 'react';
import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from './Icon';
import { AppText } from './Text';
import { photoUri, posterUri } from '../api/gallery';
import { colors, radius, role, space } from '../theme';

export type PhotoRect = { x: number; y: number; w: number; h: number };

function formatDuration(seconds: number): string {
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** A gallery cell. Loads the access-guarded photo bytes with the bearer token and
 *  reveals with a soft cross-dissolve. On press it measures its on-screen rect so
 *  the lightbox can morph open from exactly this thumbnail. A video (spec 003)
 *  shows its poster frame plus a duration badge instead of the raw clip bytes. */
export function PhotoCard({
  photoId,
  token,
  size,
  onPress,
  reduceMotion = false,
  badge = false,
  mediaType = 'photo',
  durationS = null,
}: {
  photoId: string;
  token: string;
  size: number;
  onPress?: (rect?: PhotoRect) => void;
  reduceMotion?: boolean;
  // "Best of you" badge (spec 004 US1) — a small star in the corner.
  badge?: boolean;
  mediaType?: string;
  durationS?: number | null;
}) {
  const ref = useRef<View>(null);

  function handlePress() {
    if (!onPress) return;
    const node = ref.current as unknown as { measureInWindow?: Function } | null;
    if (node?.measureInWindow) {
      node.measureInWindow((x: number, y: number, w: number, h: number) => onPress({ x, y, w, h }));
    } else {
      onPress();
    }
  }

  const isVideo = mediaType === 'video';

  return (
    <Pressable ref={ref} onPress={handlePress} style={{ width: size, height: size, padding: 3 }}>
      <Image
        source={{
          uri: isVideo ? posterUri(photoId) : photoUri(photoId),
          headers: { Authorization: `Bearer ${token}` },
        }}
        style={{ flex: 1, borderRadius: radius.md, backgroundColor: colors.paperSunk }}
        contentFit="cover"
        transition={reduceMotion ? 0 : 400}
        cachePolicy="disk"
      />
      {isVideo ? (
        <View
          style={{
            position: 'absolute',
            bottom: space.xs + 3,
            left: space.xs + 3,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 3,
            backgroundColor: 'rgba(0,0,0,0.55)',
            borderRadius: radius.pill,
            paddingHorizontal: 6,
            paddingVertical: 2,
          }}
        >
          <Icon name="play" size={10} color={colors.paper} />
          {durationS != null ? (
            <AppText variant="mono" color={colors.paper} style={{ fontSize: 11 }}>
              {formatDuration(durationS)}
            </AppText>
          ) : null}
        </View>
      ) : null}
      {badge ? (
        <View
          style={{
            position: 'absolute',
            top: space.xs + 3,
            right: space.xs + 3,
            backgroundColor: role.identity,
            borderRadius: radius.pill,
            width: 22,
            height: 22,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="star" size={12} color={colors.paper} />
        </View>
      ) : null}
    </Pressable>
  );
}
