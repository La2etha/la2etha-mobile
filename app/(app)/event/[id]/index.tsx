import { Pressable, Share, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../../../src/components/Screen';
import { AppText } from '../../../../src/components/Text';
import { GlowButton } from '../../../../src/components/GlowButton';
import { StateView } from '../../../../src/components/StateView';
import { useAuth } from '../../../../src/auth/AuthContext';
import { useEvent } from '../../../../src/features/events/hooks';
import { ApiError } from '../../../../src/api/errors';
import { colors, radius, space } from '../../../../src/theme';

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

      {/* Live actions — staggered in */}
      <ActionCard
        delay={0}
        title="Enroll your face"
        body="Scan once so Lahza can find you in the crowd."
        onPress={() => router.push(`/(app)/event/${event.id}/enroll` as never)}
      />
      <ActionCard
        delay={70}
        title="Add photos"
        body="Drop your shots into the shared pool."
        onPress={() => router.push(`/(app)/event/${event.id}/add` as never)}
      />
      <ActionCard
        delay={140}
        title="Your gallery"
        body="Open a private gallery of only the photos you’re in."
        onPress={() => router.push(`/(app)/event/${event.id}/gallery` as never)}
      />
      <ActionCard
        delay={210}
        title="Search"
        body="Find your photos in plain words — “near the cake”."
        onPress={() => router.push(`/(app)/event/${event.id}/search` as never)}
      />

      {isHost ? (
        <>
          <ActionCard
            delay={280}
            title="Host review"
            body="Promote demoted photos and see the whole pool."
            onPress={() => router.push(`/(app)/event/${event.id}/review` as never)}
          />
          <GlowButton
            label="Share invite"
            onPress={() => Share.share({ message: `Join my لمّة on Lahza — code ${event.join_code}` })}
          />
        </>
      ) : null}
    </Screen>
  );
}

function ActionCard({
  title,
  body,
  onPress,
  delay = 0,
}: {
  title: string;
  body: string;
  onPress: () => void;
  delay?: number;
}) {
  return (
    <Animated.View entering={FadeInDown.duration(380).delay(delay)}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => ({
          backgroundColor: colors.card,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: colors.line,
          padding: space.lg,
          gap: 2,
          opacity: pressed ? 0.95 : 1,
        })}
      >
        <AppText variant="h2">{title}</AppText>
        <AppText variant="caption" color={colors.inkSoft}>{body}</AppText>
      </Pressable>
    </Animated.View>
  );
}
