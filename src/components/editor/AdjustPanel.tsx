import { useState } from 'react';
import { GestureResponderEvent, LayoutChangeEvent, View } from 'react-native';
import { AppText } from '../Text';
import { colors, radius, role, space } from '../../theme';
import type { Adjustments } from '../../features/editor/colorMatrix';

const ROWS: { key: keyof Adjustments; label: string }[] = [
  { key: 'brightness', label: 'Brightness' },
  { key: 'contrast', label: 'Contrast' },
  { key: 'saturation', label: 'Saturation' },
  { key: 'warmth', label: 'Warmth' },
];

const THUMB_SIZE = 22;
const TRACK_HEIGHT = 4;

function clamp(v: number) {
  return Math.max(-1, Math.min(1, v));
}

/** A slider built on React Native's core touch-responder system — deliberately
 *  NOT react-native-gesture-handler, because a gesture-handler Pan nested in a
 *  ScrollView crashes on Android. The knob follows the finger via local state
 *  (this row re-renders only); the image commits once on release. */
function AdjustSlider({
  label,
  value,
  onCommit,
}: {
  label: string;
  value: number;
  onCommit: (v: number) => void;
}) {
  const [width, setWidth] = useState(0);
  const [dragValue, setDragValue] = useState<number | null>(null);
  const shown = dragValue ?? value;

  function onLayout(e: LayoutChangeEvent) {
    setWidth(e.nativeEvent.layout.width);
  }
  function valueFromTouch(e: GestureResponderEvent) {
    if (width === 0) return shown;
    return clamp((e.nativeEvent.locationX / width) * 2 - 1);
  }

  const fillWidth = width === 0 ? 0 : ((shown + 1) / 2) * width;

  return (
    <View style={{ gap: space.xs }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <AppText variant="label" color={colors.ink}>{label}</AppText>
        <AppText variant="caption" color={colors.inkSoft}>{Math.round(shown * 100)}</AppText>
      </View>
      <View
        onLayout={onLayout}
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min: -100, max: 100, now: Math.round(shown * 100) }}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(e) => setDragValue(valueFromTouch(e))}
        onResponderMove={(e) => setDragValue(valueFromTouch(e))}
        onResponderRelease={(e) => {
          const v = valueFromTouch(e);
          setDragValue(null);
          onCommit(v);
        }}
        onResponderTerminate={() => setDragValue(null)}
        // pad the vertical hit area so the thin track is easy to grab
        style={{ height: THUMB_SIZE + 12, justifyContent: 'center' }}
      >
        <View
          style={{
            height: TRACK_HEIGHT,
            borderRadius: radius.pill,
            backgroundColor: colors.line,
            overflow: 'hidden',
          }}
        >
          <View style={{ height: TRACK_HEIGHT, backgroundColor: role.actionDeep, width: fillWidth }} />
        </View>
        <View
          style={{
            position: 'absolute',
            left: fillWidth - THUMB_SIZE / 2,
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: THUMB_SIZE / 2,
            backgroundColor: colors.card,
            borderWidth: 2,
            borderColor: role.actionDeep,
          }}
        />
      </View>
    </View>
  );
}

/** Four adjustment sliders. Knob tracks the finger live; the image updates on
 *  release via one committed `onCommit` step. */
export function AdjustPanel({
  adjustments,
  onCommit,
}: {
  adjustments: Adjustments;
  onCommit: (adjustments: Adjustments) => void;
}) {
  return (
    <View style={{ gap: space.lg, padding: space.xl }}>
      {ROWS.map(({ key, label }) => (
        <AdjustSlider
          key={key}
          label={label}
          value={adjustments[key]}
          onCommit={(v) => onCommit({ ...adjustments, [key]: v })}
        />
      ))}
    </View>
  );
}
