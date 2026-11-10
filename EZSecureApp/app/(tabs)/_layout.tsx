import Feather from '@expo/vector-icons/Feather';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticTab } from '@/components/haptic-tab';
import { Terminal as T } from '@/constants/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return <Tabs screenOptions={{
    headerShown: false, tabBarButton: HapticTab,
    tabBarActiveTintColor: T.accent, tabBarInactiveTintColor: T.dim,
    tabBarLabelPosition: 'below-icon',
    tabBarLabelStyle: { fontFamily: T.mono, fontSize: 10, marginTop: 4 },
    tabBarItemStyle: { paddingTop: 8, paddingBottom: 6 },
    tabBarStyle: {
      backgroundColor: '#09130E', borderTopColor: T.border, borderTopWidth: StyleSheet.hairlineWidth,
      height: 68 + insets.bottom, paddingBottom: insets.bottom, paddingHorizontal: 4,
    },
  }}>
    <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <Feather name="grid" size={21} color={color} /> }} />
    <Tabs.Screen name="phishing" options={{ title: 'Phishing', tabBarIcon: ({ color }) => <Feather name="link" size={21} color={color} /> }} />
    <Tabs.Screen name="wifi" options={{ title: 'Wi-Fi', tabBarIcon: ({ color }) => <Feather name="wifi" size={21} color={color} /> }} />
    <Tabs.Screen name="malware" options={{ title: 'Malware', tabBarIcon: ({ color }) => <Feather name="shield" size={21} color={color} /> }} />
    <Tabs.Screen name="explore" options={{ title: 'Explore', tabBarIcon: ({ color }) => <Feather name="compass" size={21} color={color} /> }} />
  </Tabs>;
}
