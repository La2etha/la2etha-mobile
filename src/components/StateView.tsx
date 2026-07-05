import { View, ActivityIndicator } from 'react-native';
import { AppText } from './Text';
import { GlowButton } from './GlowButton';
import { colors, space } from '../theme/tokens';

// Unified loading / empty / error presenter. Copy is always warm and blameless.
// Illustrated states (gallery/search/permission/offline) use EmptyState instead.
export function StateView({
  kind,
  title,
  message,
  actionLabel,
  onAction,
}: {
  kind: 'loading' | 'error' | 'empty';
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: space.xl,
        gap: space.md,
      }}
    >
      {kind === 'loading' ? <ActivityIndicator color={colors.inkSoft} /> : null}
      <AppText variant="h1" style={{ textAlign: 'center' }}>
        {title}
      </AppText>
      {message ? (
        <AppText variant="body" color={colors.inkSoft} style={{ textAlign: 'center' }}>
          {message}
        </AppText>
      ) : null}
      {actionLabel && onAction ? <GlowButton label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}
