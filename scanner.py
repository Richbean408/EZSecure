def system_scan(data):
    issues = []

    if data["cpu"] > 85:
        issues.append("High CPU usage")

    if data["memory"] > 90:
        issues.append("Memory nearly full")

    if data["disk"] > 90:
        issues.append("Disk almost full")

    return issues
