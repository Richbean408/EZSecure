import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton, GlassPanel, PageHeading, PanelBar, SectionHeading, TerminalScreen, ui } from '@/components/terminal-ui';
import { Terminal as T } from '@/constants/theme';

const questions = [
  { question: 'What does a phishing result mean?', answer: 'The scanner classifies the URL using its AI models. A safe result is a model prediction, not a guarantee. Flagged links are shown in your recent scans; this app does not automatically block them.' },
  { question: 'Does Wi-Fi security scan my phone?', answer: 'In this prototype, the Wi-Fi check runs on the API server. It reports that server’s suspicious connections, not your phone’s local Wi-Fi network.' },
  { question: 'Is malware scanning live?', answer: 'The current malware screen sends generated sample metrics to the AI models. Demo results explain the models’ predictions; they do not tell you whether your device has malware.' },
  { question: 'Are my recent scans saved?', answer: 'Recent link scans stay in memory while this app session is open. They reset when you reload or restart the app.' },
  { question: 'Can I turn on the VPN?', answer: 'The VPN module is a placeholder in the original prototype and is not available yet.' },
];

export default function ExploreScreen() {
  const router = useRouter();
  return <TerminalScreen path="explore">
    <PageHeading eyebrow="04 / FIELD GUIDE" title="A little know-how" description="Get to know your tools and make sense of their results." />
    <GlassPanel>
      <PanelBar title="quick_start" label="READ ME" />
      <View style={ui.body}>
        <Text style={ui.command}>$ help --getting-started</Text>
        <Text style={s.title}>Start with a link.</Text>
        <Text style={ui.text}>Received an unfamiliar URL? Copy it, paste it into the phishing scanner, and review the result before you decide what to do.</Text>
        <ActionButton label="Open phishing scanner" onPress={() => router.push('/(tabs)/phishing')} />
      </View>
    </GlassPanel>
    <SectionHeading title="Reading the results" detail="STATUS GUIDE" />
    <GlassPanel style={{ paddingHorizontal: 20 }}>
      {[
        { title: 'Green / no issue detected', text: 'The model or scanner did not flag the submitted input.', color: T.accent, icon: 'check-circle' as const },
        { title: 'Amber / review needed', text: 'Review the reported activity, or retry an unavailable scan.', color: T.warning, icon: 'alert-triangle' as const },
        { title: 'Red / threat flagged', text: 'The submitted input was classified as a potential threat.', color: T.danger, icon: 'shield-off' as const },
      ].map((item, i) => <View key={item.title} style={[s.statusRow, i > 0 && s.border]}><Feather name={item.icon} size={21} color={item.color} /><View style={ui.flex}><Text style={[s.statusTitle, { color: item.color }]}>{item.title}</Text><Text style={ui.text}>{item.text}</Text></View></View>)}
    </GlassPanel>
    <SectionHeading title="Good to know" detail="FAQ" />
    <GlassPanel>{questions.map((item, i) => <Question key={item.question} {...item} first={i === 0} />)}</GlassPanel>
  </TerminalScreen>;
}
function Question({ question, answer, first }: { question: string; answer: string; first: boolean }) {
  const [open, setOpen] = useState(false);
  return <View style={!first && s.border}><Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen(value => !value)} style={({ pressed }) => [s.question, pressed && { opacity: 0.7 }]}><Text style={s.questionText}>{question}</Text><Feather name={open ? 'minus' : 'plus'} size={18} color={T.accent} /></Pressable>{open && <Text style={[ui.text, { paddingHorizontal: 20, paddingBottom: 20 }]}>{answer}</Text>}</View>;
}
const s = StyleSheet.create({
  title: { fontFamily: T.mono, fontSize: 24, lineHeight: 32, color: T.text, fontWeight: '600' },
  statusRow: { flexDirection: 'row', gap: 16, alignItems: 'flex-start', paddingVertical: 22 },
  statusTitle: { fontFamily: T.mono, fontSize: 13, lineHeight: 22, fontWeight: '600', marginBottom: 6 },
  border: { borderTopWidth: 1, borderTopColor: T.border },
  question: { flexDirection: 'row', gap: 16, padding: 20, alignItems: 'center', minHeight: 64 },
  questionText: { flex: 1, fontFamily: T.mono, fontSize: 13, lineHeight: 22, color: T.text },
});
