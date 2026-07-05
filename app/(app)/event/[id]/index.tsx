import { Share, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../../../src/components/Screen';
import { AppText } from '../../../../src/components/Text';
import { IconLabelAction } from '../../../../src/components/IconLabelAction';
import { GlowButton } from '../../../../src/components/GlowButton';
import { StateView } from '../../../../src/components/StateView';
import { EmptyState } from '../../../../src/components/EmptyState';
import { useAuth } from '../../../../src/auth/AuthContext';
import { useEnrolled, useEvent } from '../../../../src/features/events/hooks';
import { decideEventNav } from '../../../../src/features/events/eventNav';
import { useReducedMotion } from '../../../../src/lib/reduceMotion';
import { ApiError } from '../../../../src/api/errors';
import { colors, radius, role, space } from '../../../../src/theme';

// Pre-enroll launcher (FR-003): once decideEventNav says "tabbed", the tabbed
// shell at (tabs)/gallery takes over and this screen is never seen again for
// this event.
export default function EventHub() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token, user } = useAuth();
  const router = useRouter();
  const { data: event, isLoading, isError, error, refetch } = useEvent(id, token);
  const { data: enrolled, isLoading: enrolledLoading } = useEnrolled(id);

  if (!enrolledLoading && decideEventNav({ enrolled: !!enrolled }) === 'tabbed') {
    return <Redirect href={`/(app)/event/${id}/(tabs)/gallery` as never} />;
  }

  if (isLoading || enrolledLoading) {
    return (
      <Screen>
        <StateView kind="loading" title="Opening the event…" />
      </Screen>
    );
  }
  if (isError || !event) {
    return (
      <Screen>
        <EmptyState
          art="offline"
          title="Couldn’t open this event"
          body={error instanceof ApiError ? error.friendly : 'Please try again in a moment.'}
          actionLabel="Try again"
          onAction={() => refetch()}
        />
      </Screen>
    );
  }

  const isHost = event.owner_id === user?.id;

  return (
    <Screen style={{ padding: space.xl, gap: space.lg }}>
      <View style={{ alignSelf: 'flex-start' }}>
        <IconLabelAction icon="arrow-left" label="Events" onPress={() => router.back()} tone={colors.inkSoft} />
      </View>

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
        icon="aperture"
        title="Enroll your face"
        body="Scan once so Lahza can find you in the crowd."
        onPress={() => router.push(`/(app)/event/${event.id}/enroll` as never)}
      />
      <ActionCard
        delay={70}
        icon="upload"
        title="Add photos"
        body="Drop your shots into the shared pool."
        onPress={() => router.push(`/(app)/event/${event.id}/add` as never)}
      />
      <ActionCard
        delay={140}
        icon="image"
        title="Your gallery"
        body="Open a private gallery of only the photos you’re in."
        onPress={() => router.push(`/(app)/event/${event.id}/gallery` as never)}
      />
      <ActionCard
        delay={210}
        icon="search"
        title="Search"
        body="Find your photos in plain words — “near the cake”."
        onPress={() => router.push(`/(app)/event/${event.id}/search` as never)}
      />

      {isHost ? (
        <>
          <ActionCard
            delay={280}
            icon="check-circle"
            title="Host review"
            body="Promote demoted photos and see the whole pool."
            onPress={() => router.push(`/(app)/event/${event.id}/review` as never)}
          />
          <ActionCard
            delay={350}
            icon="sliders"
            title="Members & settings"
            body="Manage who's in, and how this event works."
            onPress={() => router.push(`/(app)/event/${event.id}/settings` as never)}
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
  icon,
  title,
  body,
  onPress,
  delay = 0,
}: {
  icon: keyof typeof import('@expo/vector-icons').Feather.glyphMap;
  title: string;
  body: string;
  onPress: () => void;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <Animated.View entering={FadeInDown.duration(reduce ? 0 : 380).delay(reduce ? 0 : delay)}>
      <View style={{ gap: 2 }}>
        <IconLabelAction icon={icon} label={title} onPress={onPress} variant="card" tone={role.actionDeep} />
        <AppText variant="caption" color={colors.inkSoft} style={{ paddingHorizontal: space.lg }}>
          {body}
        </AppText>
      </View>
    </Animated.View>
  );
}
