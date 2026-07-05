import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/auth/AuthContext';
import { queryClient } from '../src/lib/query';
import { useAppFonts } from '../src/theme';

export default function RootLayout() {
  const fontsReady = useAppFonts();
  if (!fontsReady) return null; // the splash frame covers this brief moment

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <StatusBar style="dark" />
            {/* Explicit initialRouteName: without it, having (app) as the only
                statically-configured Stack.Screen made React Navigation treat
                it as the initial route, skipping index/splash entirely. */}
            <Stack initialRouteName="index" screenOptions={{ headerShown: false, animation: 'fade' }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(app)" options={{ animation: 'slide_from_bottom' }} />
            </Stack>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
