import { useState } from 'react';
import { Pressable, Share, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { AppText } from '../../src/components/Text';
import { GlowButton } from '../../src/components/GlowButton';
import { IconLabelAction } from '../../src/components/IconLabelAction';
import { Chip } from '../../src/components/Chip';
import { Celebrate } from '../../src/components/Celebrate';
import { useAuth } from '../../src/auth/AuthContext';
import { useCreateEvent } from '../../src/features/events/hooks';
import { validateEventName } from '../../src/features/events/validate';
import { useReducedMotion } from '../../src/lib/reduceMotion';
import { ApiError } from '../../src/api/errors';
import type { EventCreated, EventType } from '../../src/api/events';
import { colors, radius, role, space, type } from '../../src/theme';

const TYPES: { value: EventType; label: string }[] = [
  { value: 'wedding', label: '💍 Wedding' },
  { value: 'graduation', label: '🎓 Grad' },
  { value: 'iftar', label: '🌙 Iftar' },
  { value: 'birthday', label: '🎂 Birthday' },
  { value: 'trip', label: '🧳 Trip' },
  { value: 'other', label: 'Other' },
];

export default function CreateEvent() {
  const { token } = useAuth();
  const router = useRouter();
  const create = useCreateEvent(token);
  const [name, setName] = useState('');
  const [eventType, setEventType] = useState<EventType | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<EventCreated | null>(null);
  const reduce = useReducedMotion();

  async function submit() {
    const v = validateEventName(name);
    if (!v.ok) return setError(v.error!);
    setError(null);
    try {
      setCreated(await create.mutateAsync({ name: name.trim(), eventType }));
    } catch (e) {
      setError(e instanceof ApiError ? e.friendly : 'Something went off-script. Please try again.');
    }
  }

  const input = {
    ...type.body,
    color: colors.ink,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.md,
    backgroundColor: colors.card,
  } as const;

  // Success: the stub has "printed" — show the code to share.
  if (created) {
    return (
      <Screen style={{ padding: space.xl, gap: space.lg, justifyContent: 'center' }}>
        {!reduce ? <Celebrate play /> : null}
        <AppText variant="display" style={{ textAlign: 'center' }}>It’s live 🎉</AppText>
        <AppText variant="body" color={colors.inkSoft} style={{ textAlign: 'center' }}>
          Share this code so everyone can drop their photos into “{created.name}”.
        </AppText>
        <View
          style={{
            alignItems: 'center',
            backgroundColor: colors.card,
            borderRadius: radius.lg,
            paddingVertical: space.xl,
            borderWidth: 1,
            borderColor: colors.line,
          }}
        >
          <AppText variant="caption" color={colors.inkFaint}>EVENT CODE</AppText>
          <AppText style={{ ...type.display, letterSpacing: 4, color: role.actionDeep }}>
            {created.join_code}
          </AppText>
        </View>
        <GlowButton
          label="Share invite"
          onPress={() =>
            Share.share({ message: `Join my لمّة on Lahza — code ${created.join_code}\n${created.join_link}` })
          }
        />
        <IconLabelAction
          icon="arrow-right"
          label="Open event"
          onPress={() => router.replace(`/(app)/event/${created.id}` as never)}
          tone={role.actionDeep}
        />
      </Screen>
    );
  }

  return (
    <Screen style={{ padding: space.xl, gap: space.lg, justifyContent: 'center' }}>
      <View style={{ alignSelf: 'flex-end' }}>
        <IconLabelAction icon="x" label="Cancel" onPress={() => router.back()} tone={colors.inkSoft} />
      </View>
      <AppText variant="display">Name your لمّة</AppText>
      <AppText variant="body" color={colors.inkSoft}>
        A wedding, a trip, a night out — whatever brought everyone together.
      </AppText>
      <TextInput
        style={input}
        placeholder="e.g. Ziad & Nour’s Wedding"
        placeholderTextColor={colors.inkSoft}
        value={name}
        onChangeText={setName}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {TYPES.map((t) => (
          <Pressable
            key={t.value}
            accessibilityRole="button"
            accessibilityLabel={t.label}
            onPress={() => setEventType(t.value === eventType ? undefined : t.value)}
          >
            <Chip label={t.label} tone={eventType === t.value ? 'identity' : 'neutral'} />
          </Pressable>
        ))}
      </View>
      {error ? <AppText variant="label" color={colors.danger}>{error}</AppText> : null}
      <GlowButton label="Create event" onPress={submit} loading={create.isPending} />
    </Screen>
  );
}
