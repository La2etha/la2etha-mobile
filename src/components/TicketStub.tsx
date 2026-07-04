import { Pressable, View } from 'react-native';
import { AppText } from './Text';
import { colors, radius, space, tint } from '../theme';
import type { EventListItem } from '../api/events';

/** An event as a physical ticket stub: title on the ticket, a dashed tear line
 *  with punched notches, and counts on the stub. Host events carry an orange
 *  "HOST" stamp. The whole card is the open action (tears into the Event Hub). */
export function TicketStub({ event, onPress }: { event: EventListItem; onPress: () => void }) {
  const isHost = event.role === 'host';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${event.name}`}
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: colors.card,
        borderRadius: radius.lg,
        marginBottom: space.lg,
        opacity: pressed ? 0.94 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
        shadowColor: tint.shadow,
        shadowOpacity: 1,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
        elevation: 3,
      })}
    >
      {/* Ticket face */}
      <View style={{ padding: space.xl, paddingBottom: space.lg, gap: space.xs }}>
        {isHost ? (
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: colors.stamp,
              borderRadius: radius.sm,
              paddingHorizontal: space.sm,
              paddingVertical: 2,
              transform: [{ rotate: '-3deg' }],
              marginBottom: space.xs,
            }}
          >
            <AppText variant="mono" color={colors.paper}>HOST</AppText>
          </View>
        ) : null}
        <AppText variant="display" numberOfLines={2}>{event.name}</AppText>
      </View>

      {/* Dashed tear line with punched notches */}
      <View style={{ justifyContent: 'center' }}>
        <View
          style={{
            borderTopWidth: 1,
            borderStyle: 'dashed',
            borderColor: colors.line,
            marginHorizontal: space.md,
          }}
        />
        <View style={[notch, { left: -8 }]} />
        <View style={[notch, { right: -8 }]} />
      </View>

      {/* Stub: counts + share code */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: space.xl,
          paddingTop: space.lg,
        }}
      >
        <View style={{ flexDirection: 'row', gap: space.xs, alignItems: 'baseline' }}>
          <AppText variant="mono" color={colors.inkSoft}>{event.photo_count}</AppText>
          <AppText variant="caption" color={colors.inkFaint}>photos</AppText>
          <AppText variant="caption" color={colors.inkFaint}>·</AppText>
          <AppText variant="mono" color={colors.inkSoft}>{event.member_count}</AppText>
          <AppText variant="caption" color={colors.inkFaint}>
            {event.member_count === 1 ? 'person' : 'people'}
          </AppText>
        </View>
        <AppText variant="mono" color={colors.inkFaint}>{event.join_code}</AppText>
      </View>
    </Pressable>
  );
}

const notch = {
  position: 'absolute' as const,
  width: 16,
  height: 16,
  borderRadius: 8,
  backgroundColor: colors.paper, // punches a hole to the cream ground behind the card
};
