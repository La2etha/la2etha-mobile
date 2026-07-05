import { SafeAreaView } from 'react-native-safe-area-context';
import { View, ViewProps } from 'react-native';
import { Logo } from './Logo';
import { colors, space } from '../theme/tokens';

type ScreenProps = ViewProps & {
  /** Small brand mark in the standard top-left spot, present by default so the
   *  logo shows up somewhere on every screen. Turn off on screens that already
   *  feature the logo prominently (splash, login, register). */
  logo?: boolean;
};

export function Screen({ style, logo = true, children, ...rest }: ScreenProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }}>
      {logo ? (
        <View style={{ paddingTop: space.sm, paddingHorizontal: space.xl, paddingBottom: space.sm }}>
          {/* The square asset (logo.png) is a 1024x1024 canvas with the mark
           *  occupying a thin strip in the middle — rendering it "square" at a
           *  small size shows mostly transparent padding. The wordmark asset is
           *  tightly trimmed, so it reads clearly even compact. */}
          <Logo wordmark size={100} />
        </View>
      ) : null}
      <View style={[{ flex: 1 }, style]} {...rest}>
        {children}
      </View>
    </SafeAreaView>
  );
}
