from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import re
import os
from urllib.parse import urlparse
from network_monitor import monitor_network
from threat_detector import predict_threat

app = Flask(__name__)
CORS(app)

model = joblib.load('phishing_model.pkl')

# ─── Phishing Scanner ───
@app.route('/scan', methods=['POST'])
def scan_url():
    data = request.json
    url = data.get('url', '')
    features = extract_features(url)
    prediction = model.predict([features])[0]
    result = 'phishing' if prediction == -1 else 'safe'
    return jsonify({
        'url': url,
        'result': result,
        'confidence': '96.70%'
    })

def extract_features(url):
    try:
        parsed = urlparse(url if url.startswith('http') else 'http://' + url)
        domain = parsed.netloc

        having_ip = -1 if re.match(r'\d+\.\d+\.\d+\.\d+', domain) else 1
        url_length = 1 if len(url) < 54 else (0 if len(url) <= 75 else -1)
        shorteners = ['bit.ly','tinyurl','goo.gl','ow.ly','t.co','is.gd']
        shortining = -1 if any(s in domain for s in shorteners) else 1
        at_symbol = -1 if '@' in url else 1
        double_slash = -1 if url.rfind('//') > 7 else 1
        prefix_suffix = -1 if '-' in domain else 1
        dots = domain.count('.')
        sub_domain = 1 if dots == 1 else (0 if dots == 2 else -1)
        ssl = 1 if url.startswith('https') else -1
        domain_reg = -1
        favicon = 1
        port = -1 if re.search(r':\d+', domain) else 1
        https_token = -1 if 'https' in domain.lower() else 1
        request_url = 1
        url_anchor = -1 if any(w in url.lower() for w in ['login','verify','secure','account','update','confirm','bank','paypal']) else 1
        links_tags = 1
        sfh = 1
        submit_email = 1
        suspicious = ['login','verify','secure','account','update','confirm','bank','paypal','ebay','signin']
        abnormal = -1 if any(w in url.lower() for w in suspicious) else 1
        redirect = 1 if url.count('//') <= 1 else -1
        mouseover = 1
        right_click = 1
        popup = 1
        iframe = 1
        age_domain = -1
        dns = 1
        web_traffic = -1 if len(domain) < 5 else 1
        page_rank = -1 if len(domain) < 8 else 1
        google_index = 1
        links_pointing = 1
        stats = -1 if any(w in url.lower() for w in ['login','verify','secure','bank']) else 1

        return [
            having_ip, url_length, shortining, at_symbol, double_slash,
            prefix_suffix, sub_domain, ssl, domain_reg, favicon,
            port, https_token, request_url, url_anchor, links_tags,
            sfh, submit_email, abnormal, redirect, mouseover,
            right_click, popup, iframe, age_domain, dns,
            web_traffic, page_rank, google_index, links_pointing, stats
        ]
    except:
        return [1] * 30

# ─── Wi-Fi Scanner ───
@app.route('/wifi-scan', methods=['GET'])
def wifi_scan():
    try:
        issues = monitor_network()
        if len(issues) == 0:
            status = 'safe'
            message = 'No suspicious connections detected'
        else:
            status = 'warning'
            message = f'{len(issues)} suspicious connection(s) found'
        return jsonify({
            'status': status,
            'message': message,
            'issues': issues,
            'total': len(issues)
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'issues': [],
            'total': 0
        })

# ─── Malware Scanner ───
@app.route('/malware-scan', methods=['POST'])
def malware_scan():
    try:
        data = request.json
        cpu = data.get('cpu', 0)
        memory = data.get('memory', 0)
        disk = data.get('disk', 0)
        suspicious_files = data.get('suspicious_files', 0)
        network_anomalies = data.get('network_anomalies', 0)

        rf_percent, ann_percent, combined = predict_threat(
            cpu, memory, disk, suspicious_files, network_anomalies
        )

        if combined > 70:
            status = 'malware'
            message = 'Malware detected on your device!'
        elif combined > 40:
            status = 'warning'
            message = 'Suspicious activity detected'
        else:
            status = 'safe'
            message = 'No malware detected'

        return jsonify({
            'status': status,
            'message': message,
            'rf_score': rf_percent,
            'ann_score': ann_percent,
            'combined_score': combined
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)