import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Directions, Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText } from '../../../../../src/components/Text';
import { GlowButton } from '../../../../../src/components/GlowButton';
import { IconLabelAction } from '../../../../../src/components/IconLabelAction';
import { FaceOverlay } from '../../../../../src/components/FaceOverlay';
import { useAuth } from '../../../../../src/auth/AuthContext';
import { useGallery, usePhotoFaces, useClaim, useDeletePhoto } from '../../../../../src/features/gallery/hooks';
import { useEvent, useSetCoverPhoto } from '../../../../../src/features/events/hooks';
import { usePool } from '../../../../../src/features/host/hooks';
import { photoUri } from '../../../../../src/api/gallery';
import { exportPhoto } from '../../../../../src/api/edit';
import { saveDataUriToPhotos } from '../../../../../src/lib/saveImage';
import { ApiError } from '../../../../../src/api/errors';
import { colors, radius, space } from '../../../../../src/theme';

/** Video branch of the lightbox (spec 003 US3). Mounted with `key={photoId}` by
 * the caller so swiping to a neighbor unmounts this (stopping playback) rather
 * than needing manual pause/replace bookkeeping. Uses the platform's default
 * audio session, which already respects the iOS silent switch. */
function VideoLightbox({ photoId, token }: { photoId: string; token: string }) {
  const player = useVideoPlayer(
    { uri: photoUri(photoId), headers: { Authorization: `Bearer ${token}` } },
    (p) => {
      p.loop = false;
      p.play();
    }
  );
  return (
    <VideoView
      player={player}
      style={{ width: '100%', height: '100%' }}
      nativeControls
      contentFit="contain"
    />
  );
}

