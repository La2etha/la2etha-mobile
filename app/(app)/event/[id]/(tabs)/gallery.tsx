import { useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View, useWindowDimensions } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../../../../src/components/Screen';
import { AppText } from '../../../../../src/components/Text';
import { StateView } from '../../../../../src/components/StateView';
import { EmptyState } from '../../../../../src/components/EmptyState';
import { PhotoCard } from '../../../../../src/components/PhotoCard';
import { IconLabelAction } from '../../../../../src/components/IconLabelAction';
import { Chip } from '../../../../../src/components/Chip';
import { CountUp } from '../../../../../src/components/CountUp';
import { Celebrate } from '../../../../../src/components/Celebrate';
import { useAuth } from '../../../../../src/auth/AuthContext';
import { useReducedMotion } from '../../../../../src/lib/reduceMotion';
import { useGallery } from '../../../../../src/features/gallery/hooks';
import { usePool } from '../../../../../src/features/host/hooks';
import { useEvent, useHighlights } from '../../../../../src/features/events/hooks';
import { partitionGallery, bestOfYouIds } from '../../../../../src/features/gallery/partition';
import { HighlightsStrip } from '../../../../../src/components/HighlightsStrip';
import { ApiError } from '../../../../../src/api/errors';
import { colors, space } from '../../../../../src/theme';

type ViewMode = 'mine' | 'everyone';

