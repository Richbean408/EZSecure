**## EZSecure**

EZSecure is a free, AI-powered mobile security application designed to protect everyday smartphone users from modern digital threats. Unlike paid competitors such as Bitdefender and Lookout, EZSecure requires no technical knowledge and provides comprehensive protection through a simple, intuitive interface. The app uses a combination of Artificial Neural Networks (ANN) and Random Forest (RF) machine learning models to detect phishing URLs, malware, and suspicious network activity in real time.

**-- ## Description of how the project was implemented.**






**-- ## An explanation of how the code is organized and how it works**






**-- ## instructions for how to run and test the project**

**Step 1 — Clone the project:**
git clone https://github.com/Richbean408/EZSecure.git
cd EZSecure

**Step 2 — Install the app dependencies:**
cd EZSecureApp
npm install

**Step 3 — Start the app:**
npx expo start

Then press w to open in the browser or i for the iPhone simulator.

**How to Test It**

**Test the Phishing Scanner:**
1. Open the app and tap Phishing Scanner
2. Type in any URL and tap Scan URL
3. The app will tell you if the link is Safe or Phishing

**Test the Malware Scanner:**
1. Open the app and tap Malware Scanner
2. Tap Scan Device
3. The app will scan and show RF score, ANN score, and combined score

**Test the Wi-Fi Scanner:**
1. Open the app and tap Wi-Fi Security
2. Tap Scan Now
3. The app will check your network for suspicious connections




**-- ## Setup Requirements**
For the Python Backend:
Python 3
Flask
scikit-learn
numpy
psutil
gunicorn

Install everything by running:
pip install -r requirements.txt
