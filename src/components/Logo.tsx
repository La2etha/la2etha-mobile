import { Image } from 'expo-image';
import { Dimensions } from 'react-native';

// Trimmed wordmark asset is 770x327 (padding removed) → aspect ratio W/H.
const WORDMARK_ASPECT = 770 / 327;

export function Logo({
  size = 120,
  wordmark = false,
  widthPct,
}: {
  size?: number;
  wordmark?: boolean;
  widthPct?: number;
}) {
  if (wordmark) {
    const w = widthPct ? Dimensions.get('window').width * widthPct : size;
    return (
      <Image
        source={require('../../assets/logo-wordmark.png')}
        style={{ width: w, height: w / WORDMARK_ASPECT }}
        contentFit="contain"
      />
    );
  }
  // Square mark (used by the splash inside the scan-bracket frame).
  return (
    <Image
      source={require('../../assets/logo.png')}
      style={{ width: size, height: size }}
      contentFit="contain"
    />
  );
}
