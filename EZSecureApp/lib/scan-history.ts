import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';

export type ScanType = 'phishing' | 'wifi' | 'malware';
export type ScanRecord = { id: string; type: ScanType; verdict: 'safe' | 'flagged'; detail: string; time: number };

const KEY = 'ezsecure.scanHistory.v1';
const MAX = 100;

// Uses AsyncStorage on phones if it is installed; otherwise browser storage on web.
let AsyncStorage: any = null;
try { AsyncStorage = require('@react-native-async-storage/async-storage').default; } catch {}

const hasLocal = () => Platform.OS === 'web' && typeof localStorage !== 'undefined';
const storage = {
  async get(): Promise<string | null> {
    try {
      if (AsyncStorage) return await AsyncStorage.getItem(KEY);
      if (hasLocal()) return localStorage.getItem(KEY);
    } catch {}
    return null;
  },
  async set(value: string) {
    try {
      if (AsyncStorage) await AsyncStorage.setItem(KEY, value);
      else if (hasLocal()) localStorage.setItem(KEY, value);
    } catch {}
  },
};

let history: ScanRecord[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const save = () => storage.set(JSON.stringify(history));

const valid = (r: any): r is ScanRecord =>
  r && typeof r.id === 'string' && ['phishing', 'wifi', 'malware'].includes(r.type) &&
  ['safe', 'flagged'].includes(r.verdict) && typeof r.detail === 'string' && typeof r.time === 'number';

(async () => {
  const raw = await storage.get();
  if (!raw) return;
  try {
    const stored = JSON.parse(raw);
    if (!Array.isArray(stored)) return;
    const seen = new Set(history.map((r) => r.id));
    history = [...history, ...stored.filter(valid).filter((r: ScanRecord) => !seen.has(r.id))]
      .sort((a, b) => b.time - a.time).slice(0, MAX);
    emit();
  } catch {}
})();

export function addScan(scan: { type: ScanType; verdict: 'safe' | 'flagged'; detail: string }) {
  const record: ScanRecord = { ...scan, id: Date.now() + '-' + Math.random().toString(36).slice(2, 7), time: Date.now() };
  history = [record, ...history].slice(0, MAX);
  save();
  emit();
}

export function clearHistory() {
  history = [];
  save();
  emit();
}

export function useScanHistory(): ScanRecord[] {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => { listeners.delete(cb); }; },
    () => history,
    () => history,
  );
}

export function formatTime(ms: number): string {
  const d = new Date(ms);
  const sameDay = d.toDateString() === new Date().toDateString();
  const t = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return sameDay ? t : d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + t;
}
