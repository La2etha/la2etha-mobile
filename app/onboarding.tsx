import { useRef, useState } from 'react';
import { FlatList, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../src/components/Screen';
import { AppText } from '../src/components/Text';
import { GlowButton } from '../src/components/GlowButton';
import { IconLabelAction } from '../src/components/IconLabelAction';
import { firstRun } from '../src/lib/firstRun';
import { slides } from '../src/features/onboarding/slides';
import { colors, role, space } from '../src/theme';

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const ref = useRef<FlatList>(null);
  const [i, setI] = useState(0);
  const last = i === slides.length - 1;

  async function finish(dest: '/(auth)/register' | '/(auth)/login') {
    await firstRun.complete();
    router.replace(dest as never);
  }
  function next() {
    if (last) finish('/(auth)/register');
    else ref.current?.scrollToIndex({ index: i + 1 });
  }

  return (
    <Screen>
      <View style={{ alignSelf: 'flex-end' }}>
        <IconLabelAction icon="chevrons-right" label="Skip" onPress={() => finish('/(auth)/login')} tone={colors.inkSoft} />
      </View>

      <FlatList
        ref={ref}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(s) => s.key}
        onMomentumScrollEnd={(e) => setI(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={{ width, padding: space.xl, gap: space.md, justifyContent: 'center' }}>
            <AppText variant="display">{item.title}</AppText>
            <AppText variant="body" color={colors.inkSoft}>
              {item.body}
            </AppText>
          </View>
        )}
      />

      <View style={{ flexDirection: 'row', gap: space.sm, justifyContent: 'center', marginBottom: space.lg }}>
        {slides.map((s, idx) => (
          <View
            key={s.key}
            style={{
              width: idx === i ? 22 : 7,
              height: 7,
              borderRadius: 7,
              backgroundColor: idx === i ? role.activeNav : colors.line,
            }}
          />
        ))}
      </View>

      <View style={{ padding: space.xl, paddingTop: 0 }}>
        <GlowButton label={last ? 'Get started' : 'Next'} onPress={next} />
      </View>
    </Screen>
  );
}