export default function Gallery() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const router = useRouter();
  const reduce = useReducedMotion();
  const { width } = useWindowDimensions();
  const { data, isLoading, isError, error, refetch, isRefetching } = useGallery(id, token);
  const eventQ = useEvent(id, token);
  const highlightsQ = useHighlights(id, token);
  const [showDemoted, setShowDemoted] = useState(false);
  const [celebrated, setCelebrated] = useState(false);
  const [view, setView] = useState<ViewMode>('mine');

  const { main, demoted } = partitionGallery(data?.items ?? []);
  const bestIds = bestOfYouIds(main);
  const cell = Math.floor((width - space.xl * 2) / 3);
  // Everyone-sees-all (spec 005 US5): the host opted the whole event pool into
  // browsing, on top of each member's own "photos of you" gallery.
  const everyoneAllowed = eventQ.data?.gallery_visibility === 'everyone_sees_all';

  // Gentle stamp-thunk + one-shot celebration the first time a non-empty gallery unlocks.
  useEffect(() => {
    if (!isLoading && main.length > 0 && !celebrated) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCelebrated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, main.length > 0]);

  const openPhoto = (photoId: string, rect?: { x: number; y: number; w: number; h: number }) => {
    const q = rect
      ? `?ox=${Math.round(rect.x)}&oy=${Math.round(rect.y)}&ow=${Math.round(rect.w)}&oh=${Math.round(rect.h)}`
      : '';
    router.push(`/(app)/event/${id}/photo/${photoId}${q}` as never);
  };

  const viewSwitch = everyoneAllowed ? (
    <View style={{ flexDirection: 'row', gap: space.sm, paddingHorizontal: space.xl, paddingTop: space.md }}>
      <Pressable onPress={() => setView('mine')}>
        <Chip label="Your photos" tone={view === 'mine' ? 'identity' : 'neutral'} />
      </Pressable>
      <Pressable onPress={() => setView('everyone')}>
        <Chip label="Everyone" tone={view === 'everyone' ? 'identity' : 'neutral'} />
      </Pressable>
    </View>
  ) : null;

  if (view === 'everyone') {
    return (
      <EveryonePool
        eventId={id}
        token={token!}
        cell={cell}
        reduce={reduce}
        header={viewSwitch}
        onOpen={openPhoto}
      />
    );
  }

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
        <EmptyState
          art="offline"
          title="Couldn’t open your gallery"
          body={error instanceof ApiError ? error.friendly : 'Please try again in a moment.'}
          actionLabel="Try again"
          onAction={() => refetch()}
        />
      </Screen>
    );
  }

  if (main.length === 0 && demoted.length === 0) {
    return (
      <Screen>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.inkSoft} />
          }
        >
          {viewSwitch}
          <EmptyState
            art="gallery"
            title="No photos of you yet"
            body="You may just not be in any photos yet — check back once more get uploaded."
          />
        </ScrollView>
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
          <View style={{ paddingBottom: space.lg }}>
            {viewSwitch}
            <HighlightsStrip highlights={highlightsQ.data} token={token!} onOpen={(photoId) => openPhoto(photoId)} />
            <View style={{ paddingTop: space.md }}>
              {celebrated && !reduce ? <Celebrate play /> : null}
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
          </View>
        }
        renderItem={({ item }) => (
          <PhotoCard
            photoId={item.photo_id}
            token={token!}
            size={cell}
            reduceMotion={reduce}
            badge={bestIds.has(item.photo_id)}
            mediaType={item.media_type}
            durationS={item.duration_s}
            onPress={(rect) => openPhoto(item.photo_id, rect)}
          />
        )}
        ListFooterComponent={
          demoted.length > 0 ? (
            <View style={{ marginTop: space.lg }}>
              <IconLabelAction
                icon={showDemoted ? 'chevron-up' : 'chevron-down'}
                label={`Maybe not you (${demoted.length})`}
                onPress={() => setShowDemoted((s) => !s)}
                tone={colors.inkSoft}
                trailing={<AppText variant="label" color={colors.inkFaint}>{showDemoted ? 'Hide' : 'Show'}</AppText>}
              />
              {showDemoted ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {demoted.map((item) => (
                    <PhotoCard
                      key={item.photo_id}
                      photoId={item.photo_id}
                      token={token!}
                      size={cell}
                      reduceMotion={reduce}
                      mediaType={item.media_type}
                      durationS={item.duration_s}
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

/** The widened "whole pool" browse view (spec 005 US5 gallery_visibility). Swipe
 *  next/prev in the lightbox won't span these items (that list is keyed off the
 *  personal gallery) — a photo still opens and displays fine, it just won't
 *  chain to a neighbor; acceptable for a browse-only surface. */
function EveryonePool({
  eventId,
  token,
  cell,
  reduce,
  header,
  onOpen,
}: {
  eventId: string;
  token: string;
  cell: number;
  reduce: boolean;
  header: React.ReactNode;
  onOpen: (photoId: string, rect?: { x: number; y: number; w: number; h: number }) => void;
}) {
  const pool = usePool(eventId, token);

  if (pool.isLoading) {
    return (
      <Screen>
        {header}
        <StateView kind="loading" title="Opening the pool…" />
      </Screen>
    );
  }
  if (pool.isError) {
    return (
      <Screen>
        {header}
        <EmptyState
          art="offline"
          title="Couldn’t open the pool"
          body={pool.error instanceof ApiError ? pool.error.friendly : 'Please try again in a moment.'}
          actionLabel="Try again"
          onAction={() => pool.refetch()}
        />
      </Screen>
    );
  }
  const photos = pool.data ?? [];
  if (photos.length === 0) {
    return (
      <Screen>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={pool.isRefetching} onRefresh={pool.refetch} tintColor={colors.inkSoft} />
          }
        >
          {header}
          <EmptyState art="gallery" title="Nothing in the pool yet" body="Photos will show up here once uploaded." />
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen>
      <FlashList
        data={photos}
        keyExtractor={(item) => item.id}
        numColumns={3}
        onRefresh={pool.refetch}
        refreshing={pool.isRefetching}
        contentContainerStyle={{ paddingHorizontal: space.xl, paddingBottom: space.xxl }}
        ListHeaderComponent={<View style={{ paddingBottom: space.sm }}>{header}</View>}
        renderItem={({ item }) => (
          <PhotoCard
            photoId={item.id}
            token={token}
            size={cell}
            reduceMotion={reduce}
            mediaType={item.media_type}
            durationS={item.duration_s}
            onPress={(rect) => onOpen(item.id, rect)}
          />
        )}
      />
    </Screen>
  );
}
