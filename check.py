import joblib
model = joblib.load('phishing_model.pkl')
print("Features needed:", model.n_features_in_)