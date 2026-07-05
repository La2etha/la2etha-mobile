import { useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { AppText } from './Text';
import { AvatarRow } from './Avatar';
import { CoverImage } from './CoverImage';
import { EventTypeChip } from './Chip';
import { colors, radius, role, space, tint } from '../theme/tokens';
import { motion } from '../theme/motion';
import { buildEventPassVM } from '../features/events/eventPass';
import { useReducedMotion } from '../lib/reduceMotion';
import { coverUri as buildCoverUri, type EventListItem } from '../api/events';

const AView = Animated.createAnimatedComponent(View);

/** The event as a keepsake pass (FR-005/006): boarding-pass when a cover photo
 *  loads, people-pass otherwise — same tear line, notches, and HOST stamp either
 *  way. Evolves TicketStub with the cover-image + member-preview variants. */
export function EventPass({
  event,
  token,
  onOpen,
}: {
  event: EventListItem;
  token: string;
  onOpen: () => void;
}) {
  const [coverFailed, setCoverFailed] = useState(false);
  const coverUri = event.has_cover ? buildCoverUri(event.id) : undefined;
  const vm = buildEventPassVM(event, { coverUri, coverFailed });
  const reduce = useReducedMotion();
  const lift = useSharedValue(0); // 0 rest → 1 torn open

  // Tear-to-enter (D5): simpler lift + crossfade rather than a physical tear.
  // Reduced motion skips straight to onOpen (an instant crossfade via the Stack nav).
  const tearStyle = useAnimatedStyle(() => ({
    opacity: 1 - lift.value,
    transform: [{ translateY: -lift.value * 12 }, { scale: 1 + lift.value * 0.02 }],
  }));

  function open() {
    if (reduce) return onOpen();
    lift.value = withTiming(1, { duration: motion.fast, easing: motion.easeOutQuint });
    setTimeout(() => {
      onOpen();
      // The pushed screen covers the list now — snap back instantly so the
      // card isn't left faded-out (lift=1) for when the user navigates back;
      // the Stack keeps this screen mounted underneath rather than remounting it.
      lift.value = 0;
    }, motion.fast);
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${event.name}`}
      onPress={open}
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
      <AView style={tearStyle}>
      <View style={{ padding: space.xl, paddingBottom: space.lg, gap: space.sm }}>
        {vm.isHost ? (
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: role.identity,
              borderRadius: radius.sm,
              paddingHorizontal: space.sm,
              paddingVertical: 2,
              transform: [{ rotate: '-3deg' }],
            }}
          >
            <AppText variant="mono" color={colors.paper}>HOST</AppText>
          </View>
        ) : null}
        <AppText variant="display" numberOfLines={2}>{event.name}</AppText>
        <EventTypeChip type={event.event_type} />

        {vm.variant === 'boarding' ? (
          <CoverImage uri={coverUri!} token={token} onError={() => setCoverFailed(true)} />
        ) : (
          <AvatarRow items={vm.memberPreview.map((m) => ({ monogram: m.monogram }))} max={4} />
        )}
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
          <AppText variant="mono" color={role.actionDeep}>{vm.photoCount}</AppText>
          <AppText variant="caption" color={colors.inkFaint}>photos</AppText>
          <AppText variant="caption" color={colors.inkFaint}>·</AppText>
          <AppText variant="mono" color={role.actionDeep}>{vm.memberCount}</AppText>
          <AppText variant="caption" color={colors.inkFaint}>
            {vm.memberCount === 1 ? 'person' : 'people'}
          </AppText>
        </View>
        <AppText variant="mono" color={colors.inkFaint}>{vm.code}</AppText>
      </View>
      </AView>
    </Pressable>
  );
}

const notch = {
  position: 'absolute' as const,
  width: 16,
  height: 16,
  borderRadius: 8,
  backgroundColor: colors.paper,
};
