import Feather from '@expo/vector-icons/Feather';
import { type ComponentProps, type PropsWithChildren } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView,
  StyleSheet, Text, View, type StyleProp, type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Terminal as T } from '@/constants/theme';

type IconName = ComponentProps<typeof Feather>['name'];
type Tone = 'neutral' | 'success' | 'warning' | 'danger';
const toneColor = { neutral: T.muted, success: T.accent, warning: T.warning, danger: T.danger };

// Native surfaces use layered translucent fills; browsers also blur the backdrop.
const webGlass = Platform.OS === 'web'
  ? ({ backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)',
      backgroundImage: 'linear-gradient(125deg, rgba(205,255,219,.055), transparent 55%)' } as ViewStyle)
  : {};

export function GlassPanel({ children, style, tone = 'neutral' }: PropsWithChildren<{
  style?: StyleProp<ViewStyle>; tone?: Tone;
}>) {
  return (
    <View style={[s.glass, webGlass, tone !== 'neutral' && { borderColor: toneColor[tone] + '55' }, style]}>
      <View pointerEvents="none" style={s.sheen} />
      {children}
    </View>
  );
}

export function TerminalScreen({ children, path }: PropsWithChildren<{ path: string }>) {
  const insets = useSafeAreaInsets();
  return (
    <View style={s.screen}>
      <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}>
        <View style={s.glowOuter} /><View style={s.glowInner} />
        {Array.from({ length: 24 }, (_, i) => <View key={'v' + i} style={[s.gridVertical, { left: i * 80 }]} />)}
        {Array.from({ length: 30 }, (_, i) => <View key={'h' + i} style={[s.gridHorizontal, { top: i * 80 }]} />)}
      </View>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}
          contentContainerStyle={[s.scroll, { paddingTop: Math.max(insets.top, 20) + 8 }]}>
          <View style={s.brandRow}>
            <View style={s.brandLockup}>
              <View style={s.brandIcon}><Feather name="shield" size={21} color={T.accent} /></View>
              <View><Text style={s.brand}>EZSECURE<Text style={s.brandDot}>.</Text></Text><Text style={s.brandCaption}>PERSONAL SECURITY CONSOLE</Text></View>
            </View>
            <View style={s.version}><View style={s.dot} /><Text style={s.versionText}>v1.0</Text></View>
          </View>
          <View style={s.breadcrumb}>
            <Feather name="terminal" size={14} color={T.accent} />
            <Text style={s.path}>ezsecure <Text style={s.slash}>/</Text> {path}</Text>
          </View>
          {children}
          <View style={s.footer}><View style={s.dot} /><Text style={s.footerText}>EZSECURE  /  SECURITY MADE SIMPLE</Text></View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

export function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <View style={s.heading}><Text style={s.eyebrow}>{eyebrow}</Text><Text accessibilityRole="header" style={s.pageTitle}>{title}<Text style={s.cursor}>_</Text></Text><Text style={s.description}>{description}</Text></View>;
}

export function PanelBar({ title, label }: { title: string; label?: string }) {
  return <View style={s.panelBar}><View style={s.windowDots}><View style={s.windowDot} /><View style={[s.windowDot, { opacity: 0.5 }]} /><View style={[s.windowDot, { opacity: 0.25 }]} /></View><Text style={s.panelTitle}>{title}</Text>{label ? <Text style={s.panelLabel}>{label}</Text> : null}</View>;
}

export function Badge({ children, tone = 'success' }: PropsWithChildren<{ tone?: Tone }>) {
  const color = toneColor[tone];
  return <View style={[s.badge, { borderColor: color + '40', backgroundColor: color + '0C' }]}><View style={[s.dot, { backgroundColor: color }]} /><Text style={[s.badgeText, { color }]}>{children}</Text></View>;
}

