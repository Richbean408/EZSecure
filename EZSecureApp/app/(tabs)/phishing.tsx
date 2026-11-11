import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionButton, Badge, GlassPanel, PageHeading, PanelBar, ResultPanel, SectionHeading, TerminalScreen, ui } from '@/components/terminal-ui';
import { addScan } from '@/lib/scan-history';
import { Terminal as T } from '@/constants/theme';

type Result = 'safe' | 'phishing' | 'error';
type Scan = { url: string; status: 'safe' | 'phishing'; time: string };

export default function PhishingScreen() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [scanning, setScanning] = useState(false);
  const [focused, setFocused] = useState(false);
  const [recentScans, setRecentScans] = useState<Scan[]>([]);
  const [scannedUrl, setScannedUrl] = useState('');

  const scanUrl = async () => {
    const submittedUrl = url.trim();
    if (!submittedUrl || scanning) return;
    setScanning(true);
    setResult(null);
    setScannedUrl(submittedUrl);
    try {
      const response = await fetch('https://ezsecure-api.onrender.com/scan', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: submittedUrl }),
      });
      const data = await response.json();
      if (!response.ok || (data.result !== 'safe' && data.result !== 'phishing')) throw new Error('Invalid scan response');
      setResult(data.result);
      addScan({ type: 'phishing', verdict: data.result === 'safe' ? 'safe' : 'flagged', detail: submittedUrl });
      setRecentScans(prev => [{ url: submittedUrl, status: data.result, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...prev].slice(0, 20));
    } catch {
      setResult('error');
    } finally {
      setScanning(false);
    }
  };

  return <TerminalScreen path="phishing">
    <PageHeading eyebrow="01 / LINK ANALYSIS" title="Phishing scanner" description="A second look, before the first click. Paste a link to check for signs of phishing." />
    <GlassPanel>
      <PanelBar title="url_scanner" label="RANDOM FOREST" />
      <View style={ui.body}>
        <Badge tone={scanning ? 'warning' : 'success'}>{scanning ? 'ANALYZING URL' : 'AWAITING INPUT'}</Badge>
        <Text style={ui.command}>$ scan --url</Text>
        <View style={{ gap: 10 }}>
          <Text style={s.label}>URL to analyze</Text>
          <View style={[s.inputWrap, focused && { borderColor: T.accent }]}>
            <Feather name="link" size={18} color={T.accent} />
            <TextInput accessibilityLabel="URL to analyze" style={s.input}
              placeholder="https://example.com" placeholderTextColor={T.dim}
              value={url} onChangeText={setUrl} autoCapitalize="none" autoCorrect={false}
              keyboardType="url" returnKeyType="go" selectionColor={T.accent}
              onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
              onSubmitEditing={scanUrl} editable={!scanning} />
          </View>
        </View>
        <ActionButton label={scanning ? 'Scanning URL...' : 'Scan URL'} loading={scanning} disabled={!url.trim()} onPress={scanUrl} icon="search" />
        <Text style={ui.small}>The link is sent to the scanner for analysis. It is not opened on your device.</Text>
        {scanning && <Text accessibilityLiveRegion="polite" style={ui.command}>{'> '}Waiting for the analysis service...</Text>}
      </View>
    </GlassPanel>
    {result === 'safe' && <ResultPanel tone="success" title="No signs of phishing found" description="The model did not flag this link. This is not a guarantee that a site is trustworthy, so stay careful with links you were not expecting." />}
    {result === 'phishing' && <ResultPanel tone="danger" title="Possible phishing" description="This link looks similar to known phishing links. Avoid opening it or entering personal information. The model can be wrong, so check the sender if you can." />}
    {result === 'error' && <ResultPanel tone="warning" title="Could not complete scan" description="The scanner could not return a result. Check your connection and try again." />}
    {result && <Text selectable style={[ui.small, { marginTop: 10 }]}>Analyzed: {scannedUrl}</Text>}

    <SectionHeading title="Recent scans" detail="THIS SESSION" />
    <GlassPanel>
      {recentScans.length === 0 ? <View style={s.empty}><Feather name="clock" size={23} color={T.dim} /><Text style={s.emptyTitle}>A clean slate.</Text><Text style={[ui.text, { textAlign: 'center' }]}>Your results will appear here after your first scan.</Text></View> : recentScans.map((scan, i) => <View key={i} style={[s.scanRow, i > 0 && s.rowBorder]}>
        <Feather name={scan.status === 'safe' ? 'check-circle' : 'alert-triangle'} size={19} color={scan.status === 'safe' ? T.accent : T.danger} />
        <View style={ui.flex}><Text selectable style={s.scanUrl}>{scan.url}</Text><Text style={ui.small}>{scan.time}</Text></View>
        <Badge tone={scan.status === 'safe' ? 'success' : 'danger'}>{scan.status === 'safe' ? 'SAFE' : 'FLAGGED'}</Badge>
      </View>)}
    </GlassPanel>
  </TerminalScreen>;
}
const s = StyleSheet.create({
  label: { fontFamily: T.mono, fontSize: 12, color: T.text },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: T.border, borderRadius: 10, backgroundColor: T.inset, paddingHorizontal: 14 },
  input: { flex: 1, minWidth: 0, fontFamily: T.mono, fontSize: 14, color: T.text, minHeight: 54, paddingVertical: 15 },
  empty: { padding: 30, alignItems: 'center', gap: 12 },
  emptyTitle: { fontFamily: T.mono, fontSize: 16, color: T.text },
  scanRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18 },
  rowBorder: { borderTopWidth: 1, borderTopColor: T.border },
  scanUrl: { fontFamily: T.mono, fontSize: 12, lineHeight: 21, color: T.text },
});
