import { Pressable, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../../../src/components/Screen';
import { AppText } from '../../../../src/components/Text';
import { StateView } from '../../../../src/components/StateView';
import { PhotoCard } from '../../../../src/components/PhotoCard';
import { useAuth } from '../../../../src/auth/AuthContext';
import { useDemoted, usePool, usePromote } from '../../../../src/features/host/hooks';
import { uniqueDemotedPhotos } from '../../../../src/features/host/dedupe';
import { ApiError } from '../../../../src/api/errors';
import { colors, radius, space } from '../../../../src/theme';

const REASON_LABEL: Record<string, string> = {
  blurry: 'Looked blurry',
  background: 'You were in the background',
  quality: 'Low quality',
};

export default function HostReview() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const router = useRouter();
  const demoted = useDemoted(id, token);
  const pool = usePool(id, token);
  const promote = usePromote(id, token);

  if (demoted.isLoading) {
    return (
      <Screen>
        <StateView kind="loading" title="Loading review…" />
      </Screen>
    );
  }
  if (demoted.isError) {
    const forbidden = demoted.error instanceof ApiError && demoted.error.status === 403;
    return (
      <Screen>
        <StateView
          kind="error"
          title={forbidden ? 'Hosts only' : 'Couldn’t load review'}
          message={
            forbidden
              ? 'Only the event host can review demoted photos.'
              : demoted.error instanceof ApiError
                ? demoted.error.friendly
                : 'Please try again in a moment.'
          }
          actionLabel="Back"
          onAction={() => router.back()}
        />
      </Screen>
    );
  }

  const items = uniqueDemotedPhotos(demoted.data ?? []);

  return (
    <Screen>
      <FlashList
        data={items}
        keyExtractor={(i) => i.photo_id}
        contentContainerStyle={{ padding: space.xl, paddingBottom: space.xxl }}
        ListHeaderComponent={
          <View style={{ marginBottom: space.lg }}>
            <Pressable onPress={() => router.back()} hitSlop={8} style={{ marginBottom: space.md }}>
              <AppText variant="label" color={colors.inkSoft}>← Event</AppText>
            </Pressable>
            <AppText variant="display">Host review</AppText>
            <AppText variant="body" color={colors.inkSoft}>
              {pool.data ? `${pool.data.length} photos in the pool. ` : ''}
              Demoted photos are hidden in members’ “maybe not you” section — promote any that belong in the main gallery.
            </AppText>
          </View>
        }
        ListEmptyComponent={
          <View style={{ paddingTop: space.xl, alignItems: 'center' }}>
            <AppText variant="h2" style={{ textAlign: 'center' }}>Nothing demoted</AppText>
            <AppText variant="caption" color={colors.inkFaint} style={{ textAlign: 'center' }}>
              Every photo is sitting in members’ main galleries.
            </AppText>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: 'row',
              gap: space.md,
              alignItems: 'center',
              backgroundColor: colors.card,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: colors.line,
              padding: space.sm,
              marginBottom: space.md,
            }}
          >
            <PhotoCard photoId={item.photo_id} token={token!} size={72} />
            <View style={{ flex: 1 }}>
              <AppText variant="label">{REASON_LABEL[item.demote_reason ?? ''] ?? 'Demoted'}</AppText>
            </View>
            <Pressable
              onPress={() => promote.mutate(item.photo_id)}
              disabled={promote.isPending}
              style={{
                backgroundColor: colors.stamp,
                borderRadius: radius.md,
                paddingHorizontal: space.lg,
                paddingVertical: space.sm,
              }}
            >
              <AppText variant="label" color={colors.paper}>Promote</AppText>
            </Pressable>
          </View>
        )}
      />
    </Screen>
  );
}
