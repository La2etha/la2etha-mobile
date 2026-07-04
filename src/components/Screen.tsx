import { SafeAreaView } from 'react-native-safe-area-context';
import { View, ViewProps } from 'react-native';
import { colors } from '../theme/tokens';

export function Screen({ style, children, ...rest }: ViewProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }}>
      <View style={[{ flex: 1 }, style]} {...rest}>
        {children}
      </View>
    </SafeAreaView>
  );
}
