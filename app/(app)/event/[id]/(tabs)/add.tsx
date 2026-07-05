import { Redirect, useLocalSearchParams } from 'expo-router';

// ponytail: same trick as the root ＋ tab — this route never renders, the tab
// press is intercepted in _layout.tsx and pushes the real add.tsx screen instead.
export default function AddTabPlaceholder() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Redirect href={`/(app)/event/${id}/(tabs)/gallery` as never} />;
}
