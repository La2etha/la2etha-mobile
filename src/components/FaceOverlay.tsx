import { View } from 'react-native';
import { AppText } from './Text';
import { colors, radius } from '../theme';
import type { PhotoFace } from '../api/gallery';

/** Trust-toggle overlay (FR-024): draws detected-face boxes over the photo. The
 *  viewer's own face is haloed burnt-orange; others are calm teal. Boxes are
 *  normalized 0..1, scaled to the rendered frame.
 *
 *  The "You" tag is rendered at the overlay level (not inside the box) and sits
 *  ABOVE the head — nesting it in a small box constrained its width and made the
 *  text wrap one letter per line, covering the face. */
export function FaceOverlay({ faces, width, height }: { faces: PhotoFace[]; width: number; height: number }) {
  return (
    <View style={{ position: 'absolute', width, height }} pointerEvents="none">
      {faces.map((f, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: f.x * width,
            top: f.y * height,
            width: f.w * width,
            height: f.h * height,
            borderWidth: 2,
            borderColor: f.is_me ? colors.stamp : colors.glowTeal,
            borderRadius: radius.sm,
            shadowColor: f.is_me ? colors.glowHot : colors.glowTeal,
            shadowOpacity: 0.6,
            shadowRadius: 8,
          }}
        />
      ))}

      {faces.map((f, i) =>
        f.is_me ? (
          <View
            key={`tag-${i}`}
            style={{
              position: 'absolute',
              left: f.x * width,
              // Above the box; drop just below the top edge if there's no room above.
              top: f.y * height > 16 ? f.y * height - 15 : f.y * height + 2,
              backgroundColor: colors.stamp,
              borderRadius: radius.sm,
              paddingHorizontal: 5,
              paddingVertical: 1,
            }}
          >
            <AppText variant="mono" color={colors.paper} numberOfLines={1}>You</AppText>
          </View>
        ) : null
      )}
    </View>
  );
}
