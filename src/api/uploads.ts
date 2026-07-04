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
