import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { ActionButton, GlassPanel, PageHeading, TerminalScreen, ui } from '@/components/terminal-ui';

export default function ModalScreen() {
  const router = useRouter();
  return <TerminalScreen path="about"><PageHeading eyebrow="PERSONAL SECURITY CONSOLE" title="EZSecure" description="Your security tools, all in one place." /><GlassPanel><View style={ui.body}><ActionButton label="Return to dashboard" onPress={() => router.replace('/')} /></View></GlassPanel></TerminalScreen>;
}
