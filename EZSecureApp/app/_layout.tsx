import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Terminal as T } from '@/constants/theme';

export const unstable_settings = { anchor: '(tabs)' };
const theme = { ...DarkTheme, colors: { ...DarkTheme.colors, primary: T.accent, background: T.background, card: T.background, text: T.text, border: T.border, notification: T.accent } };
export default function RootLayout() {
  return <ThemeProvider value={theme}>
    <Stack screenOptions={{ contentStyle: { backgroundColor: T.background } }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'EZSecure', headerTintColor: T.accent, headerStyle: { backgroundColor: T.background } }} />
    </Stack>
    <StatusBar style="light" />
  </ThemeProvider>;
}
