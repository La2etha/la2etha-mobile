import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';

/** Save a `data:image/...;base64,...` URI to the device's photo library.
 *  Returns false if the user denies permission. Throws on write failure. */
export async function saveDataUriToPhotos(dataUri: string): Promise<boolean> {
  const perm = await MediaLibrary.requestPermissionsAsync();
  if (!perm.granted) return false;

  const base64 = dataUri.replace(/^data:image\/\w+;base64,/, '');
  const fileUri = `${FileSystem.cacheDirectory}lahza-${Date.now()}.jpg`;
  await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: 'base64' });
  await MediaLibrary.saveToLibraryAsync(fileUri);
  return true;
}
