/** Cryptographically secure random bytes (browser/Node crypto, or expo-crypto on phones). */
export function randomBytes(n: number): Uint8Array {
  const out = new Uint8Array(n);
  const c: any = (globalThis as any).crypto;
  if (c && typeof c.getRandomValues === 'function') { c.getRandomValues(out); return out; }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ExpoCrypto = require('expo-crypto');
  ExpoCrypto.getRandomValues(out);
  return out;
}

/** Unbiased random integer in [0, max). */
export function randomInt(max: number): number {
  const limit = Math.floor(0x100000000 / max) * max;
  for (;;) {
    const b = randomBytes(4);
    const n = ((b[0] << 24) | (b[1] << 16) | (b[2] << 8) | b[3]) >>> 0;
    if (n < limit) return n % max;
  }
}
