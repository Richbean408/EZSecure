import Feather from '@expo/vector-icons/Feather';
import * as Clipboard from 'expo-clipboard';
import { useFocusEffect } from 'expo-router';
import { type ComponentProps, useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionButton, Badge, GlassPanel, PageHeading, PanelBar, SectionHeading, TerminalScreen, ui } from '@/components/terminal-ui';
import { Terminal as T } from '@/constants/theme';
import { breachCount, findReuse, generatePassword, passwordStrength } from '@/lib/password-tools';
import { type Session, type VaultEntry, WrongPasswordError, createVault, eraseVault, saveVault, unlockVault, vaultExists, wipeSession } from '@/lib/vault-crypto';

type Phase = 'loading' | 'setup' | 'locked' | 'open';
type IconName = ComponentProps<typeof Feather>['name'];
const IDLE_LOCK_MS = 3 * 60 * 1000;
const CLIPBOARD_CLEAR_MS = 30 * 1000;
const strengthColor = (score: number) => (score <= 1 ? T.danger : score === 2 ? T.warning : T.accent);

function Field({ label, value, onChangeText, secure, placeholder, onSubmit, autoFocus }: {
  label: string; value: string; onChangeText: (v: string) => void; secure?: boolean; placeholder?: string; onSubmit?: () => void; autoFocus?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return <View style={{ gap: 8 }}>
    <Text style={s.label}>{label}</Text>
    <View style={[s.inputWrap, focused && { borderColor: T.accent }]}>
      <TextInput accessibilityLabel={label} style={s.input} value={value} onChangeText={onChangeText}
        secureTextEntry={secure} placeholder={placeholder} placeholderTextColor={T.dim}
        autoCapitalize="none" autoCorrect={false} autoComplete="off" spellCheck={false} selectionColor={T.accent}
        autoFocus={autoFocus} onSubmitEditing={onSubmit} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
    </View>
  </View>;
}

function MiniButton({ icon, label, onPress, tone }: { icon: IconName; label: string; onPress: () => void; tone?: 'danger' }) {
  const color = tone === 'danger' ? T.danger : T.accent;
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
    style={({ pressed }) => [s.mini, { borderColor: color + '55' }, pressed && { opacity: 0.7 }]}>
    <Feather name={icon} size={14} color={color} /><Text style={[s.miniText, { color }]}>{label}</Text>
  </Pressable>;
}

function StrengthBar({ password }: { password: string }) {
  if (!password) return null;
  const st = passwordStrength(password);
  return <View style={{ gap: 6 }}>
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {[0, 1, 2, 3].map((i) => <View key={i} style={[s.segment, { backgroundColor: i < Math.max(st.score, 1) ? strengthColor(st.score) : 'rgba(119,245,164,.1)' }]} />)}
    </View>
    <Text style={[ui.small, { color: strengthColor(st.score) }]}>{st.label} (rough estimate)</Text>
  </View>;
}

export default function VaultScreen() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [master, setMaster] = useState('');
  const [confirm, setConfirm] = useState('');
  const [understood, setUnderstood] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmErase, setConfirmErase] = useState(false);
  const [site, setSite] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [breach, setBreach] = useState<{ tone: 'ok' | 'bad' | 'warn'; text: string } | null>(null);
  const [checking, setChecking] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const session = useRef<Session | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lockRef = useRef<() => void>(() => {});

  useEffect(() => { vaultExists().then((exists) => setPhase(exists ? 'locked' : 'setup')).catch(() => setPhase('setup')); }, []);

  const lock = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    wipeSession(session.current); session.current = null;
    setEntries([]); setRevealed({}); setConfirmDelete(null); setSite(''); setUsername(''); setPassword(''); setBreach(null);
    setMaster(''); setConfirm(''); setError('');
    setPhase((p) => (p === 'open' ? 'locked' : p));
  }, []);
  lockRef.current = lock;

  const touch = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => lockRef.current(), IDLE_LOCK_MS);
  }, []);

  // Lock when the app goes to the background or the person leaves this tab.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => { if (state !== 'active') lockRef.current(); });
    return () => sub.remove();
  }, []);
  useFocusEffect(useCallback(() => () => lockRef.current(), []));
  useEffect(() => () => { if (idleTimer.current) clearTimeout(idleTimer.current); if (clipTimer.current) clearTimeout(clipTimer.current); }, []);

  const setup = async () => {
    setError('');
    if (master.length < 10) return setError('Use at least 10 characters. A long phrase of several words works well.');
    if (master !== confirm) return setError('The two passwords do not match.');
    if (!understood) return setError('Please confirm you understand there is no way to recover a forgotten master password.');
    setBusy(true);
    try {
      session.current = await createVault(master);
      setEntries([]); setMaster(''); setConfirm(''); setUnderstood(false); setPhase('open'); touch();
    } catch { setError('Could not create the vault on this device.'); }
    finally { setBusy(false); }
  };

  const unlock = async () => {
    setError('');
    if (!master) return;
    setBusy(true);
    try {
      const res = await unlockVault(master);
      session.current = res.session; setEntries(res.entries); setMaster(''); setConfirmErase(false); setPhase('open'); touch();
    } catch (e) {
      setError(e instanceof WrongPasswordError ? 'Wrong master password.' : 'Could not open the vault.');
    } finally { setBusy(false); }
  };

  const erase = async () => {
    await eraseVault(); wipeSession(session.current); session.current = null;
    setEntries([]); setMaster(''); setConfirm(''); setConfirmErase(false); setError(''); setPhase('setup');
  };

  const persist = async (next: VaultEntry[]) => {
    if (!session.current) return;
    await saveVault(session.current, next);
    setEntries(next);
  };

  const addEntry = async () => {
    touch();
    if (!site.trim() || !password) return setError('Enter a site and a password.');
    setError('');
    try {
      await persist([{ id: Date.now() + '-' + Math.random().toString(36).slice(2, 7), site: site.trim(), username: username.trim(), password, createdAt: Date.now() }, ...entries]);
      setSite(''); setUsername(''); setPassword(''); setShowNew(false); setBreach(null);
    } catch { setError('Could not save to this device.'); }
  };

  const removeEntry = async (id: string) => {
    touch();
    if (confirmDelete !== id) return setConfirmDelete(id);
    setConfirmDelete(null);
    try { await persist(entries.filter((e) => e.id !== id)); } catch { setError('Could not save to this device.'); }
  };

  const copy = async (e: VaultEntry) => {
    touch();
    await Clipboard.setStringAsync(e.password);
    setCopiedId(e.id); setTimeout(() => setCopiedId((c) => (c === e.id ? null : c)), 2000);
    if (clipTimer.current) clearTimeout(clipTimer.current);
    clipTimer.current = setTimeout(() => { Clipboard.setStringAsync('').catch(() => {}); }, CLIPBOARD_CLEAR_MS);
  };

  const generate = () => { touch(); setPassword(generatePassword(18)); setShowNew(true); setBreach(null); };

  const checkLeak = async () => {
    touch();
    if (!password) return;
    setChecking(true); setBreach(null);
    const count = await breachCount(password);
    setChecking(false);
    setBreach(count === null ? { tone: 'warn', text: 'Could not run the check. Check your connection and try again.' }
      : count > 0 ? { tone: 'bad', text: `This password appeared in ${count.toLocaleString()} known data breaches. Choose a different one.` }
      : { tone: 'ok', text: 'Not found in known data breaches. Only the first 5 characters of its hash were sent, never the password.' });
  };

  const reuse = findReuse(entries, password);

  return <TerminalScreen path="vault">
    <PageHeading eyebrow="04 / PASSWORD VAULT" title="Password vault" description="Keep passwords in one encrypted place. Your master password unlocks it and never leaves this device." />

    {phase === 'loading' && <GlassPanel><View style={ui.body}><Text style={ui.text}>Opening...</Text></View></GlassPanel>}

    {phase === 'setup' && <GlassPanel>
      <PanelBar title="create_vault" label="AES-256" />
      <View style={ui.body}>
        <Badge tone="warning">NEW VAULT</Badge>
        <Text style={ui.text}>Choose a master password. It encrypts everything in the vault.</Text>
        <Field label="Master password" value={master} onChangeText={setMaster} secure placeholder="At least 10 characters" />
        <StrengthBar password={master} />
        <Field label="Confirm master password" value={confirm} onChangeText={setConfirm} secure onSubmit={setup} />
        <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: understood }} onPress={() => setUnderstood(!understood)} style={s.check}>
          <Feather name={understood ? 'check-square' : 'square'} size={20} color={T.accent} />
          <Text style={[ui.small, ui.flex]}>I understand that if I forget this password, my saved passwords cannot be recovered.</Text>
        </Pressable>
        {error ? <Text accessibilityLiveRegion="polite" style={s.error}>{error}</Text> : null}
        <ActionButton label={busy ? 'Creating vault...' : 'Create vault'} loading={busy} onPress={setup} icon="lock" />
      </View>
    </GlassPanel>}

    {phase === 'locked' && <GlassPanel>
      <PanelBar title="vault_locked" label="AES-256" />
      <View style={ui.body}>
        <Badge tone="neutral">LOCKED</Badge>
        <Field label="Master password" value={master} onChangeText={setMaster} secure onSubmit={unlock} autoFocus />
        {error ? <Text accessibilityLiveRegion="polite" style={s.error}>{error}</Text> : null}
        <ActionButton label={busy ? 'Unlocking...' : 'Unlock'} loading={busy} disabled={!master} onPress={unlock} icon="unlock" />
        <View style={ui.divider} />
        {!confirmErase
          ? <MiniButton icon="trash-2" label="Forgot it? Erase vault" tone="danger" onPress={() => setConfirmErase(true)} />
          : <View style={{ gap: 10 }}>
              <Text style={[ui.small, { color: T.danger }]}>This permanently deletes every saved password. It cannot be undone.</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <MiniButton icon="trash-2" label="Erase everything" tone="danger" onPress={erase} />
                <MiniButton icon="x" label="Cancel" onPress={() => setConfirmErase(false)} />
              </View>
            </View>}
      </View>
    </GlassPanel>}

    {phase === 'open' && <>
      <GlassPanel>
        <PanelBar title="add_password" label="ENCRYPTED" />
        <View style={ui.body}>
          <View style={s.rowBetween}>
            <Badge tone="success">UNLOCKED</Badge>
            <MiniButton icon="lock" label="Lock now" onPress={lock} />
          </View>
          <Field label="Site or app" value={site} onChangeText={(v) => { touch(); setSite(v); }} placeholder="example.com" />
          <Field label="Username or email" value={username} onChangeText={(v) => { touch(); setUsername(v); }} />
          <Field label="Password" value={password} onChangeText={(v) => { touch(); setPassword(v); setBreach(null); }} secure={!showNew} />
          <View style={s.actions}>
            <MiniButton icon="refresh-cw" label="Generate" onPress={generate} />
            <MiniButton icon={showNew ? 'eye-off' : 'eye'} label={showNew ? 'Hide' : 'Show'} onPress={() => setShowNew(!showNew)} />
            <MiniButton icon="shield" label={checking ? 'Checking...' : 'Check for leaks'} onPress={checkLeak} />
          </View>
          <StrengthBar password={password} />
          {reuse.length > 0 && <Text style={[ui.small, { color: T.warning }]}>You already use this password for {reuse.map((r) => r.site).join(', ')}. Reusing passwords is risky.</Text>}
          {breach && <Text accessibilityLiveRegion="polite" style={[ui.small, { color: breach.tone === 'ok' ? T.accent : breach.tone === 'bad' ? T.danger : T.warning }]}>{breach.text}</Text>}
          {error ? <Text accessibilityLiveRegion="polite" style={s.error}>{error}</Text> : null}
          <ActionButton label="Save password" onPress={addEntry} disabled={!site.trim() || !password} icon="save" />
        </View>
      </GlassPanel>

      <SectionHeading title="Saved passwords" detail={String(entries.length).padStart(2, '0') + ' STORED'} />
      <GlassPanel>
        {entries.length === 0
          ? <View style={s.empty}><Feather name="key" size={23} color={T.dim} /><Text style={[ui.text, { textAlign: 'center' }]}>Nothing saved yet. Add your first password above.</Text></View>
          : entries.map((e, i) => {
              const weak = passwordStrength(e.password).score <= 1;
              const reused = findReuse(entries, e.password, e.id).length > 0;
              return <View key={e.id} style={[s.entry, i > 0 && s.border]}>
                <View style={s.rowBetween}>
                  <View style={ui.flex}><Text selectable style={s.site}>{e.site}</Text>{e.username ? <Text selectable style={ui.small}>{e.username}</Text> : null}</View>
                  <View style={{ gap: 6, alignItems: 'flex-end' }}>
                    {weak && <Badge tone="danger">WEAK</Badge>}
                    {reused && <Badge tone="warning">REUSED</Badge>}
                  </View>
                </View>
                <Text selectable={!!revealed[e.id]} style={s.secret}>{revealed[e.id] ? e.password : '••••••••••••'}</Text>
                <View style={s.actions}>
                  <MiniButton icon={revealed[e.id] ? 'eye-off' : 'eye'} label={revealed[e.id] ? 'Hide' : 'Show'} onPress={() => { touch(); setRevealed((r) => ({ ...r, [e.id]: !r[e.id] })); }} />
                  <MiniButton icon="copy" label={copiedId === e.id ? 'Copied' : 'Copy'} onPress={() => copy(e)} />
                  <MiniButton icon="trash-2" label={confirmDelete === e.id ? 'Confirm delete' : 'Delete'} tone="danger" onPress={() => removeEntry(e.id)} />
                </View>
              </View>;
            })}
      </GlassPanel>
      <Text style={[ui.small, { marginTop: 4 }]}>The vault locks itself after 3 minutes of inactivity, when you leave this tab, or when the app goes to the background. Copied passwords are cleared from the clipboard after 30 seconds.</Text>
    </>}

    <Text style={[ui.small, { marginTop: 8 }]}>Prototype notice: this vault is encrypted on your device, but it has not had a professional security review. Do not store passwords you cannot afford to lose.</Text>
  </TerminalScreen>;
}

const s = StyleSheet.create({
  label: { fontFamily: T.mono, fontSize: 12, color: T.text },
  inputWrap: { borderWidth: 1, borderColor: T.border, borderRadius: 10, backgroundColor: T.inset, paddingHorizontal: 14 },
  input: { fontFamily: T.mono, fontSize: 14, color: T.text, minHeight: 50, paddingVertical: 12 },
  error: { fontFamily: T.mono, fontSize: 12, lineHeight: 19, color: T.danger },
  check: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  rowBetween: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  mini: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, minHeight: 36 },
  miniText: { fontFamily: T.mono, fontSize: 11 },
  segment: { flex: 1, height: 4, borderRadius: 2 },
  empty: { padding: 30, alignItems: 'center', gap: 12 },
  entry: { padding: 18, gap: 12 },
  border: { borderTopWidth: 1, borderTopColor: T.border },
  site: { fontFamily: T.mono, fontSize: 14, color: T.text },
  secret: { fontFamily: T.mono, fontSize: 14, color: T.accent },
});
