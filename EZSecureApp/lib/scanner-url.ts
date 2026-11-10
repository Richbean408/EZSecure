import { Platform } from 'react-native';

const KEY = 'ezsecure.scannerUrl';
// Uses AsyncStorage on phones if it is installed; otherwise browser storage on web.
let AsyncStorage: any = null;
try { AsyncStorage = require('@react-native-async-storage/async-storage').default; } catch {}
const hasLocal = () => Platform.OS === 'web' && typeof localStorage !== 'undefined';

/** On the computer's own browser the scanner is on localhost; on a phone you type your computer's address. */
export const DEFAULT_SCANNER_URL = Platform.OS === 'web' ? 'http://localhost:5001' : '';

export async function loadScannerUrl(): Promise<string> {
  try {
    const value = AsyncStorage ? await AsyncStorage.getItem(KEY) : hasLocal() ? localStorage.getItem(KEY) : null;
    if (value) return value;
  } catch {}
  return DEFAULT_SCANNER_URL;
}

export async function saveScannerUrl(value: string) {
  try {
    if (AsyncStorage) await AsyncStorage.setItem(KEY, value);
    else if (hasLocal()) localStorage.setItem(KEY, value);
  } catch {}
}

/** "192.168.1.20:5001/" -> "http://192.168.1.20:5001" */
export function normalizeScannerUrl(raw: string): string {
  let url = raw.trim().replace(/\/+$/, '');
  if (url && !/^https?:\/\//i.test(url)) url = 'http://' + url;
  return url;
}
