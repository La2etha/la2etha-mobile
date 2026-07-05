import { Skia, ImageFormat } from '@shopify/react-native-skia';
import { composeMatrix } from '../features/editor/colorMatrix';
import { naturalRectFromEffective, outputRect } from '../features/editor/cropMath';
import type { EditState } from '../features/editor/steps';
import { saveDataUriToPhotos } from './saveImage';

const MAX_PIXELS = 24_000_000; // 24MP working cap (spec edge case)
const JPEG_QUALITY = 92;

export type ExportPhase = 'decode' | 'render' | 'encode' | 'save';

function base64FromDataUri(dataUri: string): string {
  return dataUri.replace(/^data:[^,]*,/, '');
}

/** Renders the edit at full resolution offscreen — same crop/rotate/straighten
 *  + color-matrix math as `EditorCanvas` (the WYSIWYG contract) — caps the
 *  working buffer at MAX_PIXELS, encodes JPEG, and saves via the existing
 *  save path. `originalDataUri` is the pool original, already fetched by the
 *  caller (the app's convention for image bytes, e.g. `apiFetchImage`/
 *  `exportPhoto`). Returns a data URI of the saved result. */
export async function renderFullRes(
  originalDataUri: string,
  editState: EditState,
  onProgress: (phase: ExportPhase) => void
): Promise<string> {
  onProgress('decode');
  const data = Skia.Data.fromBase64(base64FromDataUri(originalDataUri));
  const source = Skia.Image.MakeImageFromEncoded(data);
  if (!source) throw new Error('Could not decode the original photo.');

  const imageW = source.width();
  const imageH = source.height();
  const effective = outputRect(imageW, imageH, editState.crop, editState.rotation, editState.straighten);
  const natural = naturalRectFromEffective(effective, imageW, imageH, editState.rotation);

  const capScale = Math.min(1, Math.sqrt(MAX_PIXELS / (natural.w * natural.h)));
  const outW = Math.max(1, Math.round(natural.w * capScale));
  const outH = Math.max(1, Math.round(natural.h * capScale));

  onProgress('render');
  const surface = Skia.Surface.Make(outW, outH);
  if (!surface) throw new Error('Could not allocate the export surface.');
  const canvas = surface.getCanvas();

  const cx = natural.x + natural.w / 2;
  const cy = natural.y + natural.h / 2;
  const theta = editState.rotation + editState.straighten;
  const scale = outW / natural.w; // outW already includes the MAX_PIXELS cap

  // Standard "rotate/scale around a point" recipe: move the pivot to the
  // output center, rotate + scale around it, then shift the pivot back to
  // the origin before drawing — mirrors EditorCanvas's Group(origin=...) so
  // preview and export land on the same pixels.
  canvas.save();
  canvas.translate(outW / 2, outH / 2);
  canvas.rotate(theta, 0, 0);
  canvas.scale(scale, scale);
  canvas.translate(-cx, -cy);
  const paint = Skia.Paint();
  paint.setColorFilter(Skia.ColorFilter.MakeMatrix(composeMatrix(editState.adjustments)));
  canvas.drawImage(source, 0, 0, paint);
  canvas.restore();

  onProgress('encode');
  const result = surface.makeImageSnapshot();
  const base64 = result.encodeToBase64(ImageFormat.JPEG, JPEG_QUALITY);
  const dataUri = `data:image/jpeg;base64,${base64}`;

  onProgress('save');
  await saveDataUriToPhotos(dataUri);
  return dataUri;
}
