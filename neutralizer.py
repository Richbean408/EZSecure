import os

QUARANTINE_DIR = "data/quarantine"
os.makedirs(QUARANTINE_DIR, exist_ok=True)

def quarantine(path):
    try:
        if os.path.exists(path):
            filename = os.path.basename(path)
            new_path = os.path.join(QUARANTINE_DIR, filename)
            os.rename(path, new_path)
            return new_path
    except:
        pass
    return None
