import { Platform } from 'react-native';

/** Shared terminal palette, used regardless of the device color scheme. */
export const Terminal = {
  background: '#030706',
  panel: 'rgba(17, 30, 23, 0.82)',
  inset: 'rgba(2, 9, 5, 0.72)',
  border: 'rgba(130, 231, 161, 0.18)',
  accent: '#77F5A4',
  text: '#D7F8E2',
  muted: '#94B7A1',
  dim: '#719380',
  warning: '#FFD181',
  danger: '#FF9399',
  mono: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
};
const palette = {
  text: Terminal.text, background: Terminal.background, tint: Terminal.accent,
  icon: Terminal.muted, tabIconDefault: Terminal.muted, tabIconSelected: Terminal.accent,
};
export const Colors = { light: palette, dark: palette };
export const Fonts = { sans: Terminal.mono, serif: 'serif', rounded: Terminal.mono, mono: Terminal.mono };
