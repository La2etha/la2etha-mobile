import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText } from '../../../../src/components/Text';
import { Icon } from '../../../../src/components/Icon';
import { IconLabelAction } from '../../../../src/components/IconLabelAction';
import { JobProgress } from '../../../../src/components/JobProgress';
import { AdjustPanel } from '../../../../src/components/editor/AdjustPanel';
import { CropOverlay } from '../../../../src/components/editor/CropOverlay';
import { PresetRow } from '../../../../src/components/editor/PresetRow';
import { AiTab } from '../../../../src/components/editor/AiTab';
import { useAuth } from '../../../../src/auth/AuthContext';
import { exportPhoto } from '../../../../src/api/edit';
import { outputRect } from '../../../../src/features/editor/cropMath';
import {
  EMPTY_HISTORY,
  apply,
  canRedo,
  canUndo,
  commit,
  fold,
  redo,
  undo,
  type EditState,
  type EditStep,
  type History,
} from '../../../../src/features/editor/steps';
import type { ExportPhase } from '../../../../src/lib/renderExport';
import { useReducedMotion } from '../../../../src/lib/reduceMotion';
import { colors, radius, role, space } from '../../../../src/theme';

// Skia is a native module — throws at require() time in Expo Go. Guard it
// with a dynamic require so the rest of the app still runs there (R7); only
// this route ever pays the cost of finding out.
let skiaAvailable = true;
try {
  require('@shopify/react-native-skia');
} catch {
  skiaAvailable = false;
}
const EditorCanvas = skiaAvailable
  ? (require('../../../../src/components/editor/EditorCanvas') as typeof import('../../../../src/components/editor/EditorCanvas'))
      .EditorCanvas
  : null;

type Tab = 'adjust' | 'looks' | 'ai';

const PHASE_LABEL: Record<ExportPhase, string> = {
  decode: 'Opening the original…',
  render: 'Rendering your edit…',
  encode: 'Encoding…',
  save: 'Saving to your library…',
};
const PHASE_ORDER: ExportPhase[] = ['decode', 'render', 'encode', 'save'];
const TABS: { key: Tab; label: string; icon: 'sliders' | 'image' | 'zap' }[] = [
  { key: 'adjust', label: 'Adjust', icon: 'sliders' },
  { key: 'looks', label: 'Looks', icon: 'image' },
  { key: 'ai', label: 'AI', icon: 'zap' },
];

/** Compact icon+label toolbar button (labels stay visible, unlike
 *  IconLabelAction whose flex:1 label collapses in an auto-width row). */
function ToolbarButton({
  icon,
  label,
  onPress,
  disabled,
  tone = colors.ink,
}: {
  icon: 'x' | 'corner-up-left' | 'corner-up-right';
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.xs,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Icon name={icon} color={tone} />
      <AppText variant="label" color={tone}>{label}</AppText>
    </Pressable>
  );
}

