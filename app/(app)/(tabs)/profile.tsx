import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { AppText } from '../../src/components/Text';
import { GlowButton } from '../../src/components/GlowButton';
import { Logo } from '../../src/components/Logo';
import { useAuth } from '../../src/auth/AuthContext';
import { deleteIdentity } from '../../src/api/auth';
import { colors, radius, space } from '../../src/theme';

export default function Profile() {
  const { user, token, signOut } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  async function removeIdentity() {
    setBusy(true);
    try {
      await deleteIdentity(token!);
      await qc.invalidateQueries(); // galleries are now empty
      Alert.alert('Face data deleted', 'You’ve been removed from every gallery. You can enroll again anytime.');
    } catch {
      Alert.alert('Couldn’t delete', 'Please try again in a moment.');
    } finally {
      setBusy(false);
    }
  }

  function confirmDelete() {
    Alert.alert(
      'Delete your face data?',
      'This removes you from every gallery and deletes your face signature. Your account stays.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: removeIdentity },
      ]
    );
  }

  return (
    <Screen style={{ padding: space.xl, gap: space.lg }}>
      <Pressable onPress={() => router.back()} hitSlop={8} style={{ alignSelf: 'flex-start' }}>
        <AppText variant="label" color={colors.inkSoft}>← Back</AppText>
      </Pressable>

      <View style={{ alignItems: 'center', gap: space.xs, marginTop: space.lg }}>
        <Logo size={72} />
        <AppText variant="display">{user?.name ?? 'You'}</AppText>
        <AppText variant="caption" color={colors.inkFaint}>{user?.email}</AppText>
      </View>

      <View style={{ flex: 1 }} />

      <View style={{ gap: space.md }}>
        <Pressable
          onPress={confirmDelete}
          disabled={busy}
          style={{
            padding: space.lg,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: colors.danger,
            alignItems: 'center',
            opacity: busy ? 0.5 : 1,
          }}
        >
          <AppText variant="label" color={colors.danger}>
            {busy ? 'Deleting…' : 'Delete my face data'}
          </AppText>
        </Pressable>
        <GlowButton label="Sign out" onPress={signOut} />
      </View>
    </Screen>
  );
}
