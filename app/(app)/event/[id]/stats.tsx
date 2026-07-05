import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../../../src/components/Screen';
import { AppText } from '../../../../src/components/Text';
import { StateView } from '../../../../src/components/StateView';
import { EmptyState } from '../../../../src/components/EmptyState';
import { IconLabelAction } from '../../../../src/components/IconLabelAction';
import { useAuth } from '../../../../src/auth/AuthContext';
import { useStats } from '../../../../src/features/events/hooks';
import { ApiError } from '../../../../src/api/errors';
import { colors, radius, space } from '../../../../src/theme';

/** Host-only stats screen (spec 004 US4), following the host-gated pattern of
 *  review.tsx: counts + per-member appearance coverage. Unclaimed clusters
 *  show as a count only — never itemized (R7 anonymity by construction). */
export default function Stats() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const router = useRouter();
  const stats = useStats(id, token);

  if (stats.isLoading) {
    return (
      <Screen>
        <StateView kind="loading" title="Crunching the numbers…" />
      </Screen>
    );
  }
  if (stats.isError || !stats.data) {
    const forbidden = stats.error instanceof ApiError && stats.error.status === 403;
    return (
      <Screen>
        <EmptyState
          art={forbidden ? 'permission' : 'offline'}
          title={forbidden ? 'Hosts only' : 'Couldn’t load stats'}
          body={
            forbidden
              ? 'Only the event host can see event stats.'
              : stats.error instanceof ApiError
                ? stats.error.friendly
                : 'Please try again in a moment.'
          }
          actionLabel="Back"
          onAction={() => router.back()}
        />
      </Screen>
    );
  }

  const s = stats.data;

  return (
    <Screen>
      <FlashList
        data={s.members}
        keyExtractor={(m) => m.account_id}
        contentContainerStyle={{ padding: space.xl, paddingBottom: space.xxl }}
        ListHeaderComponent={
          <View style={{ marginBottom: space.lg, gap: space.md }}>
            <View style={{ alignSelf: 'flex-start' }}>
              <IconLabelAction icon="arrow-left" label="Event" onPress={() => router.back()} tone={colors.inkSoft} />
            </View>
            <AppText variant="display">Event stats</AppText>
            {s.processing ? (
              <AppText variant="caption" color={colors.inkFaint}>
                Still processing new photos — counts will update shortly.
              </AppText>
            ) : null}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.lg }}>
              <Stat label="Photos" value={s.photo_count} />
              <Stat label="People found" value={s.cluster_count} />
              <Stat label="Enrolled" value={s.enrolled_count} />
              <Stat label="Unclaimed" value={s.unclaimed_count} />
            </View>
            <AppText variant="label" color={colors.inkSoft}>Member coverage</AppText>
          </View>
        }
        ListEmptyComponent={
          <AppText variant="caption" color={colors.inkFaint}>No members yet.</AppText>
        }
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: colors.card,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: colors.line,
              padding: space.md,
              marginBottom: space.sm,
            }}
          >
            <View>
              <AppText variant="label">{item.name}</AppText>
              <AppText variant="caption" color={colors.inkFaint}>
                {item.enrolled ? 'Enrolled' : 'Not enrolled'}
              </AppText>
            </View>
            <AppText variant="mono" color={colors.inkSoft}>{item.appearance_count} photos</AppText>
          </View>
        )}
      />
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={{ minWidth: 96 }}>
      <AppText variant="h2">{value}</AppText>
      <AppText variant="caption" color={colors.inkFaint}>{label}</AppText>
    </View>
  );
}
