import os, hashlib
from config import SCAN_DIR, HASH_DB

def load_hashes():
    if not os.path.exists(HASH_DB):
        return set()
    with open(HASH_DB) as f:
        return set(line.strip() for line in f)

def hash_file(path):
    try:
        with open(path, "rb") as f:
            return hashlib.sha256(f.read()).hexdigest()
    except:
        return None

def scan_files():
    threats = []
    known = load_hashes()
    for root, _, files in os.walk(SCAN_DIR):
        for file in files:
            path = os.path.join(root, file)
            h = hash_file(path)
            if h and h in known:
                threats.append(f"Malicious file: {file}")
    return threats
