import { useRef } from 'react';
import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { photoUri } from '../api/gallery';
import { colors, radius } from '../theme';

export type PhotoRect = { x: number; y: number; w: number; h: number };

/** A gallery cell. Loads the access-guarded photo bytes with the bearer token and
 *  reveals with a soft cross-dissolve. On press it measures its on-screen rect so
 *  the lightbox can morph open from exactly this thumbnail. */
export function PhotoCard({
  photoId,
  token,
  size,
  onPress,
  reduceMotion = false,
}: {
  photoId: string;
  token: string;
  size: number;
  onPress?: (rect?: PhotoRect) => void;
  reduceMotion?: boolean;
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

  return (
    <Pressable ref={ref} onPress={handlePress} style={{ width: size, height: size, padding: 3 }}>
      <Image
        source={{ uri: photoUri(photoId), headers: { Authorization: `Bearer ${token}` } }}
        style={{ flex: 1, borderRadius: radius.md, backgroundColor: colors.paperSunk }}
        contentFit="cover"
        transition={reduceMotion ? 0 : 400}
        cachePolicy="disk"
      />
    </Pressable>
  );
}
