import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../src/auth/AuthContext';
import { Screen } from '../../src/components/Screen';
import { StateView } from '../../src/components/StateView';

export default function AppLayout() {
  const { status } = useAuth();
  if (status === 'loading') {
    return (
      <Screen>
        <StateView kind="loading" title="One moment…" />
      </Screen>
    );
  }
  if (status === 'signedOut') return <Redirect href={'/(auth)/login' as never} />;
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="create" options={{ presentation: 'modal' }} />
      <Stack.Screen name="join" options={{ presentation: 'modal' }} />
      {/* Lightbox is a transparent modal so the gallery shows behind while the
          photo morphs open from its thumbnail. */}
      <Stack.Screen
        name="event/[id]/photo/[photoId]"
        options={{ presentation: 'transparentModal', animation: 'none' }}
      />
      {/* event/[id] and its other children auto-discover with default options */}
    </Stack>
  );
}
