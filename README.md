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

**-- ## Project Structure & Organization**
EZSecure/
|- main.py
|- gui.py
|- config.py
|- requirements.txt
|- core/
|-ml/
|-intel/
|- utils/
|- data/
└── EZSecureApp/

**-- ## Detailed Organization**

core/: 
- scanner.py: Coordinates scanning operations
- file_scanner.py: Scans files
- process_monitor.py: Monitors processes
- network_monitor.py: Monitors network activity
- threat_detector.py: Central detection logic
- neutralizer.py: Responds to threats
- background.py: Runs continuous monitoring
- telemetry.py: Collects system metrics

ml/: - Contains trained models and training scripts  
intel/: - Stores known threat intelligence data  
utils/: - Logging, alerting, and notification systems  
data/: - Logs, hash database, and quarantined files  
EZSecureApp/: - React Native mobile frontend 

**-- ## System Operation**
1. The system starts through main.py
2. Monitoring begins across files, processes, and network
3. Data is sent to the threat detector
4. Detection occurs via:
   - Signature-based methods
   - Behavioral analysis
   - Machine learning models
5. If a threat is detected:
   - Neutralizer takes action
   - Alerts and logs are generated
6. Results are displayed via GUI or mobile app

**-- ## Conclusion**
EZSecure uses a layered approach combining multiple detection techniques with real-time monitoring and response. Its modular structure allows for scalability and future enhancements.


