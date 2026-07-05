import { View } from 'react-native';
import { MotiView } from 'moti';
import { AppText } from './Text';
import { colors, radius, role, space } from '../theme';

/** A reassuring progress presenter for background CV jobs. Determinate bar with a
 *  real count when the API gives one (photo processing); otherwise a live shimmer
 *  so a long wait never reads as a hang. Teal fill = the CV is working (glow rule). */
export function JobProgress({
  title,
  hint,
  processed,
  total,
  reduceMotion = false,
}: {
  title: string;
  hint?: string;
  processed?: number | null;
  total?: number | null;
  reduceMotion?: boolean;
}) {
  const determinate = !!total && total > 0;
  const pct = determinate ? Math.min(1, (processed ?? 0) / (total as number)) : 0;

  return (
    <View style={{ width: '100%', gap: space.md, alignItems: 'center', paddingHorizontal: space.xl }}>
      <AppText variant="h1" style={{ textAlign: 'center' }}>{title}</AppText>

      <View
        style={{
          width: '100%',
          height: 8,
          borderRadius: radius.pill,
          backgroundColor: colors.paperSunk,
          overflow: 'hidden',
        }}
      >
        {determinate ? (
          <MotiView
            animate={{ width: `${pct * 100}%` }}
            transition={{ type: 'timing', duration: reduceMotion ? 0 : 400 }}
            style={{ height: '100%', borderRadius: radius.pill, backgroundColor: role.actionDeep }}
          />
        ) : reduceMotion ? (
          <View style={{ height: '100%', width: '100%', backgroundColor: role.actionDeep, opacity: 0.45 }} />
        ) : (
          // ponytail: fixed-width sweep, container clips it — good enough for a shimmer.
          <MotiView
            from={{ translateX: -140 }}
            animate={{ translateX: 360 }}
            transition={{ type: 'timing', duration: 1100, loop: true }}
            style={{ height: '100%', width: 120, backgroundColor: role.actionDeep, borderRadius: radius.pill }}
          />
        )}
      </View>

      {determinate ? (
        <AppText variant="mono" color={colors.inkSoft}>
          {processed ?? 0} / {total}
        </AppText>
      ) : null}
      {hint ? (
        <AppText variant="caption" color={colors.inkFaint} style={{ textAlign: 'center' }}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}
