import psutil

def detect_suspicious_processes():
    issues = []
    for p in psutil.process_iter(['pid', 'name', 'cpu_percent']):
        try:
            cpu = p.info.get('cpu_percent', 0)
            name = p.info.get('name', 'unknown')

            if cpu and cpu > 80:
                issues.append(f"High CPU process: {name} (PID {p.pid})")

        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            continue  # skip safely

    return issues