export function ActionButton({ label, onPress, loading = false, disabled = false, icon = 'arrow-up-right', secondary = false }: {
  label: string; onPress: () => void; loading?: boolean; disabled?: boolean; icon?: IconName; secondary?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: disabled || loading, busy: loading }}
    disabled={disabled || loading} onPress={onPress}
    style={({ pressed }) => [s.button, secondary && s.secondaryButton, (disabled || loading) && s.disabled, pressed && s.pressed]}>
    <Text style={[s.buttonText, secondary && { color: T.accent }]}>{label}</Text>
    {loading ? <ActivityIndicator size="small" color={secondary ? T.accent : T.background} /> : <Feather name={icon} size={18} color={secondary ? T.accent : T.background} />}
  </Pressable>;
}

export function SectionHeading({ title, detail }: { title: string; detail?: string }) {
  return <View style={s.sectionHeading}><Text accessibilityRole="header" style={s.sectionTitle}>{title}</Text>{detail ? <Text style={s.sectionDetail}>{detail}</Text> : null}</View>;
}

export function ResultPanel({ tone, title, description }: { tone: Tone; title: string; description: string }) {
  const icon: IconName = tone === 'success' ? 'check-circle' : tone === 'danger' ? 'shield-off' : 'alert-triangle';
  return <GlassPanel tone={tone} style={s.result}><View accessibilityLiveRegion="polite" style={s.resultRow}><Feather name={icon} size={26} color={toneColor[tone]} /><View style={s.flex}><Text style={[s.resultTitle, { color: toneColor[tone] }]}>{title}</Text><Text style={s.description}>{description}</Text></View></View></GlassPanel>;
}

export function TipList({ items }: { items: string[] }) {
  return <GlassPanel style={s.tips}>{items.map((tip, i) => <View key={tip} style={[s.tip, i > 0 && s.tipBorder]}><Text style={s.tipNumber}>{String(i + 1).padStart(2, '0')}</Text><Text style={s.tipText}>{tip}</Text></View>)}</GlassPanel>;
}

export function ScannerGlyph({ icon, tone = 'success' }: { icon: IconName; tone?: Tone }) {
  return <View style={[s.glyphOuter, { borderColor: toneColor[tone] + '20' }]}><View style={[s.glyphInner, { borderColor: toneColor[tone] + '55' }]}><Feather name={icon} size={36} color={toneColor[tone]} /></View></View>;
}

