import { Pressable, ScrollView, View } from 'react-native';
import { AppText } from '../Text';
import { EditorCanvas } from './EditorCanvas';
import { PRESETS } from '../../features/editor/presets';
import type { Adjustments } from '../../features/editor/colorMatrix';
import type { EditState } from '../../features/editor/steps';
import { colors, radius, role, space } from '../../theme';

const THUMB = 72;

/** Preset thumbnails rendered from the current photo (current crop/rotation,
 *  each preset's adjustments) so what you tap is what you get (FR-008). */
export function PresetRow({
  uri,
  editState,
  onSelect,
}: {
  uri: string;
  editState: EditState;
  onSelect: (presetId: string, adjustments: Adjustments) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.md, padding: space.xl }}>
      {PRESETS.map((preset) => (
        <Pressable
          key={preset.id}
          onPress={() => onSelect(preset.id, preset.adjustments)}
          style={{ alignItems: 'center', gap: space.xs }}
        >
          <View
            style={{
              width: THUMB,
              height: THUMB,
              borderRadius: radius.md,
              overflow: 'hidden',
              borderWidth: editState.presetId === preset.id ? 2 : 1,
              borderColor: editState.presetId === preset.id ? role.action : colors.line,
            }}
          >
            <EditorCanvas
              uri={uri}
              editState={{ ...editState, adjustments: preset.adjustments }}
              width={THUMB}
              height={THUMB}
            />
          </View>
          <AppText variant="caption" color={colors.ink}>{preset.name}</AppText>
        </Pressable>
      ))}
    </ScrollView>
  );
}
