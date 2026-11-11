import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { ActionButton, Badge, GlassPanel, PanelBar, SectionHeading, TerminalScreen, ui } from '@/components/terminal-ui';
import { clearHistory, formatTime, useScanHistory, type ScanType } from '@/lib/scan-history';
import { Terminal as T } from '@/constants/theme';

const tools = [
  { title: 'Phishing scanner', description: 'Look before you click.', command: 'scan --url', icon: 'link', route: '/(tabs)/phishing', label: 'OPEN SCANNER' },
  { title: 'Wi-Fi security', description: 'Inspect network activity.', command: 'scan --network', icon: 'wifi', route: '/(tabs)/wifi', label: 'OPEN SCANNER' },
  { title: 'Malware scanner', description: 'Explore AI threat detection.', command: 'scan --malware', icon: 'shield', route: '/(tabs)/malware', label: 'DEMO SCANNER' },
  { title: 'Password vault', description: 'Keep passwords encrypted.', command: 'vault --open', icon: 'key', route: '/(tabs)/vault', label: 'OPEN VAULT' },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 760;
  const history = useScanHistory();
  const flagged = history.filter((r) => r.verdict === 'flagged').length;
  const stats = [
    [String(history.length), 'Scans run'],
    [String(flagged), 'Flagged'],
    [history.length ? formatTime(history[0].time) : '--', 'Last scan'],
  ];
  const recent = history.slice(0, 8);
  const meta: Record<ScanType, { title: string; icon: ComponentProps<typeof Feather>['name'] }> = {
    phishing: { title: 'Phishing scan', icon: 'link' },
    wifi: { title: 'Wi-Fi scan', icon: 'wifi' },
    malware: { title: 'Malware scan (demo)', icon: 'shield' },
  };
  return <TerminalScreen path="overview">
    <View style={s.welcome}><Text style={s.eyebrow}>YOUR SECURITY, SIMPLIFIED</Text><Text style={ui.small}>Welcome back, Richard.</Text></View>
    <View style={[s.heroRow, wide && { flexDirection: 'row' }]}>
      <GlassPanel style={wide ? s.hero : undefined}>
        <PanelBar title="security_overview" label="01" />
        <View style={[s.heroBody, wide && { padding: 30 }]}>
          <Badge>READY TO SCAN</Badge>
          <Text accessibilityRole="header" style={[s.headline, wide && { fontSize: 39, lineHeight: 49 }]}>A little clarity.{'\n'}<Text style={{ color: T.accent }}>A safer digital life.</Text></Text>
          <Text style={[ui.text, { maxWidth: 450 }]}>Check a link. Review a network. Explore threats. Your security tools, all in one place.</Text>
          <View style={{ maxWidth: 280, width: '100%', marginTop: 6 }}><ActionButton label="Check a suspicious link" onPress={() => router.push('/(tabs)/phishing')} /></View>
          <Text style={[ui.small, { marginTop: 1 }]}>No scan running. Choose a tool to begin.</Text>
        </View>
      </GlassPanel>
    </View>

    <SectionHeading title="Security tools" detail="SELECT A MODULE" />
    <View style={s.tools}>
      {tools.map((tool, i) => <View key={tool.title} style={{ width: wide ? '23.8%' : '48%' }}>
        <Pressable accessibilityRole="button" accessibilityLabel={tool.title}
          accessibilityState={{ disabled: !tool.route }} disabled={!tool.route}
          onPress={() => { if (tool.route) router.push(tool.route as any); }}
          style={({ pressed }) => [s.toolPress, pressed && { opacity: 0.7 }]}>
          <GlassPanel style={[s.toolCard, !tool.route && { opacity: 0.65 }]}>
            <View style={s.toolTop}><View style={s.toolIcon}><Feather name={tool.icon as ComponentProps<typeof Feather>['name']} size={22} color={T.accent} /></View><Text style={s.toolIndex}>0{i + 1}</Text></View>
            <Text style={s.toolTitle}>{tool.title}</Text>
            <Text style={s.toolDescription}>{tool.description}</Text>
            <Text style={s.toolCommand}>{'> '}{tool.command}</Text>
            <View style={s.toolBottom}><Text style={s.toolLabel}>{tool.label}</Text><Feather name={tool.route ? 'arrow-up-right' : 'lock'} size={13} color={T.muted} /></View>
          </GlassPanel>
        </Pressable>
      </View>)}
    </View>

    <SectionHeading title="Your activity" detail="SAVED ON THIS DEVICE" />
    <GlassPanel>
      <View style={s.demoStats}>
        {stats.map(([value, label]) => <View style={s.stat} key={label}><Text style={s.statValue}>{value}</Text><Text style={s.statLabel}>{label}</Text></View>)}
      </View>
      {recent.length === 0
        ? <View style={s.activity}><Feather name="clock" size={18} color={T.dim} /><View style={ui.flex}><Text style={s.activityTitle}>No scans yet</Text><Text style={ui.small}>Run a scanner and your results will show up here.</Text></View></View>
        : recent.map((r) => <View key={r.id} style={s.activity}>
            <Feather name={meta[r.type].icon} size={18} color={r.verdict === 'safe' ? T.accent : T.danger} />
            <View style={ui.flex}><Text style={s.activityTitle}>{meta[r.type].title}</Text><Text selectable numberOfLines={1} style={ui.small}>{r.detail}</Text><Text style={ui.small}>{formatTime(r.time)}</Text></View>
            <Badge tone={r.verdict === 'safe' ? 'success' : 'danger'}>{r.verdict === 'safe' ? 'SAFE' : 'FLAGGED'}</Badge>
          </View>)}
      {history.length > 0 && <Pressable accessibilityRole="button" accessibilityLabel="Clear scan history" onPress={clearHistory} style={({ pressed }) => [s.demoNote, pressed && { opacity: 0.7 }]}><Text style={[ui.small, { color: T.accent }]}>Clear history</Text></Pressable>}
      {history.length > 0 && <Text style={[ui.small, { paddingHorizontal: 18, paddingBottom: 16 }]}>Wi-Fi and malware scans are prototype demos, so their results don't describe your phone.</Text>}
    </GlassPanel>
  </TerminalScreen>;
}

const s = StyleSheet.create({
  welcome: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10, marginBottom: 18 },
  eyebrow: { fontFamily: T.mono, fontSize: 10, letterSpacing: 1.6, color: T.accent, lineHeight: 18 },
  heroRow: { gap: 16 },
  hero: { flex: 1 },
  heroBody: { padding: 24, gap: 18 },
  headline: { fontFamily: T.mono, color: T.text, fontSize: 28, lineHeight: 38, fontWeight: '700', letterSpacing: -1.5 },
  tools: { flexDirection: 'row', flexWrap: 'wrap', gap: '1.6%', rowGap: 14, justifyContent: 'space-between' },
  toolPress: { flex: 1 },
  toolCard: { padding: 18, height: '100%' },
  toolTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 },
  toolIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(119,245,164,.06)', borderWidth: 1, borderColor: T.border },
  toolIndex: { fontFamily: T.mono, fontSize: 10, color: T.dim },
  toolTitle: { fontFamily: T.mono, fontSize: 15, lineHeight: 22, fontWeight: '600', color: T.text, marginBottom: 8 },
  toolDescription: { fontFamily: T.mono, fontSize: 11, lineHeight: 19, color: T.muted, marginBottom: 16, flex: 1 },
  toolCommand: { fontFamily: T.mono, fontSize: 10, lineHeight: 19, color: T.accent, marginBottom: 18 },
  toolBottom: { borderTopWidth: 1, borderTopColor: T.border, paddingTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4 },
  toolLabel: { fontFamily: T.mono, fontSize: 8, lineHeight: 14, letterSpacing: 0.5, color: T.muted, flexShrink: 1 },
  demoStats: { flexDirection: 'row', paddingVertical: 22 },
  stat: { flex: 1, alignItems: 'center', paddingHorizontal: 6 },
  statValue: { fontFamily: T.mono, fontSize: 26, color: T.accent, fontWeight: '600' },
  statLabel: { fontFamily: T.mono, fontSize: 10, lineHeight: 17, color: T.muted, textAlign: 'center', marginTop: 6 },
  activity: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderTopWidth: 1, borderTopColor: T.border },
  activityTitle: { fontFamily: T.mono, fontSize: 12, lineHeight: 21, color: T.text },
  demoNote: { fontFamily: T.mono, fontSize: 10, lineHeight: 18, color: T.muted, padding: 18, borderTopWidth: 1, borderTopColor: T.border },
});
