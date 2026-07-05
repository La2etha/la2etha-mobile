/** Build a React Native multipart file part from a local image URI.
 *  RN's fetch understands the { uri, name, type } shape on FormData. */
export function imagePart(uri: string, name: string) {
  const type = uri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
  return { uri, name, type } as unknown as Blob; // FormData.append types want Blob
}

export function filesFormData(uris: string[], prefix: string): FormData {
  const fd = new FormData();
  uris.forEach((uri, i) => fd.append('files', imagePart(uri, `${prefix}-${i}.jpg`)));
  return fd;
}

/** Video support (spec 003): a local video URI as a multipart file part. */
export function videoPart(uri: string, name: string) {
  return { uri, name, type: 'video/mp4' } as unknown as Blob;
}

/** Mixed-media multipart (spec 003 US2 Add flow): each URI is uploaded as an
 * image or video part based on its extension. */
export function mediaFormData(uris: string[], prefix: string): FormData {
  const fd = new FormData();
  uris.forEach((uri, i) => {
    const isVideo = /\.(mp4|mov|m4v)$/i.test(uri);
    fd.append(
      'files',
      isVideo ? videoPart(uri, `${prefix}-${i}.mp4`) : imagePart(uri, `${prefix}-${i}.jpg`)
    );
  });
  return fd;
}
