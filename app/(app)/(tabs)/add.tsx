import { Redirect } from 'expo-router';

// ponytail: the raised ＋ tab intercepts its own press (see _layout.tsx) and
// opens an ActionSheet instead of navigating — this route never actually renders,
// it just needs to exist for Tabs to register the tab slot.
export default function AddTabPlaceholder() {
  return <Redirect href={'/(app)/(tabs)' as never} />;
}
