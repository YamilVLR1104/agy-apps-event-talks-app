import os
import datetime
import requests
from bs4 import BeautifulSoup
import xml.etree.ElementTree as ET
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

# In-memory cache for release notes
cache = {
    "data": None,
    "last_fetched": None,
    "error": None
}

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def parse_release_notes_html(html_content):
    """
    Parses the HTML content of a single entry, splitting it by <h3> tags
    to group details by category (e.g., Feature, Deprecation, Bug Fix).
    """
    if not html_content:
        return []
    
    soup = BeautifulSoup(html_content, 'html.parser')
    notes = []
    
    current_type = 'General'
    current_elements = []
    
    for child in soup.contents:
        if child.name == 'h3':
            # Save previous category block if it has content
            html_str = ''.join(str(el) for el in current_elements).strip()
            if html_str:
                notes.append({
                    'type': current_type,
                    'html': html_str
                })
            current_type = child.get_text(strip=True)
            current_elements = []
        else:
            current_elements.append(child)
            
    # Append the last category block
    html_str = ''.join(str(el) for el in current_elements).strip()
    if html_str:
        notes.append({
            'type': current_type,
            'html': html_str
        })
        
    return notes

def fetch_and_parse_feed():
    """
    Fetches the BigQuery XML feed and parses it into a structured dictionary.
    """
    try:
        response = requests.get(FEED_URL, headers=HEADERS, timeout=15)
        response.raise_for_status()
        
        # Parse XML
        root = ET.fromstring(response.content)
        namespaces = {'atom': 'http://www.w3.org/2005/Atom'}
        
        # Get overall feed update time
        updated_elem = root.find('atom:updated', namespaces)
        feed_updated = updated_elem.text if updated_elem is not None else ""
        
        entries = []
        for entry_el in root.findall('atom:entry', namespaces):
            title_el = entry_el.find('atom:title', namespaces)
            date_str = title_el.text if title_el is not None else "Unknown Date"
            
            updated_el = entry_el.find('atom:updated', namespaces)
            updated_str = updated_el.text if updated_el is not None else ""
            
            link_el = entry_el.find("atom:link[@rel='alternate']", namespaces)
            if link_el is None:
                link_el = entry_el.find("atom:link", namespaces)
            link_href = link_el.attrib.get('href', '') if link_el is not None else ''
            
            content_el = entry_el.find('atom:content', namespaces)
            content_html = content_el.text if content_el is not None else ""
            
            # Parse individual items in the content
            parsed_notes = parse_release_notes_html(content_html)
            
            entries.append({
                "date": date_str,
                "updated": updated_str,
                "link": link_href,
                "notes": parsed_notes
            })
            
        cache["data"] = {
            "feed_updated": feed_updated,
            "entries": entries
        }
        cache["last_fetched"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cache["error"] = None
        return True
    except Exception as e:
        cache["error"] = str(e)
        return False

# Trigger initial fetch on load
fetch_and_parse_feed()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/notes')
def get_notes():
    force_refresh = request.args.get('refresh', 'false').lower() == 'true'
    
    if force_refresh or cache["data"] is None:
        success = fetch_and_parse_feed()
        if not success and cache["data"] is None:
            return jsonify({
                "status": "error",
                "message": f"Failed to fetch data and no cached version is available: {cache['error']}",
                "last_fetched": cache["last_fetched"]
            }), 500
            
    return jsonify({
        "status": "success",
        "last_fetched": cache["last_fetched"],
        "feed_updated": cache["data"]["feed_updated"] if cache["data"] else None,
        "entries": cache["data"]["entries"] if cache["data"] else [],
        "warning": cache["error"]  # Include error message if a refresh failed but cached data is served
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
