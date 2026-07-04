import { FlatList, Pressable, RefreshControl, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { AppText } from '../../src/components/Text';
import { GlowButton } from '../../src/components/GlowButton';
import { StateView } from '../../src/components/StateView';
import { TicketStub } from '../../src/components/TicketStub';
import { useAuth } from '../../src/auth/AuthContext';
import { useEvents } from '../../src/features/events/hooks';
import { ApiError } from '../../src/api/errors';
import { colors, space } from '../../src/theme';

export default function EventsHome() {
  const { user, token, signOut } = useAuth();
  const router = useRouter();
  const { data, isLoading, isError, error, refetch, isRefetching } = useEvents(token);

  if (isLoading) {
    return (
      <Screen>
        <StateView kind="loading" title="Gathering your لمّات…" />
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen>
        <StateView
          kind="error"
          title="Couldn’t load your events"
          message={error instanceof ApiError ? error.friendly : 'Please try again in a moment.'}
          actionLabel="Try again"
          onAction={() => refetch()}
        />
      </Screen>
    );
  }

  const events = data ?? [];

  return (
    <Screen>
      <FlatList
        data={events}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ padding: space.xl, paddingBottom: space.xxl, gap: 0 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.inkSoft} />
        }
        ListHeaderComponent={
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: space.xl }}>
            <View style={{ flex: 1, paddingRight: space.md }}>
              <AppText variant="display">Ahlan, {user?.name ?? 'friend'}</AppText>
              <AppText variant="body" color={colors.inkSoft}>Your لمّات live here.</AppText>
            </View>
            {/* ponytail: temporary sign-out until the Profile tab lands in Slice 5 */}
            <Pressable onPress={signOut} hitSlop={8} accessibilityRole="button">
              <AppText variant="label" color={colors.inkSoft}>Sign out</AppText>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <TicketStub event={item} onPress={() => router.push(`/(app)/event/${item.id}` as never)} />
        )}
        ListEmptyComponent={
          <View style={{ paddingTop: space.xxl, alignItems: 'center', gap: space.sm }}>
            <AppText variant="h1" style={{ textAlign: 'center' }}>No لمّة yet</AppText>
            <AppText variant="body" color={colors.inkSoft} style={{ textAlign: 'center' }}>
              Start one and share the code, or join a friend’s with theirs.
            </AppText>
          </View>
        }
      />

      {/* Action bar: one primary (Create), one secondary (Join) — §8.6 */}
      <View style={{ padding: space.xl, gap: space.md, borderTopWidth: 1, borderTopColor: colors.line }}>
        <GlowButton label="Create an event" onPress={() => router.push('/(app)/create' as never)} />
        <Pressable
          onPress={() => router.push('/(app)/join' as never)}
          accessibilityRole="button"
          style={{ alignItems: 'center', paddingVertical: space.sm }}
        >
          <AppText variant="label" color={colors.stamp}>Join with a code</AppText>
        </Pressable>
      </View>
    </Screen>
  );
}
