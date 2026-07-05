import { useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Icon } from '../../../src/components/Icon';
import { RaisedTabButton, tabBarStyle } from '../../../src/components/RaisedTabButton';
import { ActionSheet } from '../../../src/components/ActionSheet';
import { role } from '../../../src/theme/tokens';

// Root nav (D4): Events · Profile + a raised ＋ that opens Create/Join, not a
// third screen — the ＋ is an action, not a destination (FR-003).
export default function TabsLayout() {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: role.activeNav,
          tabBarInactiveTintColor: role.inactiveNav,
          tabBarStyle,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Events',
            tabBarIcon: ({ color, size }) => <Icon name="calendar" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: '',
            tabBarButton: () => <RaisedTabButton onPress={() => setAddOpen(true)} />,
          }}
          listeners={{ tabPress: (e) => e.preventDefault() }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => <Icon name="user" color={color} size={size} />,
          }}
        />
      </Tabs>

      <ActionSheet
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        items={[
          { icon: 'plus-circle', label: 'Create an event', onPress: () => router.push('/(app)/create' as never) },
          { icon: 'hash', label: 'Join with a code', onPress: () => router.push('/(app)/join' as never) },
        ]}
      />
    </>
  );
}
