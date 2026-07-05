import { useEffect, useMemo, useState } from 'react';
import { Pressable } from 'react-native';
import { Canvas, Group, Image as SkiaImage, ColorMatrix, Skia, rect, type SkImage } from '@shopify/react-native-skia';
import type { EditState } from '../../features/editor/steps';
import { NEUTRAL_ADJUSTMENTS, composeMatrix } from '../../features/editor/colorMatrix';
import { naturalRectFromEffective, outputRect } from '../../features/editor/cropMath';

function base64FromDataUri(dataUri: string): string {
  return dataUri.replace(/^data:[^,]*,/, '');
}

/** Skia's `useImage`/`Data.fromURI` routes through a native URL loader that
 *  doesn't reliably handle `data:` URIs. Every image this app hands the
 *  editor (pool original, AI result) is already a `data:` URI (the app's
 *  existing bytes convention), so decode it directly instead — same
 *  approach as renderExport.ts, so preview and export agree. */
function useDataUriImage(dataUri: string): SkImage | null {
  const [image, setImage] = useState<SkImage | null>(null);
  useEffect(() => {
    const data = Skia.Data.fromBase64(base64FromDataUri(dataUri));
    setImage(Skia.Image.MakeImageFromEncoded(data));
  }, [dataUri]);
  return image;
}

/** Skia preview: draws the source image rotated + cropped + color-matrixed to
 *  fill exactly `width`x`height`, using the same crop/color math the full-res
 *  exporter (renderExport.ts) uses, so preview and saved output match
 *  (WYSIWYG contract). Press-and-hold shows the untouched original.
 *
 *  ponytail: the rotate/scale-around-a-point transform below is derived, not
 *  pixel-checked on a device yet (Skia doesn't run in Jest/Expo Go) — verify
 *  visually once the dev build is in hand, especially the 90/270 + straighten
 *  combination. */
export function EditorCanvas({
  uri,
  editState,
  width,
  height,
}: {
  uri: string;
  editState: EditState;
  width: number;
  height: number;
}) {
  const image = useDataUriImage(editState.aiBaseImage ?? uri);
  const [comparing, setComparing] = useState(false);

  const matrix = useMemo(
    () => composeMatrix(comparing ? NEUTRAL_ADJUSTMENTS : editState.adjustments),
    [comparing, editState.adjustments]
  );

  if (!image) return null;

  const imageW = image.width();
  const imageH = image.height();

  const rotation = comparing ? 0 : editState.rotation;
  const straighten = comparing ? 0 : editState.straighten;
  const crop = comparing ? null : editState.crop;

  const effective = outputRect(imageW, imageH, crop, rotation, straighten);
  const natural = naturalRectFromEffective(effective, imageW, imageH, rotation);
  const cx = natural.x + natural.w / 2;
  const cy = natural.y + natural.h / 2;
  const scaleX = width / natural.w;
  const scaleY = height / natural.h;
  const theta = ((rotation + straighten) * Math.PI) / 180;

  // key the whole Canvas (a real host view) on everything that affects the
  // render — Skia memoizes its internal subtree and won't reliably repaint a
  // ColorMatrix / transform change in place, so we remount the surface. The
  // decoded image is cached in state, so this doesn't re-decode.
  const renderKey = `${matrix.join(',')}|${cx},${cy},${scaleX},${scaleY},${theta}`;

  return (
    <Pressable
      onPressIn={() => setComparing(true)}
      onPressOut={() => setComparing(false)}
      style={{ width, height }}
    >
      <Canvas key={renderKey} style={{ width, height }}>
        <Group clip={rect(0, 0, width, height)}>
          <Group transform={[{ translateX: width / 2 - cx }, { translateY: height / 2 - cy }]}>
            <Group origin={{ x: cx, y: cy }} transform={[{ rotate: theta }, { scaleX }, { scaleY }]}>
              <SkiaImage image={image} x={0} y={0} width={imageW} height={imageH} fit="fill">
                <ColorMatrix matrix={matrix} />
              </SkiaImage>
            </Group>
          </Group>
        </Group>
      </Canvas>
    </Pressable>
  );
}
