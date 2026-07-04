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
      <Stack.Screen name="index" />
      <Stack.Screen name="create" options={{ presentation: 'modal' }} />
      <Stack.Screen name="join" options={{ presentation: 'modal' }} />
      {/* event/[id] and its enroll/add children auto-discover with default options */}
    </Stack>
  );
}
