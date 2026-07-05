import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { AppText } from '../Text';
import { IconLabelAction } from '../IconLabelAction';
import { colors, radius, role, space } from '../../theme';
import { clampCrop, type NormalizedCrop } from '../../features/editor/cropMath';

const ASPECTS: { label: string; ratio: number | null }[] = [
  { label: 'Free', ratio: null },
  { label: '1:1', ratio: 1 },
  { label: '4:5', ratio: 4 / 5 },
  { label: '16:9', ratio: 16 / 9 },
];

const HANDLE = 22;
const STRAIGHTEN_RANGE = 15;

type Corner = 'tl' | 'tr' | 'bl' | 'br';

function centeredRect(ratio: number, width: number, height: number) {
  // ratio is target width/height in on-screen pixels; convert to a
  // normalized rect centered in the frame.
  const boxRatio = width / height;
  const w = ratio >= boxRatio ? 1 : ratio / boxRatio;
  const h = ratio >= boxRatio ? boxRatio / ratio : 1;
  return clampCrop({ x: (1 - w) / 2, y: (1 - h) / 2, w, h });
}

function resizeFromCorner(
  crop: { x: number; y: number; w: number; h: number },
  corner: Corner,
  dx: number,
  dy: number
) {
  const left = crop.x;
  const top = crop.y;
  const right = crop.x + crop.w;
  const bottom = crop.y + crop.h;
  switch (corner) {
    case 'tl':
      return clampCrop({ x: left + dx, y: top + dy, w: right - (left + dx), h: bottom - (top + dy) });
    case 'tr':
      return clampCrop({ x: left, y: top + dy, w: right + dx - left, h: bottom - (top + dy) });
    case 'bl':
      return clampCrop({ x: left + dx, y: top, w: right - (left + dx), h: bottom + dy - top });
    case 'br':
      return clampCrop({ x: left, y: top, w: right + dx - left, h: bottom + dy - top });
  }
}

function CornerHandle({
  corner,
  onDrag,
  onCommit,
}: {
  corner: Corner;
  onDrag: (corner: Corner, dx: number, dy: number) => void;
  onCommit: () => void;
}) {
  // Gesture built once (ref) and read live callbacks through refs — never
  // recreate a native gesture object mid-drag (crashes on Android).
  const onDragRef = useRef(onDrag);
  onDragRef.current = onDrag;
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;
  const callDrag = useCallback((c: Corner, dx: number, dy: number) => onDragRef.current(c, dx, dy), []);
  const callCommit = useCallback(() => onCommitRef.current(), []);

  const pan = useRef(
    Gesture.Pan()
      .onUpdate((e) => runOnJS(callDrag)(corner, e.translationX, e.translationY))
      .onEnd(() => runOnJS(callCommit)())
  ).current;

  const pos: Record<Corner, object> = {
    tl: { top: -HANDLE / 2, left: -HANDLE / 2 },
    tr: { top: -HANDLE / 2, right: -HANDLE / 2 },
    bl: { bottom: -HANDLE / 2, left: -HANDLE / 2 },
    br: { bottom: -HANDLE / 2, right: -HANDLE / 2 },
  };
  return (
    <GestureDetector gesture={pan}>
      <View
        style={[
          { position: 'absolute', width: HANDLE * 1.6, height: HANDLE * 1.6, alignItems: 'center', justifyContent: 'center' },
          pos[corner],
        ]}
      >
        <View style={{ width: HANDLE, height: HANDLE, borderRadius: 4, backgroundColor: colors.paper, borderWidth: 2, borderColor: role.actionDeep }} />
      </View>
    </GestureDetector>
  );
}

/** Free-form (drag corners) or fixed-ratio crop, 90° rotate, and a straighten
 *  dial. Corner drags are free-form even when a ratio pill is selected —
 *  ponytail: exact ratio-locked dragging isn't implemented; picking a ratio
 *  re-centers a rect of that ratio, add locked-drag resize if users need it. */
