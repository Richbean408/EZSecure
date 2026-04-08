import arff
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib

# Step 1 - Load the dataset
print("Loading phishing dataset...")
with open('Training Dataset.arff', 'r') as f:
    dataset = arff.load(f)

# Step 2 - Convert to Pandas DataFrame
df = pd.DataFrame(dataset['data'], columns=[attr[0] for attr in dataset['attributes']])
print(f"Dataset loaded! Shape: {df.shape}")
print(df.head())

# Step 3 - Prepare features and target
X = df.iloc[:, :-1]
y = df.iloc[:, -1]

# Step 4 - Convert to numeric
X = X.apply(pd.to_numeric)
y = pd.to_numeric(y)

# Step 5 - Split data into training and testing
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
print(f"\nTraining samples: {len(X_train)}")
print(f"Testing samples: {len(X_test)}")

# Step 6 - Build and train the model
print("\nTraining Random Forest model...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)
print("Model trained successfully!")

# Step 7 - Test the model
predictions = model.predict(X_test)

# Step 8 - Show results
accuracy = accuracy_score(y_test, predictions)
print(f"\nModel Accuracy: {accuracy * 100:.2f}%")
print("\nDetailed Report:")
print(classification_report(y_test, predictions,
    target_names=["Legitimate", "Phishing"]))

# Step 9 - Save the model
joblib.dump(model, 'phishing_model.pkl')
print("\nModel saved as phishing_model.pkl")