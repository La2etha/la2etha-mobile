import { apiFetchImage } from './client';

/** Export a photo. Default returns the original bytes (works everywhere).
 *  `removeStrangers` inpaints unclaimed background people (F6) — 503s if the
 *  LaMa model isn't installed on the server. Returns a data: URI. */
export function exportPhoto(photoId: string, token: string, removeStrangers = false): Promise<string> {
  return apiFetchImage(`/photos/${photoId}/export`, {
    method: 'POST',
    jsonBody: { remove_strangers: removeStrangers },
    token,
  });
}

/** AI-edit a SOLO photo of the caller (F7 stretch). Consent required; 403 if the
 *  photo has other people; 503 if no Gemini key is configured. Returns a data: URI. */
export function editPhoto(photoId: string, token: string, prompt: string): Promise<string> {
  return apiFetchImage(`/photos/${photoId}/edit`, {
    method: 'POST',
    jsonBody: { prompt, consent: true },
    token,
  });
}
