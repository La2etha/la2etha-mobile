import { FlatList, RefreshControl, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../../src/components/Screen';
import { AppText } from '../../../src/components/Text';
import { StateView } from '../../../src/components/StateView';
import { EmptyState } from '../../../src/components/EmptyState';
import { EventPass } from '../../../src/components/EventPass';
import { useAuth } from '../../../src/auth/AuthContext';
import { useEvents } from '../../../src/features/events/hooks';
import { ApiError } from '../../../src/api/errors';
import { colors, space } from '../../../src/theme';

export default function EventsHome() {
  const { user, token } = useAuth();
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
        <EmptyState
          art="offline"
          title="Couldn’t load your events"
          body={error instanceof ApiError ? error.friendly : 'Please try again in a moment.'}
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
          <View style={{ marginBottom: space.xl }}>
            <AppText variant="display">Ahlan, {user?.name ?? 'friend'}</AppText>
            <AppText variant="body" color={colors.inkSoft}>Your لمّات live here.</AppText>
          </View>
        }
        renderItem={({ item }) => (
          <EventPass event={item} token={token!} onOpen={() => router.push(`/(app)/event/${item.id}` as never)} />
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
    </Screen>
  );
}
