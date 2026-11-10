import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { ActionButton, Badge, GlassPanel, PageHeading, PanelBar, ResultPanel, ScannerGlyph, SectionHeading, TerminalScreen, TipList, ui } from '@/components/terminal-ui';
import { type Check, runDeviceChecks } from '@/lib/network-checks';
import { addScan } from '@/lib/scan-history';
import { Terminal as T } from '@/constants/theme';

type Result = 'safe' | 'warning';

export default function WifiScreen() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [checks, setChecks] = useState<Check[]>([]);
  const [lastScan, setLastScan] = useState('Not scanned yet');
  const wide = useWindowDimensions().width >= 760;

  const scanWifi = async () => {
    if (scanning) return;
    setScanning(true); setResult(null); setChecks([]);
    try {
      const found = await runDeviceChecks();
      const warned = found.some((c) => c.status === 'warn');
      setChecks(found);
      setResult(warned ? 'warning' : 'safe');
      setLastScan(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      const counted = found.filter((c) => c.status !== 'info');
      addScan({ type: 'wifi', verdict: warned ? 'flagged' : 'safe', detail: `${found.filter((c) => c.status === 'pass').length}/${counted.length} checks passed` });
    } finally { setScanning(false); }
  };

  const iconFor = (c: Check) => c.status === 'pass' ? 'check-circle' : c.status === 'warn' ? 'alert-triangle' : 'info';
  const colorFor = (c: Check) => c.status === 'pass' ? T.accent : c.status === 'warn' ? T.warning : T.muted;
  const warnCount = checks.filter((c) => c.status === 'warn').length;

  return <TerminalScreen path="wifi">
    <PageHeading eyebrow="02 / NETWORK ANALYSIS" title="Wi-Fi security" description="Check the network you are on. Results are possible risks, not confirmed threats." />
    <View style={[s.columns, wide && { flexDirection: 'row', alignItems: 'flex-start' }]}>
      <View style={wide ? ui.flex : undefined}>
        <GlassPanel>
          <PanelBar title="network_scanner" label="THIS DEVICE" />
          <View style={ui.centered}>
            <ScannerGlyph icon="wifi" tone={result === 'warning' ? 'warning' : 'success'} />
            <Badge tone={scanning || result === 'warning' ? 'warning' : 'success'}>{scanning ? 'SCANNING' : result === 'safe' ? 'SCAN COMPLETE' : result === 'warning' ? 'REVIEW NEEDED' : 'READY'}</Badge>
            <Text accessibilityLiveRegion="polite" style={ui.title}>{scanning ? 'Checking your network...' : result === 'safe' ? 'Looks normal' : result === 'warning' ? 'Possible risks found' : 'Take a closer look.'}</Text>
            <Text style={ui.small}>Last completed scan: {lastScan}</Text>
            <View style={{ alignSelf: 'stretch', marginTop: 4 }}><ActionButton label={scanning ? 'Scanning network...' : 'Scan My Network'} loading={scanning} onPress={scanWifi} icon="wifi" /></View>
          </View>
          <View style={s.scope}>
            <Feather name="info" size={16} color={T.muted} />
            <Text style={[ui.small, ui.flex]}>These checks run on this device and look at its own connection. A phone app can't see other devices or apps, so this is a basic check, not a full security audit.</Text>
          </View>
        </GlassPanel>

        {result === 'safe' && <ResultPanel tone="success" title="Your connection looks normal" description="The checks below passed. This is a basic check, not a guarantee of safety." />}
        {result === 'warning' && <ResultPanel tone="warning" title={warnCount + ' possible risk(s)'} description="These are unusual results, not confirmed threats. Review them below." />}

        {checks.length > 0 && <>
          <SectionHeading title="Checks" detail={String(checks.length).padStart(2, '0') + ' RUN'} />
          <GlassPanel>{checks.map((c, i) => <View key={c.id} style={[s.row, i > 0 && s.border]}>
            <Feather name={iconFor(c)} size={18} color={colorFor(c)} />
            <View style={ui.flex}><Text style={[ui.text, { color: T.text }]}>{c.label}</Text><Text style={ui.small}>{c.detail}</Text></View>
          </View>)}</GlassPanel>
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
  row: { flexDirection: 'row', gap: 12, padding: 18, alignItems: 'flex-start' },
  border: { borderTopWidth: 1, borderTopColor: T.border },
});
