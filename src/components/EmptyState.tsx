import { View } from 'react-native';
import { GlowButton } from './GlowButton';
import { AppText } from './Text';
import { illustrations } from './illustrations';
import { colors, space } from '../theme/tokens';

/** Illustrated state for every empty/blocked condition (FR-012/014) — replaces
 *  the old demonstration-gallery placeholder and any blank/raw-error screen. */
export function EmptyState({
  art,
  title,
  body,
  actionLabel,
  onAction,
}: {
  art: 'gallery' | 'search' | 'permission' | 'offline';
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const Art = illustrations[art];
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.md }}>
      <Art />
      <AppText variant="h1" style={{ textAlign: 'center' }}>
        {title}
      </AppText>
      {body ? (
        <AppText variant="body" color={colors.inkSoft} style={{ textAlign: 'center' }}>
          {body}
        </AppText>
      ) : null}
      {actionLabel && onAction ? <GlowButton label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}
