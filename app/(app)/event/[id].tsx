import { Pressable, Share, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../../src/components/Screen';
import { AppText } from '../../../src/components/Text';
import { GlowButton } from '../../../src/components/GlowButton';
import { StateView } from '../../../src/components/StateView';
import { useAuth } from '../../../src/auth/AuthContext';
import { useEvent } from '../../../src/features/events/hooks';
import { ApiError } from '../../../src/api/errors';
import { colors, radius, space, type } from '../../../src/theme';

// The flow that fills this hub in the next slices — shown as a calm roadmap so
// the screen is honest about what's live vs. coming, never a dead button.
const upcoming = [
  { key: 'enroll', title: 'Enroll your face', body: 'Scan once so Lahza can find you in the crowd.' },
  { key: 'add', title: 'Add photos', body: 'Drop your shots into the shared pool.' },
  { key: 'gallery', title: 'Your gallery', body: 'Open a private gallery of only the photos you’re in.' },
] as const;

export default function EventHub() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token, user } = useAuth();
  const router = useRouter();
  const { data: event, isLoading, isError, error, refetch } = useEvent(id, token);

  if (isLoading) {
    return (
      <Screen>
        <StateView kind="loading" title="Opening the event…" />
      </Screen>
    );
  }
  if (isError || !event) {
    return (
      <Screen>
        <StateView
          kind="error"
          title="Couldn’t open this event"
          message={error instanceof ApiError ? error.friendly : 'Please try again in a moment.'}
          actionLabel="Try again"
          onAction={() => refetch()}
        />
      </Screen>
    );
  }

  const isHost = event.owner_id === user?.id;

  return (
    <Screen style={{ padding: space.xl, gap: space.lg }}>
      <Pressable onPress={() => router.back()} hitSlop={8} style={{ alignSelf: 'flex-start' }}>
        <AppText variant="label" color={colors.inkSoft}>← Events</AppText>
      </Pressable>

      <View>
        <AppText variant="display">{event.name}</AppText>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space.xs }}>
          <AppText variant="caption" color={colors.inkFaint}>CODE</AppText>
          <AppText variant="mono" color={colors.inkSoft}>{event.join_code}</AppText>
          {isHost ? <AppText variant="caption" color={colors.inkFaint}>· you host this</AppText> : null}
        </View>
      </View>

      {isHost ? (
        <GlowButton
          label="Share invite"
          onPress={() => Share.share({ message: `Join my لمّة on Lahza — code ${event.join_code}` })}
        />
      ) : null}

      <View style={{ gap: space.md, marginTop: space.sm }}>
        {upcoming.map((step) => (
          <View
            key={step.key}
            style={{
              backgroundColor: colors.card,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: colors.line,
              padding: space.lg,
              gap: 2,
            }}
          >
            <AppText variant="h2">{step.title}</AppText>
            <AppText variant="caption" color={colors.inkSoft}>{step.body}</AppText>
          </View>
        ))}
        <AppText variant="caption" color={colors.inkFaint} style={{ textAlign: 'center', ...type.caption }}>
          Enroll, photos, and your gallery arrive in the next updates.
        </AppText>
      </View>
    </Screen>
  );
}
