import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getPool, listDemoted, promoteDemoted } from '../../api/host';

export function useDemoted(eventId: string, token: string | null) {
  return useQuery({
    queryKey: ['demoted', eventId],
    queryFn: () => listDemoted(eventId, token!),
    enabled: !!token && !!eventId,
  });
}

export function usePool(eventId: string, token: string | null) {
  return useQuery({
    queryKey: ['pool', eventId],
    queryFn: () => getPool(eventId, token!),
    enabled: !!token && !!eventId,
  });
}

export function usePromote(eventId: string, token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (photoId: string) => promoteDemoted(eventId, photoId, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['demoted', eventId] }),
  });
}
