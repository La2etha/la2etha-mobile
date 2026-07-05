import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';

/** Save a `data:image/...;base64,...` or `data:video/...;base64,...` URI to the
 *  device's library. Returns false if the user denies permission. Throws on
 *  write failure. */
export async function saveDataUriToPhotos(dataUri: string): Promise<boolean> {
  const perm = await MediaLibrary.requestPermissionsAsync();
  if (!perm.granted) return false;

  const isVideo = dataUri.startsWith('data:video/');
  const base64 = dataUri.replace(/^data:[^,]*,/, '');
  const fileUri = `${FileSystem.cacheDirectory}lahza-${Date.now()}.${isVideo ? 'mp4' : 'jpg'}`;
  await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: 'base64' });
  await MediaLibrary.saveToLibraryAsync(fileUri);
  return true;
}
