import ipaddress
import psutil

# Ports that normal apps and services use all the time. Never flagged.
SAFE_PORTS = {
    22,    # SSH
    53,    # DNS
    80,    # HTTP
    123,   # time sync (NTP)
    143,   # email (IMAP)
    443,   # HTTPS
    465,   # email (SMTP over TLS)
    587,   # email (SMTP)
    853,   # DNS over TLS
    993,   # email (IMAPS)
    995,   # email (POP3S)
    5223,  # Apple push notifications
    5228,  # Google push notifications
    8080,  # alternate web
    8443,  # alternate secure web
}

# Ports often used by remote-access tools, botnets, or insecure services.
# A connection to one of these is a POSSIBLE risk, not a confirmed threat.
RISKY_PORTS = {
    23:    "Telnet (unencrypted remote login)",
    445:   "Windows file sharing (SMB)",
    1080:  "SOCKS proxy",
    1337:  "port often used by hacking tools",
    3389:  "Remote Desktop (RDP)",
    4444:  "default Metasploit listener port",
    5555:  "Android debug bridge / remote access tools",
    6667:  "IRC (used by some botnets)",
    31337: "classic backdoor port",
}


def _is_local(ip):
    """True for this machine and private home/office networks."""
    try:
        addr = ipaddress.ip_address(ip)
        return addr.is_loopback or addr.is_private or addr.is_link_local
    except ValueError:
        return False


def analyze_connections(connections):
    """Return (possible_risks, checked_count) from a list of connections."""
    issues = []
    seen = set()
    checked = 0

    for c in connections:
        try:
            if c.status != "ESTABLISHED" or not c.raddr:
                continue
            ip, port = c.raddr.ip, c.raddr.port
            if _is_local(ip):
                continue
            checked += 1
            if port in SAFE_PORTS or port not in RISKY_PORTS:
                continue
            if (ip, port) in seen:
                continue
            seen.add((ip, port))
            issues.append(f"Possible risk: connection to {ip}:{port} ({RISKY_PORTS[port]})")
        except (psutil.AccessDenied, AttributeError):
            continue

    return issues, checked


def monitor_network():
    """Return a list of possible-risk messages (empty list means none found)."""
    try:
        connections = psutil.net_connections(kind='inet')
    except (psutil.AccessDenied, Exception):
        return []  # safely skip the scan if the OS blocks it

    issues, _ = analyze_connections(connections)
    return issues
