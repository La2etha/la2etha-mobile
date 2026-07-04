import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { AppText } from '../../src/components/Text';
import { GlowButton } from '../../src/components/GlowButton';
import { useAuth } from '../../src/auth/AuthContext';
import { useJoinEvent } from '../../src/features/events/hooks';
import { validateJoinCode } from '../../src/features/events/validate';
import { ApiError } from '../../src/api/errors';
import { colors, radius, space, type } from '../../src/theme';

export default function JoinEvent() {
  const { token } = useAuth();
  const router = useRouter();
  const join = useJoinEvent(token);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    const v = validateJoinCode(code);
    if (!v.ok) return setError(v.error!);
    setError(null);
    try {
      const event = await join.mutateAsync(code);
      router.replace(`/(app)/event/${event.id}` as never);
    } catch (e) {
      // 404 = code not found; keep it friendly, not "not allowed".
      const msg =
        e instanceof ApiError
          ? e.status === 404
            ? 'We couldn’t find an event with that code. Double-check it with your host.'
            : e.friendly
          : 'Something went off-script. Please try again.';
      setError(msg);
    }
  }

  const input = {
    ...type.display,
    fontSize: 28,
    letterSpacing: 6,
    textAlign: 'center' as const,
    color: colors.ink,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.md,
    backgroundColor: colors.card,
  } as const;

  return (
    <Screen style={{ padding: space.xl, gap: space.lg, justifyContent: 'center' }}>
      <Pressable onPress={() => router.back()} style={{ alignSelf: 'flex-end' }} hitSlop={8}>
        <AppText variant="label" color={colors.inkSoft}>Cancel</AppText>
      </Pressable>
      <AppText variant="display">Join a لمّة</AppText>
      <AppText variant="body" color={colors.inkSoft}>
        Enter the code your host shared to see the photos you’re in.
      </AppText>
      <TextInput
        style={input}
        placeholder="ABC123"
        placeholderTextColor={colors.inkFaint}
        value={code}
        onChangeText={(t) => setCode(t.toUpperCase())}
        autoCapitalize="characters"
        autoCorrect={false}
        autoFocus
        returnKeyType="go"
        onSubmitEditing={submit}
      />
      {error ? <AppText variant="label" color={colors.danger}>{error}</AppText> : null}
      <View style={{ height: space.sm }} />
      <GlowButton label="Join event" onPress={submit} loading={join.isPending} />
    </Screen>
  );
}