export default function Lightbox() {
  const params = useLocalSearchParams<{
    id: string;
    photoId: string;
    ox?: string;
    oy?: string;
    ow?: string;
    oh?: string;
  }>();
  const { id, photoId } = params;
  const { token, user } = useAuth();
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  // Where the tapped thumbnail sat on screen — the morph grows from here. Falls
  // back to a centered scale-up when opened from somewhere without a rect.
  const src =
    params.ox != null
      ? { x: Number(params.ox), y: Number(params.oy), w: Number(params.ow), h: Number(params.oh) }
      : { x: width * 0.2, y: height * 0.42, w: width * 0.6, h: width * 0.6 };

  // Read the already-cached gallery to know the order — lets us swipe prev/next
  // without passing the whole list through the route.
  const gallery = useGallery(id, token);
  const list = gallery.data?.items ?? [];

  const [currentId, setCurrentId] = useState(photoId);
  const [showFaces, setShowFaces] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [saving, setSaving] = useState(false);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const faces = usePhotoFaces(currentId, token, showFaces);
  const claim = useClaim(id, token);
  const eventQ = useEvent(id, token);
  const pool = usePool(id, token);
  const del = useDeletePhoto(id, token);
  const setCover = useSetCoverPhoto(id, token);

  const index = list.findIndex((i) => i.photo_id === currentId);
  const total = list.length;

  // Delete eligibility (spec 005 FR-018): host always; the uploader when the
  // event allows member_delete_own. Look up the uploader from whichever cached
  // list (personal gallery or the "Everyone" pool) has this photo.
  const currentItem =
    list.find((i) => i.photo_id === currentId) ?? pool.data?.find((p) => p.id === currentId);
  const isVideo = currentItem?.media_type === 'video';
  const isHost = eventQ.data?.owner_id === user?.id;
  const canDelete =
    !!eventQ.data &&
    !!currentItem &&
    (isHost || (currentItem.contributor_id === user?.id && eventQ.data.member_delete_own));

  const dispW = width;
  // Cap portrait photos so the controls stay on-screen.
  const dispH = size ? Math.min(dispW * (size.h / size.w), height * 0.7) : dispW;

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);
  // Swipe-to-next/prev: the current photo slides fully off-screen in the swipe
  // direction, the new one is placed off-screen on the opposite side, then
  // slides in — a real carousel motion, not just expo-image's load crossfade.
  const swipeX = useSharedValue(0);
  const swiping = useSharedValue(false);

  // Morph: 0 = at the thumbnail rect, 1 = full-screen. Runs once on open.
  const morph = useSharedValue(0);
  useEffect(() => {
    morph.value = withTiming(1, { duration: 340, easing: Easing.out(Easing.cubic) });
  }, []);

  const targetTop = (height - dispH) / 2;
  const morphStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: interpolate(morph.value, [0, 1], [src.x, 0]),
    top: interpolate(morph.value, [0, 1], [src.y, targetTop]),
    width: interpolate(morph.value, [0, 1], [src.w, dispW]),
    height: interpolate(morph.value, [0, 1], [src.h, dispH]),
    borderRadius: interpolate(morph.value, [0, 1], [radius.md, 0]),
    overflow: 'hidden',
  }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: morph.value }));
  const chromeStyle = useAnimatedStyle(() => ({ opacity: interpolate(morph.value, [0.5, 1], [0, 1]) }));

  function close() {
    // Morph back to the thumbnail only if we're still on the original photo and
    // not zoomed; otherwise just dismiss.
    if (scale.value > 1 || currentId !== photoId) {
      router.back();
      return;
    }
    morph.value = withTiming(0, { duration: 260, easing: Easing.in(Easing.cubic) }, (fin) => {
      if (fin) runOnJS(router.back)();
    });
  }

  function resetZoom() {
    scale.value = 1;
    savedScale.value = 1;
    tx.value = 0;
    ty.value = 0;
    savedTx.value = 0;
    savedTy.value = 0;
  }

  // Phase 2 (UI thread → JS): the outgoing photo has finished sliding off-screen.
  // Swap the source while it's off-screen, park the new one on the opposite
  // side, then animate it in.
  function finishSwipe(next: number, outDir: number) {
    resetZoom();
    setSize(null); // new aspect ratio; recompute on load
    setCurrentId(list[next].photo_id);
    swipeX.value = -outDir * width;
    swipeX.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) }, (finished) => {
      if (finished) swiping.value = false;
    });
  }

  // Phase 1 (JS): slide the current photo fully off-screen in the swipe direction.
  function startSwipe(delta: number) {
    if (index < 0 || swiping.value) return;
    const next = index + delta;
    if (next < 0 || next >= total) return;
    swiping.value = true;
    const outDir = delta > 0 ? -1 : 1; // next → slides left; prev → slides right
    swipeX.value = withTiming(
      outDir * width,
      { duration: 160, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(finishSwipe)(next, outDir);
      }
    );
  }

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(1, savedScale.value * e.scale);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value <= 1) {
        tx.value = withTiming(0);
        ty.value = withTiming(0);
        savedTx.value = 0;
        savedTy.value = 0;
      }
    });

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (savedScale.value > 1) {
        tx.value = savedTx.value + e.translationX;
        ty.value = savedTy.value + e.translationY;
      }
    })
    .onEnd(() => {
      savedTx.value = tx.value;
      savedTy.value = ty.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      scale.value = withTiming(1);
      tx.value = withTiming(0);
      ty.value = withTiming(0);
      savedScale.value = 1;
      savedTx.value = 0;
      savedTy.value = 0;
    });

  // Swipe to the next/previous photo — only when not zoomed (so pan can move a
  // zoomed image freely) and not already mid-swipe.
  const flingLeft = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(() => {
      if (scale.value === 1 && !swiping.value) runOnJS(startSwipe)(1);
    });
  const flingRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(() => {
      if (scale.value === 1 && !swiping.value) runOnJS(startSwipe)(-1);
    });

  const gesture = Gesture.Simultaneous(doubleTap, pinch, pan, flingLeft, flingRight);
  const zoomStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value + swipeX.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));

  async function correct(claimed: boolean) {
    await claim.mutateAsync({ photoId: currentId, claimed });
    if (claimed) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  async function saveExport(removeStrangers: boolean) {
    setSheet(false);
    setSaving(true);
    try {
      const uri = await exportPhoto(currentId, token!, removeStrangers);
      const ok = await saveDataUriToPhotos(uri);
      Alert.alert(
        ok ? 'Saved' : 'Permission needed',
        ok ? 'The photo is in your library.' : 'Allow photo access to save it.'
      );
    } catch (e) {
      Alert.alert(
        'Couldn’t save',
        e instanceof ApiError && e.status === 503
          ? 'Removing strangers isn’t switched on for this event yet.'
          : e instanceof ApiError
            ? e.friendly
            : 'Please try again in a moment.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function makeCover() {
    setSheet(false);
    try {
      await setCover.mutateAsync(currentId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert('Couldn’t set cover', e instanceof ApiError ? e.friendly : 'Please try again in a moment.');
    }
  }

  function confirmDelete() {
    setSheet(false);
    Alert.alert(
      'Delete this photo?',
      'It disappears from the pool and every gallery it was in. This can’t be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await del.mutateAsync(currentId);
              router.back();
            } catch (e) {
              Alert.alert(
                'Couldn’t delete',
                e instanceof ApiError ? e.friendly : 'Please try again in a moment.'
              );
            }
          },
        },
      ]
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Ink backdrop fades in as the photo morphs up (gallery shows behind). */}
      <Animated.View
        style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.ink }, backdropStyle]}
      />

      {/* Photo, growing from the tapped thumbnail rect. */}
      <Animated.View style={morphStyle}>
        <GestureDetector gesture={gesture}>
          <Animated.View style={[{ width: '100%', height: '100%' }, zoomStyle]}>
            {isVideo ? (
              <VideoLightbox key={currentId} photoId={currentId} token={token!} />
            ) : (
              <Image
                source={{ uri: photoUri(currentId), headers: { Authorization: `Bearer ${token}` } }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                transition={200}
                onLoad={(e) => setSize({ w: e.source.width, h: e.source.height })}
              />
            )}
            {showFaces && faces.data ? (
              <FaceOverlay faces={faces.data} width={dispW} height={dispH} />
            ) : null}
          </Animated.View>
        </GestureDetector>
      </Animated.View>

      {/* Chrome (fades in after the morph): close, more, position, controls. */}
      <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, chromeStyle]} pointerEvents="box-none">
        <Pressable onPress={close} hitSlop={12} style={{ position: 'absolute', top: space.xxl, right: space.xl }}>
          <AppText variant="h2" color={colors.paper}>✕</AppText>
        </Pressable>
        <Pressable
          onPress={() => setSheet(true)}
          hitSlop={12}
          disabled={saving}
          style={{ position: 'absolute', top: space.xxl, right: space.xl + 44 }}
        >
          <AppText variant="h2" color={colors.paper}>{saving ? '…' : '⋯'}</AppText>
        </Pressable>
        {total > 1 && index >= 0 ? (
          <View style={{ position: 'absolute', top: space.xxl + 4, left: space.xl }}>
            <AppText variant="mono" color={colors.paper}>{index + 1} / {total}</AppText>
          </View>
        ) : null}
        {showFaces && faces.data && faces.data.length === 0 ? (
          <View style={{ position: 'absolute', top: '46%', left: 0, right: 0, alignItems: 'center' }}>
            <AppText variant="caption" color={colors.paper}>No faces detected on this one yet.</AppText>
          </View>
        ) : null}

        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: space.xl, gap: space.md }}>
          <Pressable
            onPress={() => setShowFaces((s) => !s)}
            style={{
              alignSelf: 'center',
              borderColor: colors.glowTeal,
              borderWidth: 1,
              borderRadius: radius.pill,
              paddingHorizontal: space.lg,
              paddingVertical: space.sm,
            }}
          >
            <AppText variant="label" color={colors.glowTeal}>
              {showFaces ? 'Hide faces' : 'Show faces'}
            </AppText>
          </Pressable>

          <View style={{ flexDirection: 'row', gap: space.md }}>
            <View style={{ flex: 1 }}>
              <GlowButton label="This is me" tone="identity" onPress={() => correct(true)} loading={claim.isPending} />
            </View>
            <IconLabelAction icon="x" label="Not me" onPress={() => correct(false)} tone={colors.paper} />
          </View>
        </View>
      </Animated.View>

      {/* One action sheet for the secondary per-photo actions (§8.6). */}
      <Modal visible={sheet} transparent animationType="slide" onRequestClose={() => setSheet(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(11,59,58,0.5)' }} onPress={() => setSheet(false)} />
        <View style={{ backgroundColor: colors.paper, padding: space.xl, gap: space.sm, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg }}>
          <IconLabelAction icon="download" label="Save to Photos" onPress={() => saveExport(false)} variant="card" />
          {isVideo ? (
            <AppText variant="caption" color={colors.inkFaint} style={{ paddingHorizontal: space.md }}>
              Removing strangers isn’t available for videos yet — saving keeps everyone in the clip.
            </AppText>
          ) : (
            <IconLabelAction icon="user-x" label="Save without strangers" onPress={() => saveExport(true)} variant="card" />
          )}
          {!isVideo ? (
            <>
              <IconLabelAction
                icon="sliders"
                label="Edit"
                variant="card"
                onPress={() => {
                  setSheet(false);
                  router.push(`/(app)/event/${id}/editor?photoId=${currentId}` as never);
                }}
              />
              <IconLabelAction
                icon="edit-3"
                label="AI edit (just you)"
                variant="card"
                onPress={() => {
                  setSheet(false);
                  router.push(`/(app)/event/${id}/editor?photoId=${currentId}&tab=ai` as never);
                }}
              />
            </>
          ) : null}
          {isHost ? (
            <IconLabelAction icon="image" label="Set as event cover" variant="card" onPress={makeCover} />
          ) : null}
          {canDelete ? (
            <IconLabelAction
              icon="trash-2"
              label="Delete photo"
              variant="card"
              tone={colors.danger}
              onPress={confirmDelete}
            />
          ) : null}
          <IconLabelAction icon="x" label="Cancel" onPress={() => setSheet(false)} tone={colors.inkSoft} />
        </View>
      </Modal>
    </View>
  );
}
