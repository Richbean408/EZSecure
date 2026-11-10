import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { ActionButton, Badge, GlassPanel, PageHeading, PanelBar, ResultPanel, ScannerGlyph, SectionHeading, TerminalScreen, TipList, ui } from '@/components/terminal-ui';
import { addScan } from '@/lib/scan-history';
import { Terminal as T } from '@/constants/theme';

type Result = 'safe' | 'warning' | 'error';
export default function WifiScreen() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [issues, setIssues] = useState<string[]>([]);
  const [lastScan, setLastScan] = useState('Not scanned yet');
  const wide = useWindowDimensions().width >= 760;
  const scanWifi = async () => {
    if (scanning) return;
    setScanning(true); setResult(null); setIssues([]);
    try {
      const response = await fetch('https://ezsecure-api.onrender.com/wifi-scan');
      const data = await response.json();
      if (!response.ok || !['safe', 'warning'].includes(data.status) || !Array.isArray(data.issues) || !data.issues.every((issue: unknown) => typeof issue === 'string')) throw new Error('Invalid scan response');
      setResult(data.status); setIssues(data.issues);
      addScan({ type: 'wifi', verdict: data.status === 'safe' ? 'safe' : 'flagged', detail: data.status === 'safe' ? 'No issues reported' : data.issues.length + ' connection(s) to review' });
      setLastScan(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch { setResult('error'); }
    finally { setScanning(false); }
  };

  return <TerminalScreen path="wifi">
    <PageHeading eyebrow="02 / NETWORK ANALYSIS" title="Wi-Fi security" description="Inspect suspicious connections with a simple network check." />
    <View style={[s.columns, wide && { flexDirection: 'row', alignItems: 'flex-start' }]}>
      <View style={wide ? ui.flex : undefined}>
        <GlassPanel>
          <PanelBar title="network_scanner" label="NETWORK" />
          <View style={ui.centered}>
            <ScannerGlyph icon="wifi" tone={result === 'warning' || result === 'error' ? 'warning' : 'success'} />
            <Badge tone={scanning || result === 'warning' || result === 'error' ? 'warning' : 'success'}>{scanning ? 'SCANNING' : result === 'safe' ? 'SCAN COMPLETE' : result === 'warning' ? 'REVIEW NEEDED' : result === 'error' ? 'TRY AGAIN' : 'READY'}</Badge>
            <Text accessibilityLiveRegion="polite" style={ui.title}>{scanning ? 'Checking connections...' : result === 'safe' ? 'No issues reported' : result === 'warning' ? 'Connections to review' : result === 'error' ? 'Scan unavailable' : 'Take a closer look.'}</Text>
            <Text style={ui.small}>Last completed scan: {lastScan}</Text>
            <View style={{ alignSelf: 'stretch', marginTop: 4 }}><ActionButton label={scanning ? 'Scanning network...' : 'Scan Now'} loading={scanning} onPress={scanWifi} icon="wifi" /></View>
          </View>
          <View style={s.scope}><Feather name="info" size={16} color={T.muted} /><Text style={[ui.small, ui.flex]}>This prototype checks the network of the server running the scanner, not your phone’s Wi-Fi connection.</Text></View>
        </GlassPanel>
        {result === 'safe' && <ResultPanel tone="success" title="No suspicious connections" description="The scanner reported no suspicious connections on the server it checked." />}
        {result === 'warning' && <ResultPanel tone="warning" title={issues.length + ' suspicious connection(s)'} description="The scanner flagged the connections below for review." />}
        {result === 'error' && <ResultPanel tone="warning" title="Could not complete scan" description="The scanner could not return a result. Check your connection and try again." />}
        {issues.length > 0 && <>
          <SectionHeading title="Flagged connections" detail={String(issues.length).padStart(2, '0') + ' FOUND'} />
          <GlassPanel tone="warning">{issues.map((issue, i) => <View key={i} style={[s.issue, i > 0 && s.border]}><Feather name="alert-triangle" size={18} color={T.warning} /><View style={ui.flex}><Text selectable style={ui.text}>{issue}</Text><Text style={ui.small}>Reported by the scanner</Text></View></View>)}</GlassPanel>
        </>}
      </View>
      <View style={wide ? { width: 320 } : undefined}>
        <SectionHeading title="Security notes" detail="GOOD HABITS" />
        <TipList items={['Use HTTPS websites when you connect to public Wi-Fi.', 'Avoid accessing bank accounts on public networks.', 'Use a VPN for extra protection on public Wi-Fi.', 'Watch for unusual network activity on your device.']} />
      </View>
    </View>
  </TerminalScreen>;
}
const s = StyleSheet.create({
  columns: { gap: 20 },
  scope: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', padding: 18, borderTopWidth: 1, borderTopColor: T.border },
  issue: { flexDirection: 'row', gap: 12, padding: 18, alignItems: 'flex-start' },
  border: { borderTopWidth: 1, borderTopColor: T.border },
});
