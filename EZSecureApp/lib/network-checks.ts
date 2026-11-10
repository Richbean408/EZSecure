import { Platform } from 'react-native';

export type Check = { id: string; label: string; status: 'pass' | 'warn' | 'info'; detail: string };

const TRACE = 'https://www.cloudflare.com/cdn-cgi/trace';
const SITES = ['https://www.google.com', 'https://www.apple.com', 'https://github.com', 'https://www.wikipedia.org'];
const SAMPLES = 5;

async function timedFetch(url: string, init: RequestInit = {}, ms = 6000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try { return await fetch(url, { ...init, signal: controller.signal }); }
  finally { clearTimeout(timer); }
}

function parseTrace(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of text.split('\n')) {
    const i = line.indexOf('=');
    if (i > 0) out[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return out;
}

type Sample = { ok: boolean; ms: number; tls?: string; loc?: string };

async function sampleOnce(n: number): Promise<Sample> {
  const started = Date.now();
  try {
    const res = await timedFetch(TRACE + '?n=' + n + '-' + started);
    const f = parseTrace(await res.text());
    return { ok: res.ok, ms: Date.now() - started, tls: f.tls, loc: f.loc };
  } catch {
    // A browser may block reading the answer even when the network works, so try a plain reachability test.
    try { await timedFetch(TRACE, { mode: 'no-cors' as RequestMode }); return { ok: true, ms: Date.now() - started }; }
    catch { return { ok: false, ms: Date.now() - started }; }
  }
}

async function siteReachable(url: string): Promise<boolean> {
  // no-cors resolves for any successful secure connection and fails on a bad certificate or blocked connection.
  try { await timedFetch(url, { mode: 'no-cors' as RequestMode }); return true; } catch { return false; }
}

const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

/** Checks that run on this device only. They look at this device's own connection. */
export async function runDeviceChecks(): Promise<Check[]> {
  const checks: Check[] = [];

  // Several quick requests: reachability, speed and stability
  const samples: Sample[] = [];
  for (let i = 0; i < SAMPLES; i++) samples.push(await sampleOnce(i));
  const good = samples.filter((s) => s.ok);
  const dropped = samples.length - good.length;

  if (good.length === 0) {
    checks.push({ id: 'internet', label: 'Internet connection', status: 'warn', detail: 'Could not reach the internet. The network may be down, or blocking traffic.' });
    checks.push({ id: 'stability', label: 'Connection stability', status: 'info', detail: 'Not checked because the internet could not be reached.' });
    checks.push({ id: 'https', label: 'Encryption strength', status: 'info', detail: 'Not checked because the internet could not be reached.' });
    checks.push({ id: 'certs', label: 'Secure sites load normally', status: 'info', detail: 'Not checked because the internet could not be reached.' });
  } else {
    const ms = median(good.map((s) => s.ms));
    checks.push({ id: 'internet', label: 'Internet connection', status: ms > 2000 ? 'warn' : 'pass', detail: ms > 2000 ? `Connected, but very slow (about ${ms} ms). Slow networks can be a sign of congestion or interference.` : `Connected (about ${ms} ms response).` });
    checks.push({ id: 'stability', label: 'Connection stability', status: dropped >= 2 ? 'warn' : 'pass', detail: dropped >= 2 ? `${dropped} of ${samples.length} test requests failed. An unstable connection can mean weak signal or interference.` : `${good.length} of ${samples.length} test requests answered.` });

    const tls = good.find((s) => s.tls)?.tls;
    if (!tls) checks.push({ id: 'https', label: 'Encryption strength', status: 'info', detail: 'Connected over HTTPS. The encryption version could not be read here.' });
    else if (/^TLSv1\.[23]$/.test(tls)) checks.push({ id: 'https', label: 'Encryption strength', status: 'pass', detail: `Encrypted connections use a current standard (${tls}).` });
    else checks.push({ id: 'https', label: 'Encryption strength', status: 'warn', detail: `Old encryption was used (${tls}). Avoid sensitive logins on this network.` });

    // Several independent secure sites: a network that blocks or tampers with encrypted traffic often breaks some of them.
    const results = await Promise.all(SITES.map(siteReachable));
    const failed = results.filter((r) => !r).length;
    checks.push(failed === 0
      ? { id: 'certs', label: 'Secure sites load normally', status: 'pass', detail: `${SITES.length} of ${SITES.length} well-known secure sites loaded with valid connections.` }
      : { id: 'certs', label: 'Secure sites load normally', status: 'warn', detail: `${failed} of ${SITES.length} well-known secure sites failed to load. This can mean the network is blocking or interfering with encrypted connections, or has a certificate problem.` });
  }

  // Login page / traffic interception (captive portal). Browsers hide the details, so it needs the phone app.
  if (Platform.OS === 'web') {
    checks.push({ id: 'portal', label: 'Login page or interception', status: 'info', detail: 'Not available in a web browser. Run it in the phone app.' });
  } else {
    try {
      const res = await timedFetch('http://connectivitycheck.gstatic.com/generate_204');
      const body = await res.text();
      if (res.status === 204 && body.length === 0) checks.push({ id: 'portal', label: 'Login page or interception', status: 'pass', detail: 'No login page or traffic redirection detected.' });
      else checks.push({ id: 'portal', label: 'Login page or interception', status: 'warn', detail: 'This network is redirecting traffic, often a Wi-Fi login page. Do not enter passwords until it is a site you recognize.' });
    } catch {
      checks.push({ id: 'portal', label: 'Login page or interception', status: 'info', detail: 'Could not run this check on this network.' });
    }
  }

  const loc = good.find((s) => s.loc)?.loc;
  if (loc) checks.push({ id: 'region', label: 'Where your connection appears from', status: 'info', detail: `Region ${loc}. If this is not where you expect, a VPN or proxy may be in the way.` });

  return checks;
}