export const ui = StyleSheet.create({
  body: { padding: 24, gap: 20 },
  centered: { alignItems: 'center', gap: 16, paddingVertical: 30, paddingHorizontal: 20 },
  title: { fontFamily: T.mono, fontSize: 21, lineHeight: 30, fontWeight: '600', color: T.text, textAlign: 'center' },
  text: { fontFamily: T.mono, fontSize: 13, lineHeight: 22, color: T.muted },
  small: { fontFamily: T.mono, fontSize: 11, lineHeight: 18, color: T.muted },
  command: { fontFamily: T.mono, color: T.accent, fontSize: 12, lineHeight: 20 },
  divider: { height: 1, backgroundColor: T.border },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1, minWidth: 0 },
  inset: { backgroundColor: T.inset, borderWidth: 1, borderColor: T.border, borderRadius: 12, padding: 16 },
});

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  screen: { flex: 1, backgroundColor: T.background, overflow: 'hidden' },
  scroll: { width: '100%', maxWidth: 1088, alignSelf: 'center', paddingHorizontal: 22, paddingBottom: 26 },
  glowOuter: { position: 'absolute', width: 620, height: 620, borderRadius: 310, right: -260, top: 20, backgroundColor: 'rgba(41,150,76,.035)' },
  glowInner: { position: 'absolute', width: 400, height: 400, borderRadius: 200, right: -130, top: 110, backgroundColor: 'rgba(54,170,95,.035)' },
  gridVertical: { position: 'absolute', width: 1, height: '100%', backgroundColor: 'rgba(119,245,164,.025)' },
  gridHorizontal: { position: 'absolute', height: 1, width: '100%', backgroundColor: 'rgba(119,245,164,.025)' },
  brandRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 25 },
  brandLockup: { flexDirection: 'row', alignItems: 'center', gap: 11, flexShrink: 1 },
  brandIcon: { width: 42, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1, borderColor: T.border, backgroundColor: 'rgba(119,245,164,.06)' },
  brand: { color: T.text, fontFamily: T.mono, fontSize: 20, fontWeight: '700', letterSpacing: 2 },
  brandDot: { color: T.accent },
  brandCaption: { fontFamily: T.mono, fontSize: 8, lineHeight: 16, letterSpacing: 1.2, color: T.muted },
  version: { flexDirection: 'row', gap: 7, alignItems: 'center' },
  versionText: { fontFamily: T.mono, fontSize: 11, color: T.muted },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: T.accent },
  breadcrumb: { flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, borderColor: T.border, paddingTop: 17, marginBottom: 30 },
  path: { fontFamily: T.mono, fontSize: 11, color: T.muted },
  slash: { color: T.dim },
  heading: { gap: 10, marginBottom: 26 },
  eyebrow: { fontFamily: T.mono, fontSize: 10, letterSpacing: 2, color: T.accent },
  pageTitle: { fontFamily: T.mono, fontSize: 30, lineHeight: 39, fontWeight: '700', letterSpacing: -1.2, color: T.text },
  cursor: { color: T.accent },
  description: { fontFamily: T.mono, fontSize: 13, lineHeight: 22, color: T.muted },
  glass: { backgroundColor: T.panel, borderWidth: 1, borderColor: T.border, borderTopColor: 'rgba(170,242,190,.3)', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 24 },
  sheen: { position: 'absolute', top: 0, left: '8%', right: '8%', height: 1, backgroundColor: 'rgba(217,255,229,.16)' },
  panelBar: { flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderColor: T.border, paddingHorizontal: 18, paddingVertical: 14, backgroundColor: 'rgba(185,255,207,.018)' },
  windowDots: { flexDirection: 'row', gap: 5 },
  windowDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: T.accent },
  panelTitle: { fontFamily: T.mono, fontSize: 10, color: T.muted, flex: 1 },
  panelLabel: { fontFamily: T.mono, fontSize: 9, color: T.dim },
  badge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 7, borderWidth: 1, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6 },
  badgeText: { fontFamily: T.mono, fontSize: 10, lineHeight: 14, fontWeight: '600', letterSpacing: 0.5 },
  button: { minHeight: 50, backgroundColor: T.accent, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  secondaryButton: { backgroundColor: 'rgba(119,245,164,.06)', borderWidth: 1, borderColor: T.border },
  buttonText: { fontFamily: T.mono, color: T.background, fontWeight: '700', fontSize: 13, flexShrink: 1 },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.78 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, marginTop: 28, marginBottom: 14 },
  sectionTitle: { fontFamily: T.mono, fontSize: 15, fontWeight: '600', color: T.text },
  sectionDetail: { fontFamily: T.mono, fontSize: 10, color: T.dim },
  result: { marginTop: 16, padding: 20 },
  resultRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  resultTitle: { fontFamily: T.mono, fontSize: 16, lineHeight: 24, fontWeight: '600', marginBottom: 6 },
  tips: { paddingHorizontal: 18 },
  tip: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, paddingVertical: 16 },
  tipBorder: { borderTopWidth: 1, borderTopColor: T.border },
  tipNumber: { fontFamily: T.mono, fontSize: 11, lineHeight: 22, color: T.accent },
  tipText: { flex: 1, fontFamily: T.mono, fontSize: 12, lineHeight: 22, color: T.muted },
  glyphOuter: { width: 122, height: 122, borderRadius: 61, borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(119,245,164,.025)' },
  glyphInner: { width: 88, height: 88, borderRadius: 44, borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(119,245,164,.045)' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 32, paddingTop: 20 },
  footerText: { fontFamily: T.mono, fontSize: 9, letterSpacing: 1, color: T.dim },
});
