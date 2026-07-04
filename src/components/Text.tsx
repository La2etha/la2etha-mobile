import { Text, TextProps, StyleProp, TextStyle } from 'react-native';
import { colors } from '../theme/tokens';
import { type as typeScale } from '../theme/typography';

type Variant = keyof typeof typeScale;

export function AppText({
  variant = 'body',
  color = colors.ink,
  style,
  ...rest
}: TextProps & { variant?: Variant; color?: string; style?: StyleProp<TextStyle> }) {
  return <Text style={[typeScale[variant], { color }, style]} {...rest} />;
}
