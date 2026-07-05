import { View } from 'react-native';
import { Icon } from './Icon';
import { AppText } from './Text';
import { colors, radius, role, space } from '../theme/tokens';

const toneBg = { teal: colors.paperSunk, identity: '#f7e3d6', neutral: colors.paperSunk } as const;
const toneFg = { teal: role.actionDeep, identity: role.identity, neutral: colors.inkFaint } as const;

/** A count/filter pill. Tone drives color role: teal for app chrome, identity
 *  (orange) reserved for "you"/host-adjacent chips, neutral for plain metadata. */
export function Chip({
  label,
  icon,
  tone = 'neutral',
}: {
  label: string;
  icon?: keyof typeof import('@expo/vector-icons').Feather.glyphMap;
  tone?: 'teal' | 'identity' | 'neutral';
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.xs,
        backgroundColor: toneBg[tone],
        borderRadius: radius.pill,
        paddingHorizontal: space.md,
        paddingVertical: space.xs,
        alignSelf: 'flex-start',
      }}
    >
      {icon ? <Icon name={icon} size={14} color={toneFg[tone]} /> : null}
      <AppText variant="caption" color={toneFg[tone]}>
        {label}
      </AppText>
    </View>
  );
}

const EVENT_TYPE_LABEL: Record<string, string> = {
  wedding: '💍 Wedding',
  graduation: '🎓 Grad',
  iftar: '🌙 Iftar',
  birthday: '🎂 Birthday',
  trip: '🧳 Trip',
  other: 'Event',
};

/** Event-type chip (spec 005 US3): omitted entirely when the event has no
 *  type, never rendered empty. */
export function EventTypeChip({ type }: { type?: string | null }) {
  if (!type) return null;
  return <Chip label={EVENT_TYPE_LABEL[type] ?? type} tone="teal" />;
}
