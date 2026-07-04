import { apiFetch } from './client';
import { API_BASE_URL } from './config';

export type Relevance = 'main' | 'low';

export type GalleryPhoto = {
  photo_id: string;
  origin: string;
  relevance: Relevance | string;
  demote_reason?: string | null;
  confidence?: number | null;
};

export type GalleryPage = { items: GalleryPhoto[]; next_cursor?: string | null };

export type PhotoFace = { x: number; y: number; w: number; h: number; is_me: boolean };

export type SearchResultPhoto = {
  photo_id: string;
  relevance: string;
  demote_reason?: string | null;
  score: number;
};
export type SearchPage = { items: SearchResultPhoto[]; next_cursor?: string | null };

export function getGallery(eventId: string, token: string, limit = 200): Promise<GalleryPage> {
  return apiFetch<GalleryPage>(`/events/${eventId}/gallery?limit=${limit}`, { token });
}

export function searchGallery(eventId: string, q: string, token: string, limit = 40): Promise<SearchPage> {
  return apiFetch<SearchPage>(
    `/events/${eventId}/gallery/search?q=${encodeURIComponent(q)}&limit=${limit}`,
    { token }
  );
}

export function getPhotoFaces(photoId: string, token: string): Promise<PhotoFace[]> {
  return apiFetch<PhotoFace[]>(`/photos/${photoId}/faces`, { token });
}

export function claimPhoto(photoId: string, token: string): Promise<void> {
  return apiFetch<void>(`/photos/${photoId}/claim`, { method: 'POST', token });
}

export function unclaimPhoto(photoId: string, token: string): Promise<void> {
  return apiFetch<void>(`/photos/${photoId}/claim`, { method: 'DELETE', token });
}

/** Source URL for a photo's bytes. The endpoint is access-guarded, so the caller
 *  must attach the bearer token via expo-image's `source.headers`. */
export function photoUri(photoId: string): string {
  return `${API_BASE_URL}/photos/${photoId}`;
}
