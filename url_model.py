"""URL-only phishing model used by api.py.

Every feature here is computed from the URL string alone, so what the model saw
in training is exactly what it sees when the app calls /scan. The scheme and a
leading "www." are stripped first so they cannot act as shortcuts.
"""
import math
import os
import re
from collections import Counter

import joblib
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'phishing_url_model.joblib')
_IPRE = re.compile(r'^\d{1,3}(\.\d{1,3}){3}$')
_bundle = None


def _norm(url):
    u = url.strip()
    u = re.sub(r'^[a-zA-Z][a-zA-Z0-9+.-]*://', '', u)
    u = re.sub(r'^www\.', '', u, flags=re.I)
    return re.sub(r'/+$', '', u)  # a trailing slash must not change the verdict


def _split(n):
    m = re.match(r'^([^/?#]*)(.*)$', n)
    hostport, rest = m.group(1), m.group(2)
    host = hostport.split('@')[-1].split(':')[0].lower()
    path = re.split(r'[?#]', rest, maxsplit=1)[0]
    q = rest.split('?', 1)[1].split('#')[0] if '?' in rest else ''
    return host, path, q


def _entropy(s):
    if not s:
        return 0.0
    c = Counter(s)
    n = len(s)
    return -sum(v / n * math.log2(v / n) for v in c.values())


def url_features(url):
    n = _norm(url)
    host, path, q = _split(n)
    labels = host.split('.')
    tld = labels[-1] if labels else ''
    longest_digits = max((len(x) for x in re.findall(r'\d+', n)), default=0)
    return {
        'NumDots': n.count('.'), 'UrlLength': len(n), 'AtSymbol': n.count('@'),
        'NumDash': n.count('-'), 'NumPercent': n.count('%'),
        'NumQueryComponents': len([x for x in q.split('&') if x]),
        'IpAddress': int(bool(_IPRE.match(host))), 'HttpsInHostname': host.count('http'),
        'PathLevel': path.count('/'), 'PathLength': len(path),
        'NumNumericChars': sum(c.isdigit() for c in n),
        'HostLength': len(host), 'SubdomainLevels': max(len(labels) - 2, 0),
        'HostDigits': sum(c.isdigit() for c in host), 'HostDashes': host.count('-'),
        'HostEntropy': _entropy(host), 'LongestDigitRun': longest_digits,
        'PathDigits': sum(c.isdigit() for c in path), 'HasQuery': int(bool(q)),
        'TLD': tld,
    }


def model_available():
    return os.path.exists(MODEL_PATH)


def _load():
    global _bundle
    if _bundle is None:
        _bundle = joblib.load(MODEL_PATH)
    return _bundle


def phishing_probability(url):
    """Return the model's probability (0-1) that the URL is phishing."""
    b = _load()
    f = url_features(url)
    row = {c: 0 for c in b['columns']}
    for k, v in f.items():
        if k != 'TLD' and k in row:
            row[k] = v
    if 'tld_' + f['TLD'] in row:
        row['tld_' + f['TLD']] = 1
    X = np.array([[row[c] for c in b['columns']]], dtype=float)
    return float(b['model'].predict_proba(X)[0][1])
