import psutil

def monitor_network():
    issues = []

    try:
        connections = psutil.net_connections(kind='inet')
    except (psutil.AccessDenied, Exception):
        return issues  # safely skip entire scan if blocked

    for c in connections:
        try:
            if c.status == "ESTABLISHED" and c.raddr:
                if c.raddr.port not in [80, 443]:
                    issues.append(f"Suspicious port: {c.raddr.port}")
        except (psutil.AccessDenied, AttributeError):
            continue

    return issues
