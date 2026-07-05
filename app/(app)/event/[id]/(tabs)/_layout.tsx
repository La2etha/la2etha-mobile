import { Tabs, usePathname, useRouter } from 'expo-router';
import { Icon } from '../../../../../src/components/Icon';
import { RaisedTabButton, tabBarStyle } from '../../../../../src/components/RaisedTabButton';
import { role } from '../../../../../src/theme/tokens';

// In-event tabbed shell (D4), shown once enrolled: Gallery · Search · ＋ · You.
export default function EventTabsLayout() {
  const router = useRouter();
  // `usePathname()` reflects the literal URL (groups like (app)/(tabs) never
  // appear in it), so this is the one source that can't be stale or
  // unresolved the way local/global search-param hooks were on this layout —
  // e.g. "/event/68f2.../gallery". Regex out the id directly.
  const pathname = usePathname();
  const id = pathname.match(/\/event\/([^/]+)/)?.[1] ?? '';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: role.activeNav,
        tabBarInactiveTintColor: role.inactiveNav,
        tabBarStyle,
      }}
    >
      {/* Only "gallery" is reached via an explicit href (the redirect from the
          launcher), so it's the only tab React Navigation initializes with the
          `id` param out of the box. The other tabs are reached by a plain tab
          press — no href, no params — so they'd otherwise mount with `id`
          undefined. `initialParams` seeds each tab's own route state with the
          same `id` this layout already resolved. */}
      <Tabs.Screen
        name="gallery"
        initialParams={{ id }}
        options={{
          title: 'Gallery',
          tabBarIcon: ({ color, size }) => <Icon name="image" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="search"
        initialParams={{ id }}
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => <Icon name="search" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="add"
        initialParams={{ id }}
        options={{
          title: '',
          tabBarButton: () => (
            <RaisedTabButton onPress={() => router.push(`/(app)/event/${id}/add` as never)} />
          ),
        }}
        listeners={{ tabPress: (e) => e.preventDefault() }}
      />
      <Tabs.Screen
        name="you"
        initialParams={{ id }}
        options={{
          title: 'You',
          tabBarIcon: ({ color, size }) => <Icon name="user" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