export function CropOverlay({
  crop,
  rotation,
  straighten,
  width,
  height,
  onCropPreview,
  onCropCommit,
  onRotate,
  onStraightenPreview,
  onStraightenCommit,
}: {
  crop: NormalizedCrop;
  rotation: 0 | 90 | 180 | 270;
  straighten: number;
  width: number;
  height: number;
  onCropPreview: (crop: NormalizedCrop) => void;
  onCropCommit: (crop: NormalizedCrop) => void;
  onRotate: (rotation: 0 | 90 | 180 | 270) => void;
  onStraightenPreview: (deg: number) => void;
  onStraightenCommit: (deg: number) => void;
}) {
  const live = clampCrop(crop ?? { x: 0, y: 0, w: 1, h: 1 });
  const [dragStart, setDragStart] = useState(live);

  function handleDrag(corner: Corner, dx: number, dy: number) {
    const next = resizeFromCorner(dragStart, corner, dx / width, dy / height);
    onCropPreview(next);
  }
  function handleCommit() {
    onCropCommit(clampCrop(live));
  }

  const boxStyle = {
    position: 'absolute' as const,
    left: live.x * width,
    top: live.y * height,
    width: live.w * width,
    height: live.h * height,
    borderWidth: 2,
    borderColor: role.actionDeep,
  };

  return (
    <View>
      <View style={{ width, height }}>
        <View
          style={boxStyle}
          onTouchStart={() => setDragStart(live)}
        >
          {(['tl', 'tr', 'bl', 'br'] as Corner[]).map((corner) => (
            <CornerHandle key={corner} corner={corner} onDrag={handleDrag} onCommit={handleCommit} />
          ))}
        </View>
      </View>

      <View style={{ gap: space.md, marginTop: space.md }}>
        <View style={{ flexDirection: 'row', gap: space.sm, justifyContent: 'center' }}>
          {ASPECTS.map(({ label, ratio }) => (
            <Pressable
              key={label}
              onPress={() => {
                const next = ratio == null ? null : centeredRect(ratio, width, height);
                setDragStart(next ?? { x: 0, y: 0, w: 1, h: 1 });
                onCropPreview(next);
                onCropCommit(next);
              }}
              style={{
                borderWidth: 1,
                borderColor: colors.line,
                borderRadius: radius.pill,
                paddingHorizontal: space.md,
                paddingVertical: space.xs,
              }}
            >
              <AppText variant="caption" color={colors.ink}>{label}</AppText>
            </Pressable>
          ))}
          <IconLabelAction icon="rotate-cw" label="Rotate" onPress={() => onRotate((((rotation + 90) % 360) as 0 | 90 | 180 | 270))} />
        </View>

        <StraightenDial value={straighten} onPreview={onStraightenPreview} onCommit={onStraightenCommit} />
      </View>
    </View>
  );
}

function StraightenDial({
  value,
  onPreview,
  onCommit,
}: {
  value: number;
  onPreview: (deg: number) => void;
  onCommit: (deg: number) => void;
}) {
  const trackWidth = useSharedValue(0);
  const start = useSharedValue(value);
  const current = useSharedValue(value);

  useEffect(() => {
    current.value = value;
  }, [value]);

  const onPreviewRef = useRef(onPreview);
  onPreviewRef.current = onPreview;
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;
  const callPreview = useCallback((v: number) => onPreviewRef.current(v), []);
  const callCommit = useCallback((v: number) => onCommitRef.current(v), []);

  const pan = useRef(
    Gesture.Pan()
      .onStart(() => {
        start.value = current.value;
      })
      .onUpdate((e) => {
        if (trackWidth.value === 0) return;
        const next = Math.max(
          -STRAIGHTEN_RANGE,
          Math.min(STRAIGHTEN_RANGE, start.value + (e.translationX / trackWidth.value) * STRAIGHTEN_RANGE * 2)
        );
        current.value = next;
        runOnJS(callPreview)(next);
      })
      .onEnd(() => {
        runOnJS(callCommit)(current.value);
      })
  ).current;

  const thumbStyle = useAnimatedStyle(() => ({
    left: ((current.value + STRAIGHTEN_RANGE) / (STRAIGHTEN_RANGE * 2)) * trackWidth.value - 10,
  }));

  return (
    <View style={{ gap: space.xs, paddingHorizontal: space.xl }}>
      <AppText variant="caption" color={colors.inkSoft} style={{ textAlign: 'center' }}>
        Straighten {value.toFixed(0)}°
      </AppText>
      <GestureDetector gesture={pan}>
        <View
          onLayout={(e) => {
            trackWidth.value = e.nativeEvent.layout.width;
          }}
          accessibilityRole="adjustable"
          accessibilityLabel="Straighten"
          accessibilityValue={{ min: -STRAIGHTEN_RANGE, max: STRAIGHTEN_RANGE, now: Math.round(value) }}
          style={{ height: 20, justifyContent: 'center' }}
        >
          <View style={{ height: 2, backgroundColor: colors.line }} />
          <Animated.View
            style={[
              { position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: colors.card, borderWidth: 2, borderColor: role.actionDeep },
              thumbStyle,
            ]}
          />
        </View>
      </GestureDetector>
    </View>
  );
}
