import pickle
import numpy as np

# Load models + scaler
rf = pickle.load(open("ml/models/rf_model.pkl", "rb"))
ann = pickle.load(open("ml/models/ann_model.pkl", "rb"))
scaler = pickle.load(open("ml/models/scaler.pkl", "rb"))

def predict_threat(cpu, memory, disk, suspicious_files, network_anomalies):
    X = np.array([[cpu, memory, disk, suspicious_files, network_anomalies]])

    # Scale input
    X_scaled = scaler.transform(X)

    # Get probabilities
    rf_prob = rf.predict_proba(X_scaled)[0][1]
    ann_prob = ann.predict_proba(X_scaled)[0][1]

    # Convert to percentages
    rf_percent = round(rf_prob * 100, 2)
    ann_percent = round(ann_prob * 100, 2)

    # Combined score
    combined = round((rf_prob + ann_prob) / 2 * 100, 2)

    return rf_percent, ann_percent, combined
