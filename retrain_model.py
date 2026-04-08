import arff
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib

# Load the dataset
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

# Train model
print("Training model...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Check accuracy
predictions = model.predict(X_test)
accuracy = accuracy_score(y_test, predictions)
print(f"Accuracy: {accuracy * 100:.2f}%")

# Print feature names so we know exactly what the model expects
print("\nFeature names:")
for i, col in enumerate(X.columns):
    print(f"{i}: {col}")

# Save model
joblib.dump(model, 'phishing_model.pkl')
print("\nModel saved!")