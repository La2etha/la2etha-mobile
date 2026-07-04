import { useEffect, useState } from 'react';
import { View, AccessibilityInfo } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { Screen } from '../src/components/Screen';
import { Logo } from '../src/components/Logo';
import { useAuth } from '../src/auth/AuthContext';
import { firstRun } from '../src/lib/firstRun';
import { decideBootRoute } from '../src/boot/route';
import { colors } from '../src/theme';

// An orange focus-bracket corner (the logo's scan motif) that draws inward.
function Corner({ pos, reduce }: { pos: 'tl' | 'tr' | 'bl' | 'br'; reduce: boolean }) {
  const isTop = pos === 'tl' || pos === 'tr';
  const isLeft = pos === 'tl' || pos === 'bl';
  const from = { x: isLeft ? -14 : 14, y: isTop ? -14 : 14 };
  return (
    <MotiView
      from={{ opacity: 0, translateX: reduce ? 0 : from.x, translateY: reduce ? 0 : from.y }}
      animate={{ opacity: 1, translateX: 0, translateY: 0 }}
      transition={{ type: 'timing', duration: reduce ? 0 : 700, delay: reduce ? 0 : 420 }}
      style={{
        position: 'absolute',
        width: 26,
        height: 26,
        [isTop ? 'top' : 'bottom']: 0,
        [isLeft ? 'left' : 'right']: 0,
        borderColor: colors.stamp,
        borderTopWidth: isTop ? 3 : 0,
        borderBottomWidth: isTop ? 0 : 3,
        borderLeftWidth: isLeft ? 3 : 0,
        borderRightWidth: isLeft ? 0 : 3,
        borderTopLeftRadius: pos === 'tl' ? 8 : 0,
        borderTopRightRadius: pos === 'tr' ? 8 : 0,
        borderBottomLeftRadius: pos === 'bl' ? 8 : 0,
        borderBottomRightRadius: pos === 'br' ? 8 : 0,
      }}
    />
  );
}

export default function Splash() {
  const { status } = useAuth();
  const router = useRouter();
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduce);
  }, []);

  useEffect(() => {
    if (status === 'loading') return;
    let cancelled = false;
    // Always hold for a brand beat once auth resolves. Reduced motion disables the
    // animation (below), not the splash itself — the moment still shows.
    const t = setTimeout(async () => {
      const fr = await firstRun.get();
      const dest = decideBootRoute({ status, firstRun: fr });
      if (!cancelled) router.replace(dest as never);
    }, 1800);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [status]);

  return (
    <Screen style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper }}>
      <View style={{ width: 168, height: 168, alignItems: 'center', justifyContent: 'center' }}>
        <Corner pos="tl" reduce={reduce} />
        <Corner pos="tr" reduce={reduce} />
        <Corner pos="bl" reduce={reduce} />
        <Corner pos="br" reduce={reduce} />
        <MotiView
          from={{ opacity: 0, scale: reduce ? 1 : 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: reduce ? 0 : 800 }}
        >
          <Logo size={132} />
        </MotiView>
      </View>
    </Screen>
  );
}
