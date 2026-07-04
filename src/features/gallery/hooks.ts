import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { claimPhoto, getGallery, getPhotoFaces, searchGallery, unclaimPhoto } from '../../api/gallery';

export function useSearch(eventId: string, token: string | null, query: string) {
  return useQuery({
    queryKey: ['search', eventId, query],
    queryFn: () => searchGallery(eventId, query, token!),
    enabled: !!token && !!eventId && query.trim().length > 0,
    retry: false, // a 503 "feature off" should surface at once, not retry
  });
}

export function useGallery(eventId: string, token: string | null) {
  return useQuery({
    queryKey: ['gallery', eventId],
    queryFn: () => getGallery(eventId, token!),
    enabled: !!token && !!eventId,
  });
}

export function usePhotoFaces(photoId: string, token: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['faces', photoId],
    queryFn: () => getPhotoFaces(photoId, token!),
    enabled: !!token && !!photoId && enabled,
  });
}

/** Claim / unclaim a photo, then refresh the gallery it belongs to. */
export function useClaim(eventId: string, token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ photoId, claimed }: { photoId: string; claimed: boolean }) =>
      claimed ? claimPhoto(photoId, token!) : unclaimPhoto(photoId, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gallery', eventId] }),
  });
}
