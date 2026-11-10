import { gcm } from '@noble/ciphers/aes';
import { scryptAsync } from '@noble/hashes/scrypt';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { getItem, removeItem, setItem } from './kv-storage';
import { randomBytes } from './random';
import { utf8Decode, utf8Encode } from './utf8';

/*
 * Vault design
 *  - Your master password never leaves the device and is never stored.
 *  - A 256-bit key is derived from it with scrypt (slow on purpose, to make guessing hard).
 *  - The entries are encrypted with AES-256-GCM, which also detects tampering.
 *  - Only the encrypted blob (plus the salt and parameters) is saved.
 */

const STORAGE_KEY = 'ezsecure.vault.v1';
const AAD = utf8Encode('ezsecure-vault-v1');

export type VaultEntry = { id: string; site: string; username: string; password: string; createdAt: number };
type Kdf = { N: number; r: number; p: number; salt: string };
export type Session = { key: Uint8Array; kdf: Kdf };
type Stored = { v: 1; kdf: Kdf; nonce: string; data: string };

export const DEFAULT_KDF = { N: 2 ** 14, r: 8, p: 1 };
export class WrongPasswordError extends Error { constructor() { super('Wrong master password'); } }

async function deriveKey(master: string, kdf: Kdf): Promise<Uint8Array> {
  return scryptAsync(utf8Encode(master.normalize('NFKC')), hexToBytes(kdf.salt), { N: kdf.N, r: kdf.r, p: kdf.p, dkLen: 32, asyncTick: 20 });
}

function seal(key: Uint8Array, kdf: Kdf, entries: VaultEntry[]): Stored {
  const nonce = randomBytes(12);
  const data = gcm(key, nonce, AAD).encrypt(utf8Encode(JSON.stringify(entries)));
  return { v: 1, kdf, nonce: bytesToHex(nonce), data: bytesToHex(data) };
}

export async function vaultExists(): Promise<boolean> {
  return (await getItem(STORAGE_KEY)) !== null;
}

export async function createVault(master: string): Promise<Session> {
  const kdf: Kdf = { ...DEFAULT_KDF, salt: bytesToHex(randomBytes(16)) };
  const key = await deriveKey(master, kdf);
  await setItem(STORAGE_KEY, JSON.stringify(seal(key, kdf, [])));
  return { key, kdf };
}

export async function unlockVault(master: string): Promise<{ session: Session; entries: VaultEntry[] }> {
  const raw = await getItem(STORAGE_KEY);
  if (!raw) throw new Error('No vault found');
  const stored: Stored = JSON.parse(raw);
  const key = await deriveKey(master, stored.kdf);
  try {
    const plain = gcm(key, hexToBytes(stored.nonce), AAD).decrypt(hexToBytes(stored.data));
    return { session: { key, kdf: stored.kdf }, entries: JSON.parse(utf8Decode(plain)) as VaultEntry[] };
  } catch {
    key.fill(0);
    throw new WrongPasswordError();
  }
}

export async function saveVault(session: Session, entries: VaultEntry[]): Promise<void> {
  await setItem(STORAGE_KEY, JSON.stringify(seal(session.key, session.kdf, entries)));
}

export async function eraseVault(): Promise<void> {
  await removeItem(STORAGE_KEY);
}

export function wipeSession(session: Session | null) {
  if (session) session.key.fill(0);
}