export default function Editor() {
  const params = useLocalSearchParams<{ id: string; photoId: string; tab?: Tab }>();
  const { id, photoId } = params;
  const { token } = useAuth();
  const router = useRouter();
  const { width, height: windowHeight } = useWindowDimensions();
  const reduceMotion = useReducedMotion();

  const [tab, setTab] = useState<Tab>(params.tab ?? 'adjust');
  const [originalUri, setOriginalUri] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [history, setHistory] = useState<History>(EMPTY_HISTORY);
  const [previewOverride, setPreviewOverride] = useState<EditState | null>(null);
  const [exportPhase, setExportPhase] = useState<ExportPhase | null>(null);

  useEffect(() => {
    let cancelled = false;
    exportPhoto(photoId, token!, false)
      .then((uri) => !cancelled && setOriginalUri(uri))
      .catch(() => !cancelled && setOriginalUri(null));
    return () => {
      cancelled = true;
    };
  }, [photoId, token]);

  useEffect(() => {
    if (!originalUri) return;
    Image.getSize(
      originalUri,
      (w, h) => setNaturalSize({ w, h }),
      () => setNaturalSize(null)
    );
  }, [originalUri]);

  const committed = fold(history.steps, history.cursor);
  const editState = previewOverride ?? committed;

  // Size the canvas box to the CURRENT crop's aspect ratio (not a fixed
  // square) so the image never gets stretched to fit — recomputes as the
  // user crops/rotates, so the box grows/shrinks with it.
  const maxBoxW = width - space.xl * 2;
  const maxBoxH = windowHeight * 0.45;
  const effective = naturalSize
    ? outputRect(naturalSize.w, naturalSize.h, editState.crop, editState.rotation, editState.straighten)
    : null;
  const aspect = effective ? effective.w / effective.h : 1;
  let boxW = maxBoxW;
  let boxH = boxW / aspect;
  if (boxH > maxBoxH) {
    boxH = maxBoxH;
    boxW = boxH * aspect;
  }

  function previewStep(step: EditStep) {
    setPreviewOverride(apply(committed, step));
  }
  function commitStep(step: EditStep) {
    setHistory((h) => commit(h, step));
    setPreviewOverride(null);
  }

  function close() {
    if (canUndo(history) || canRedo(history)) {
      Alert.alert('Discard edits?', 'Your changes to this photo haven’t been saved.', [
        { text: 'Keep editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.back() },
      ]);
      return;
    }
    router.back();
  }

  async function save() {
    if (!originalUri) return;
    setExportPhase('decode');
    try {
      const { renderFullRes } = await import('../../../../src/lib/renderExport');
      await renderFullRes(originalUri, committed, setExportPhase);
      Alert.alert('Saved', 'The edited photo is in your library.');
      router.back();
    } catch {
      Alert.alert('Couldn’t save', 'Please try again in a moment.');
    } finally {
      setExportPhase(null);
    }
  }

  if (!skiaAvailable || !EditorCanvas) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.md }}>
        <AppText variant="h2" style={{ textAlign: 'center' }}>The editor needs the full app build</AppText>
        <AppText variant="body" color={colors.inkSoft} style={{ textAlign: 'center' }}>
          Classic photo editing isn’t available in Expo Go. Everything else in the app still works here.
        </AppText>
        <IconLabelAction icon="arrow-left" label="Back" onPress={() => router.back()} />
      </View>
    );
  }

  if (!originalUri || !naturalSize) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper }}>
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.xl, paddingTop: space.xl }}>
        <ToolbarButton icon="x" label="Close" onPress={close} tone={colors.inkSoft} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
          <ToolbarButton
            icon="corner-up-left"
            label="Undo"
            onPress={() => setHistory(undo)}
            disabled={!canUndo(history)}
            tone={canUndo(history) ? colors.ink : colors.inkFaint}
          />
          <ToolbarButton
            icon="corner-up-right"
            label="Redo"
            onPress={() => setHistory(redo)}
            disabled={!canRedo(history)}
            tone={canRedo(history) ? colors.ink : colors.inkFaint}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Save"
            disabled={exportPhase != null}
            onPress={save}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: space.xs,
              backgroundColor: role.actionDeep,
              borderRadius: radius.md,
              paddingVertical: space.sm,
              paddingHorizontal: space.lg,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            {exportPhase != null ? (
              <ActivityIndicator color={colors.paper} size="small" />
            ) : (
              <>
                <Icon name="download" color={colors.paper} />
                <AppText variant="label" color={colors.paper}>Save</AppText>
              </>
            )}
          </Pressable>
        </View>
      </View>

      <View style={{ width: boxW, minHeight: boxH, alignSelf: 'center' }}>
        <View style={{ position: 'absolute', top: 0, left: 0, width: boxW, height: boxH }}>
          <EditorCanvas uri={originalUri} editState={editState} width={boxW} height={boxH} />
        </View>
        {tab === 'adjust' ? (
          <CropOverlay
            crop={editState.crop}
            rotation={editState.rotation}
            straighten={editState.straighten}
            width={boxW}
            height={boxH}
            onCropPreview={(crop) => previewStep({ kind: 'crop', crop })}
            onCropCommit={(crop) => commitStep({ kind: 'crop', crop })}
            onRotate={(rotation) => commitStep({ kind: 'rotate', rotation })}
            onStraightenPreview={(straighten) => previewStep({ kind: 'straighten', straighten })}
            onStraightenCommit={(straighten) => commitStep({ kind: 'straighten', straighten })}
          />
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: space.xl, marginTop: space.lg }}>
        {TABS.map(({ key, label, icon }) => (
          <IconLabelAction
            key={key}
            icon={icon}
            label={label}
            onPress={() => setTab(key)}
            tone={tab === key ? colors.ink : colors.inkFaint}
          />
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: space.xxl }}>
        {tab === 'adjust' ? (
          <AdjustPanel
            adjustments={editState.adjustments}
            onCommit={(adjustments) => commitStep({ kind: 'adjust', adjustments })}
          />
        ) : null}
        {tab === 'looks' ? (
          <PresetRow
            uri={originalUri}
            editState={editState}
            onSelect={(presetId, adjustments) => commitStep({ kind: 'preset', presetId, adjustments })}
          />
        ) : null}
        {tab === 'ai' ? (
          <AiTab
            photoId={photoId}
            token={token!}
            onResult={(dataUri) => commitStep({ kind: 'aiResult', aiBaseImage: dataUri })}
          />
        ) : null}
      </ScrollView>

      <Modal visible={exportPhase != null} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(11,59,58,0.85)', alignItems: 'center', justifyContent: 'center' }}>
          {exportPhase ? (
            <JobProgress
              title={PHASE_LABEL[exportPhase]}
              processed={PHASE_ORDER.indexOf(exportPhase) + 1}
              total={PHASE_ORDER.length}
              reduceMotion={reduceMotion}
            />
          ) : null}
        </View>
      </Modal>
    </View>
  );
}
