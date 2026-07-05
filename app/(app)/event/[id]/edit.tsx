import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

/** FR-011: this screen folded into the editor's AI tab. Preserves params. */
export default function AiEditRedirect() {
  const { id, photoId } = useLocalSearchParams<{ id: string; photoId: string }>();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/(app)/event/${id}/editor?photoId=${photoId}&tab=ai` as never);
  }, [id, photoId]);

  return null;
}
