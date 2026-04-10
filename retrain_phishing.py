import arff
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report
import joblib
import pickle

# Load dataset
print("Loading dataset...")
with open('Training Dataset.arff', 'r') as f:
    dataset = arff.load(f)

df = pd.DataFrame(dataset['data'], columns=[attr[0] for attr in dataset['attributes']])

X = df.iloc[:, :-1]
y = df.iloc[:, -1]

X = X.apply(pd.to_numeric)
y = pd.to_numeric(y)

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Scale data
print("Scaling data...")
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train Random Forest
print("Training Random Forest...")
rf = RandomForestClassifier(n_estimators=200, max_depth=20, random_state=42)
rf.fit(X_train_scaled, y_train)
rf_acc = accuracy_score(y_test, rf.predict(X_test_scaled))
print(f"Random Forest Accuracy: {rf_acc * 100:.2f}%")

# Train ANN
print("Training ANN...")
ann = MLPClassifier(
    hidden_layer_sizes=(128, 64, 32),
    max_iter=1000,
    random_state=42,
    learning_rate_init=0.001,
    early_stopping=True
)
ann.fit(X_train_scaled, y_train)
ann_acc = accuracy_score(y_test, ann.predict(X_test_scaled))
print(f"ANN Accuracy: {ann_acc * 100:.2f}%")

# Combined prediction
print("\nTesting combined model...")
rf_probs = rf.predict_proba(X_test_scaled)
ann_probs = ann.predict_proba(X_test_scaled)
combined_probs = (rf_probs + ann_probs) / 2
combined_preds = np.argmax(combined_probs, axis=1)
classes = rf.classes_
combined_preds_labels = classes[combined_preds]
combined_acc = accuracy_score(y_test, combined_preds_labels)
print(f"Combined Accuracy: {combined_acc * 100:.2f}%")

print("\nDetailed Report:")
print(classification_report(y_test, combined_preds_labels, target_names=["Legitimate", "Phishing"]))

# Save models
print("Saving models...")
joblib.dump(rf, 'phishing_rf_model.pkl')
joblib.dump(ann, 'phishing_ann_model.pkl')
joblib.dump(scaler, 'phishing_scaler.pkl')
print("All models saved!")
