import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/tokens';

/** The signed-off icon set (D1): Feather, bundled with Expo — no install, no network fetch. */
export function Icon({
  name,
  size = 20,
  color = colors.ink,
}: {
  name: keyof typeof Feather.glyphMap;
  size?: number;
  color?: string;
}) {
  return <Feather name={name} size={size} color={color} />;
}
