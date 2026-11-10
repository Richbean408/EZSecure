import { Platform } from 'react-native';

// AsyncStorage on phones, browser storage on web. Callers only ever store already-encrypted data here.
let AsyncStorage: any = null;
try { AsyncStorage = require('@react-native-async-storage/async-storage').default; } catch {}
const hasLocal = () => Platform.OS === 'web' && typeof localStorage !== 'undefined';

export async function getItem(key: string): Promise<string | null> {
  try {
    if (AsyncStorage) return await AsyncStorage.getItem(key);
    if (hasLocal()) return localStorage.getItem(key);
  } catch {}
  return null;
}
export async function setItem(key: string, value: string): Promise<void> {
  if (AsyncStorage) { await AsyncStorage.setItem(key, value); return; }
  if (hasLocal()) { localStorage.setItem(key, value); return; }
  throw new Error('No storage available on this device');
}
export async function removeItem(key: string): Promise<void> {
  try {
    if (AsyncStorage) await AsyncStorage.removeItem(key);
    else if (hasLocal()) localStorage.removeItem(key);
  } catch {}
}
