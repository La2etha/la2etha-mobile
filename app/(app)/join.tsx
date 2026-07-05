import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { AppText } from '../../src/components/Text';
import { GlowButton } from '../../src/components/GlowButton';
import { IconLabelAction } from '../../src/components/IconLabelAction';
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
  const [pending, setPending] = useState(false);

  async function submit() {
    const v = validateJoinCode(code);
    if (!v.ok) return setError(v.error!);
    setError(null);
    try {
      const result = await join.mutateAsync(code);
      if (result.status === 'pending') {
        setPending(true); // join_approval is on — wait for the host, no content yet
        return;
      }
      router.replace(`/(app)/event/${result.event!.id}` as never);
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

  if (pending) {
    // join_approval is on for this event — no content until the host approves.
    return (
      <Screen style={{ padding: space.xl, gap: space.lg, justifyContent: 'center' }}>
        <AppText variant="display" style={{ textAlign: 'center' }}>Waiting for the host</AppText>
        <AppText variant="body" color={colors.inkSoft} style={{ textAlign: 'center' }}>
          This event needs the host to let you in. You’ll see it in your events list once
          they approve.
        </AppText>
        <GlowButton label="Done" onPress={() => router.replace('/(app)' as never)} />
      </Screen>
    );
  }

  return (
    <Screen style={{ padding: space.xl, gap: space.lg, justifyContent: 'center' }}>
      <View style={{ alignSelf: 'flex-end' }}>
        <IconLabelAction icon="x" label="Cancel" onPress={() => router.back()} tone={colors.inkSoft} />
      </View>
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
