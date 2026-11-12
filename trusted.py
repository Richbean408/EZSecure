"""Well-known sites that the URL model should not second-guess.

The model only sees the link text. Real sites with subdomains or long paths
(docs.google.com, data.mendeley.com, canvas links) look like phishing to it
because most of its legit training links were short homepages.
Checked BEFORE the model. Add more names to trusted_domains.txt (one per line).
"""
import os
from urllib.parse import urlparse

TRUSTED = {
    "google.com", "youtube.com", "gmail.com", "googleusercontent.com", "gstatic.com",
    "microsoft.com", "office.com", "live.com", "outlook.com", "microsoftonline.com", "sharepoint.com",
    "apple.com", "icloud.com", "amazon.com", "paypal.com", "github.com", "gitlab.com",
    "wikipedia.org", "mozilla.org", "python.org", "stackoverflow.com", "w3.org",
    "linkedin.com", "zoom.us", "dropbox.com", "adobe.com", "slack.com", "notion.so",
    "kaggle.com", "zenodo.org", "mendeley.com", "frontiersin.org", "usenix.org",
    "elsevier.com", "sciencedirect.com", "springer.com", "ieee.org", "acm.org", "arxiv.org",
    "instructure.com", "canvas.com", "csun.edu", "csuci.edu", "calstate.edu",
    "expo.dev", "render.com", "anthropic.com", "claude.ai", "openai.com",
}
# Hosts on trusted domains that ANYONE can publish pages on: never auto-trust.
NOT_TRUSTED = {"sites.google.com", "storage.googleapis.com", "script.google.com", "forms.gle"}

_extra = os.path.join(os.path.dirname(os.path.abspath(__file__)), "trusted_domains.txt")
if os.path.exists(_extra):
    with open(_extra) as f:
        TRUSTED |= {l.strip().lower() for l in f if l.strip() and not l.startswith("#")}


def is_trusted(url):
    u = url if "://" in url else "https://" + url
    p = urlparse(u)
    host = (p.hostname or "").lower().rstrip(".")
    if not host or any(host == n or host.endswith("." + n) for n in NOT_TRUSTED):
        return False
    if host.endswith("google.com") and p.path.lower().startswith("/forms"):
        return False  # Google Forms are used to collect passwords
    return any(host == d or host.endswith("." + d) for d in TRUSTED)
