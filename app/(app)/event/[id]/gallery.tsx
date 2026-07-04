import { useEffect, useState } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../../../src/components/Screen';
import { AppText } from '../../../../src/components/Text';
import { StateView } from '../../../../src/components/StateView';
import { PhotoCard } from '../../../../src/components/PhotoCard';
import { CountUp } from '../../../../src/components/CountUp';
import { useAuth } from '../../../../src/auth/AuthContext';
import { useReducedMotion } from '../../../../src/lib/reduceMotion';
import { useGallery } from '../../../../src/features/gallery/hooks';
import { partitionGallery } from '../../../../src/features/gallery/partition';
import { ApiError } from '../../../../src/api/errors';
import { colors, space } from '../../../../src/theme';

export default function Gallery() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const router = useRouter();
  const reduce = useReducedMotion();
  const { width } = useWindowDimensions();
  const { data, isLoading, isError, error, refetch, isRefetching } = useGallery(id, token);
  const [showDemoted, setShowDemoted] = useState(false);

  const { main, demoted } = partitionGallery(data?.items ?? []);
  const cell = Math.floor((width - space.xl * 2) / 3);

  // Gentle stamp-thunk the first time a non-empty gallery unlocks.
  useEffect(() => {
    if (!isLoading && main.length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, main.length > 0]);

  if (isLoading) {
    return (
      <Screen>
        <StateView kind="loading" title="Opening your gallery…" />
      </Screen>
    );
  }
  if (isError) {
    return (
      <Screen>
        <StateView
          kind="error"
          title="Couldn’t open your gallery"
          message={error instanceof ApiError ? error.friendly : 'Please try again in a moment.'}
          actionLabel="Try again"
          onAction={() => refetch()}
        />
      </Screen>
    );
  }

  const openPhoto = (photoId: string, rect?: { x: number; y: number; w: number; h: number }) => {
    const q = rect
      ? `?ox=${Math.round(rect.x)}&oy=${Math.round(rect.y)}&ow=${Math.round(rect.w)}&oh=${Math.round(rect.h)}`
      : '';
    router.push(`/(app)/event/${id}/photo/${photoId}${q}` as never);
  };

  if (main.length === 0 && demoted.length === 0) {
    return (
      <Screen>
        <StateView
          kind="empty"
          title="No photos of you yet"
          message="Enroll your face so Lahza can find you — or you may just not be in any photos yet."
          actionLabel="Enroll your face"
          onAction={() => router.replace(`/(app)/event/${id}/enroll` as never)}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <FlashList
        data={main}
        keyExtractor={(item) => item.photo_id}
        numColumns={3}
        onRefresh={refetch}
        refreshing={isRefetching}
        contentContainerStyle={{ paddingHorizontal: space.xl, paddingBottom: space.xxl }}
        ListHeaderComponent={
          <View style={{ paddingTop: space.md, paddingBottom: space.lg }}>
            <Pressable onPress={() => router.back()} hitSlop={8} style={{ marginBottom: space.md }}>
              <AppText variant="label" color={colors.inkSoft}>← Event</AppText>
            </Pressable>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space.sm }}>
              {/* Unlock bloom */}
              <MotiView
                from={{ opacity: reduce ? 1 : 0, scale: reduce ? 1 : 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'timing', duration: reduce ? 0 : 500 }}
                style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space.sm }}
              >
                <CountUp to={main.length} reduceMotion={reduce} />
                <AppText variant="h2" color={colors.inkSoft} style={{ paddingBottom: 4 }}>
                  {main.length === 1 ? 'photo of you' : 'photos of you'}
                </AppText>
              </MotiView>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <PhotoCard
            photoId={item.photo_id}
            token={token!}
            size={cell}
            reduceMotion={reduce}
            onPress={(rect) => openPhoto(item.photo_id, rect)}
          />
        )}
        ListFooterComponent={
          demoted.length > 0 ? (
            <View style={{ marginTop: space.lg }}>
              <Pressable
                onPress={() => setShowDemoted((s) => !s)}
                style={{ paddingVertical: space.md, flexDirection: 'row', justifyContent: 'space-between' }}
              >
                <AppText variant="label" color={colors.inkSoft}>
                  Maybe not you ({demoted.length})
                </AppText>
                <AppText variant="label" color={colors.inkFaint}>{showDemoted ? 'Hide' : 'Show'}</AppText>
              </Pressable>
              {showDemoted ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {demoted.map((item) => (
                    <PhotoCard
                      key={item.photo_id}
                      photoId={item.photo_id}
                      token={token!}
                      size={cell}
                      reduceMotion={reduce}
                      onPress={(rect) => openPhoto(item.photo_id, rect)}
                    />
                  ))}
                </View>
              ) : null}
            </View>
          ) : null
        }
      />
    </Screen>
  );
}
