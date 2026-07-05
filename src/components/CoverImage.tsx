import { Image } from 'expo-image';
import { colors, radius } from '../theme/tokens';

/** Event cover image for the boarding-pass variant. `onError` fires the
 *  boarding→people fallback (Edge Case: cover load failure → people pass). */
export function CoverImage({
  uri,
  token,
  onError,
  height = 120,
}: {
  uri: string;
  token: string;
  onError: () => void;
  height?: number;
}) {
  return (
    <Image
      source={{ uri, headers: { Authorization: `Bearer ${token}` } }}
      onError={onError}
      style={{
        width: '100%',
        height,
        borderRadius: radius.md,
        backgroundColor: colors.paperSunk,
      }}
      contentFit="cover"
      transition={200}
    />
  );
}
