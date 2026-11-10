import { sha1 } from '@noble/hashes/sha1';
import { bytesToHex } from '@noble/hashes/utils';
import { randomInt } from './random';
import { utf8Encode } from './utf8';
import type { VaultEntry } from './vault-crypto';

const LOWER = 'abcdefghijkmnopqrstuvwxyz'; // no easily-confused l
const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';  // no I or O
const DIGITS = '23456789';                 // no 0 or 1
const SYMBOLS = '!@#$%^&*-_=+?';

/** Random password with at least one character from each group. */
export function generatePassword(length = 18): string {
  const groups = [LOWER, UPPER, DIGITS, SYMBOLS];
  const all = groups.join('');
  const chars: string[] = groups.map((g) => g[randomInt(g.length)]);
  while (chars.length < length) chars.push(all[randomInt(all.length)]);
  for (let i = chars.length - 1; i > 0; i--) { const j = randomInt(i + 1); [chars[i], chars[j]] = [chars[j], chars[i]]; }
  return chars.join('');
}

const COMMON = ['password', 'passw0rd', '123456', '12345678', '123456789', 'qwerty', 'abc123', 'letmein', 'welcome', 'admin', 'iloveyou', 'monkey', 'dragon', 'football', 'baseball', 'login', 'princess', 'sunshine', 'master', 'trustno1'];

export type Strength = { score: 0 | 1 | 2 | 3 | 4; label: string; bits: number };

/** A rough estimate (not a guarantee): length and variety, with penalties for common patterns. */
export function passwordStrength(pw: string): Strength {
  if (!pw) return { score: 0, label: 'Empty', bits: 0 };
  const lower = pw.toLowerCase();
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^A-Za-z0-9]/.test(pw)) pool += 33;
  let bits = pw.length * Math.log2(Math.max(pool, 2));
  if (COMMON.some((c) => lower.includes(c))) bits = Math.min(bits, 20);
  if (/(.)\1{2,}/.test(pw)) bits *= 0.7;
  if (/(0123|1234|2345|3456|4567|5678|6789|abcd|bcde|cdef|qwer|asdf|zxcv)/.test(lower)) bits *= 0.7;
  if (new Set(pw).size <= 3) bits = Math.min(bits, 15);
  const score = bits < 28 ? 0 : bits < 40 ? 1 : bits < 60 ? 2 : bits < 80 ? 3 : 4;
  return { score: score as Strength['score'], label: ['Very weak', 'Weak', 'Okay', 'Strong', 'Very strong'][score], bits: Math.round(bits) };
}

/** Entries (other than `ignoreId`) that already use this exact password. */
export function findReuse(entries: VaultEntry[], password: string, ignoreId?: string): VaultEntry[] {
  return password ? entries.filter((e) => e.id !== ignoreId && e.password === password) : [];
}

/**
 * Has this password appeared in a known data breach? Uses the Have I Been Pwned range API:
 * only the first 5 characters of the password's SHA-1 hash are sent, never the password.
 * Returns the number of times it was seen, or null if the check could not run.
 */
export async function breachCount(password: string): Promise<number | null> {
  try {
    const hash = bytesToHex(sha1(utf8Encode(password))).toUpperCase();
    const res = await fetch('https://api.pwnedpasswords.com/range/' + hash.slice(0, 5), { headers: { 'Add-Padding': 'true' } });
    if (!res.ok) return null;
    const suffix = hash.slice(5);
    for (const line of (await res.text()).split('\n')) {
      const [s, count] = line.trim().split(':');
      if (s === suffix) return Number(count) || 0;
    }
    return 0;
  } catch { return null; }
}
