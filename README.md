# BigQuery Release Notes Tracker

A premium, high-fidelity web application built with Python Flask (backend) and vanilla HTML, JavaScript, and CSS (frontend) that fetches, parses, caches, and visualizes the official BigQuery Release Notes feed.

## 🚀 Key Features

- **Dynamic Feed Fetching & Parsing:** Automatically retrieves the official Atom XML feed, extracts the metadata, and parses raw HTML structures to isolate and group changes by date and category.
- **Granular Categories:** Splitting of individual day entries into separate, color-coded updates:
  - **Feature** (Green badge)
  - **Deprecation** (Red badge)
  - **Changed** (Orange badge)
  - **Notice** (Blue badge)
  - **General** (Purple badge)
- **Interactive Control Center:**
  - **Instant Search:** Dynamic client-side searching across dates, category types, and release note content.
  - **Category Tabs:** Fast switching between different types of updates (e.g., viewing only *Features* or *Deprecations*).
  - **Sort Order Toggle:** Swap between Newest First and Oldest First instantly.
- **Analytics Dashboard:** Metrics summary cards displaying the total number of release days and counts for features, deprecations, and other updates.
- **Refresh Button with Spinner:** On-demand data updates from the Google feed via a `/api/notes?refresh=true` AJAX call, showing a spinning loader and success/error toasts.
- **Share on X (Twitter):**
  - **Individual Updates:** Click the "Share" button on any release update card to compose a tweet specifically for that card.
  - **Multi-Select & Tweet:** Select multiple updates by clicking on cards. A floating bar appears at the bottom allowing you to tweet a compiled list of all selected updates, dynamically formatted and shortened to fit within Twitter's 280-character limit.
- **Premium Glassmorphic Design:** Glowing gradients, blurred backdrops (`backdrop-filter`), smooth hover transitions, and sticky layout components (such as the sticky date headers that track with you as you read that day's notes).

---

## 📂 Project Architecture

The application has a clean, standard Flask project layout:

```text
prueba_agy/
├── .venv/                 # Python virtual environment (contains Flask, requests, bs4)
├── .gitignore             # Git exclusion rules
├── app.py                 # Flask server (feed fetching, XML/HTML parsing, cache, and API routes)
├── README.md              # Project documentation (this file)
├── templates/
│   └── index.html         # Main dashboard layout
└── static/
    ├── style.css          # Design system, glassmorphism panels, colors, and responsive layouts
    └── script.js          # App state, API calls, instant search/filter engine, and animations
```

---

## 💻 Technical Details

### Backend Code
The Flask backend uses Python's standard `xml.etree.ElementTree` to navigate the namespaced Atom XML elements safely, and uses `BeautifulSoup` (`html.parser`) to parse the HTML inside `<content>`. It groups text blocks by splitting on `<h3>` tags to extract individual updates with their respective category headings. An in-memory cache is used to ensure instant page loads, and it exposes two main routes:
1. `GET /`: Renders the frontend interface.
2. `GET /api/notes`: Returns cached release notes in JSON format. Accepting `?refresh=true` forces a live fetch and updates the cache.

### Frontend Interface
The markup uses HTML5 semantic tags (`<header>`, `<main>`, `<section>`, `<footer>`), integrates Google Fonts (Inter & Outfit), and defines placeholders for the metrics, controls, loading spinner, error states, and the main release timeline.

### Stylesheets
A bespoke dark-mode CSS stylesheet featuring:
- Soft glowing background orbs with high Gaussian blur values to add depth.
- Glass panels with `backdrop-filter: blur(16px)` and translucent borders.
- Sticky dates that remain visible at the side of their timeline entries when scrolling.
- Media queries mapping out responsive layouts for tablet and mobile devices.

### Frontend Engine
A vanilla JavaScript engine managing state React-style (without framework overhead). It tracks state parameters like search strings, active categories, sorting direction, and handles DOM updates, loading/error animations, and toast notifications.

---

## ⚙️ Running the Application

If you ever need to start or restart the server locally, run the following command lines:

1. **Activate the Virtual Environment:**
   ```powershell
   .venv\Scripts\activate
   ```
2. **Run the Server:**
   ```powershell
   python app.py
   ```
3. **Open in Browser:**
   Go to [http://127.0.0.1:5000](http://127.0.0.1:5000).

---

## 🌐 GitHub Repository

The project is hosted on GitHub:
🔗 [YamilVLR1104/agy-apps-event-talks-app](https://github.com/YamilVLR1104/agy-apps-event-talks-app)
