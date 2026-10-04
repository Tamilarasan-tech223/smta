# Social Media Trend Analysis Using API, NLP and Machine Learning

A full-stack analytics dashboard that collects social media posts through an
API and analyzes them with NLP + Machine Learning: **TF-IDF + Logistic
Regression** for sentiment classification, and **TF-IDF + K-Means** for
topic / trend detection.

Built as a BTech Data Science project demo. The stack:

| Layer      | Technology                                              |
|------------|----------------------------------------------------------|
| Frontend   | React, Tailwind CSS, Recharts, Framer Motion, Lucide icons |
| Backend    | Python, FastAPI, REST API                               |
| Data / ML  | Pandas, NumPy, Scikit-learn, NLTK                       |

---

## 1. How the demo/live data switch works

This project **never fabricates data as if it were real**. On startup, the
backend checks for social API credentials in `backend/.env`:

- **No credentials configured** → the app generates a realistic, clearly
  labeled synthetic dataset (`"mode": "demo"` in every API response, shown as
  an amber **"Demo Data"** badge in the UI). This is what you'll see the
  first time you run it — perfect for a demo without needing API keys.
- **Live sources reachable** → the backend fetches real posts from two
  **completely free, no-API-key** sources — the **Mastodon public hashtag
  timeline** and **Hacker News** (via Algolia's free search API) — merges
  them, and tags every response `"mode": "live"` (green **"Live Data"**
  badge). No signup, no tokens, no payment.

If a live API call fails (bad credentials, rate limit, network error), the
backend automatically and silently falls back to demo data rather than
crashing, and the UI badge reflects that.

---

## 2. Project structure

```
social-media-trend-analysis/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI app, CORS, error handlers
│   │   ├── config.py             # reads .env
│   │   ├── routes/               # one file per endpoint group
│   │   ├── models/schemas.py     # pydantic response models
│   │   ├── services/
│   │   │   ├── data_service.py       # in-memory store + all analytics
│   │   │   ├── social_api_client.py  # free keyless API wrapper w/ demo fallback
│   │   │   └── demo_data.py          # synthetic post generator
│   │   └── ml/
│   │       ├── preprocessing.py      # clean/tokenize/stopword removal
│   │       ├── sentiment_model.py    # TF-IDF + LogisticRegression
│   │       ├── topic_model.py        # TF-IDF + KMeans
│   │       └── pipeline.py           # glues both models together
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/    # Sidebar, Topbar, KPICard, Toast, Skeleton, Badge...
│   │   ├── charts/        # Recharts wrappers (line, donut, bar, scatter, sparkline)
│   │   ├── pages/         # Dashboard, LiveTrends, SentimentAnalysis, Topics,
│   │   │                  # Engagement, Posts, ApiData, About
│   │   ├── services/api.js   # axios client + typed endpoint calls
│   │   ├── hooks/useApi.js   # fetch + loading/error/auto-refresh hook
│   │   └── App.jsx / main.jsx
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

---

## 3. Setup

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env             # leave values blank to use demo data
uvicorn app.main:app --reload --port 8000
```

The API is now running at `http://localhost:8000` (interactive docs at
`http://localhost:8000/docs`).

On first startup the backend trains the sentiment model on a small seed
corpus and fits the K-Means topic model on the demo dataset — this takes a
couple of seconds, no pre-trained model files needed.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. In development, Vite proxies all `/api/*`
requests to `http://localhost:8000` (see `vite.config.js`), so no extra
configuration is needed.

### The live data sources (no API keys needed)

This project deliberately uses **free, keyless** data sources — four of
them, merged into one feed — so there is nothing to sign up for and no
secret to manage:

| Source       | Endpoint                                              | Auth needed |
|--------------|-------------------------------------------------------|-------------|
| Mastodon     | `mastodon.social/api/v1/timelines/tag/{tag}`          | none        |
| Bluesky      | `public.api.bsky.app/xrpc/app.bsky.feed.searchPosts`  | none        |
| DEV.to       | `dev.to/api/articles` (Forem public API)              | none        |
| Hacker News  | `hn.algolia.com/api/v1/search` (Algolia)              | none        |
| Bluesky      | `public.api.bsky.app/xrpc/app.bsky.feed.searchPosts`  | none        |
| DEV.to       | `dev.to/api/articles` (by tag)                        | none        |

The dashboard works out of the box in "Live Data" mode as long as your
machine has internet access. Optional: point Mastodon at a different
instance by setting `MASTODON_INSTANCE` in `backend/.env` (default
`mastodon.social`).
---

### Troubleshooting: `metadata-generation-failed` while installing pandas

If `pip install -r requirements.txt` fails with a long Meson/Visual Studio
error while building **pandas**, pip is compiling it from source — which
happens when your Python version has no prebuilt pandas wheel
(pandas 2.2.2 has no wheels for Python 3.13) or you're on 32-bit Python.

**Fix (pick one):**

1. **Use Python 3.12 (64-bit)** — the reliable option:
   ```powershell
   deactivate
   cd ..
   rmdir /s /q venv
   py -3.12 -m venv venv
   venv\Scripts\activate
   pip install --upgrade pip
   pip install -r requirements.txt
   ```
2. **Or keep your current Python** — the requirements now use minimum
   versions (`pandas>=2.2.2` etc.), so pip will automatically download
   prebuilt wheels of the newest compatible release instead of compiling.
   Just run `pip install -r requirements.txt` again.

You can check the cause with `python --version` — if it says 3.13,
that's why pip tried to build from source.

---

## 4. Deployment (hosting it online)

The app is deployment-friendly: no database, no API keys, no build step on
the backend. The usual free-tier combo is **Render** (backend) + **Vercel**
(frontend).

### Important limitation to know first

`data_service.py` keeps the dataset **in memory**. Every restart or cold
start re-fetches from the live APIs and re-trains the ML models (takes a
few seconds). That's fine for a demo/project — but data is not persisted
between restarts, and free tiers that sleep will retrain on each wake-up.

### Backend on Render (free tier)

1. Push this repo to GitHub.
2. At [render.com](https://render.com): **New → Web Service** → pick the repo.
3. Settings:
   - **Root directory**: `backend`
   - **Build command**: `pip install -r requirements.txt`
   - **Start command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance type**: Free
4. Add environment variables:
   ```
   CORS_ORIGINS=https://your-frontend.vercel.app
   ```
5. Deploy. Note the URL, e.g. `https://smta-api.onrender.com`.
   Test it: `https://smta-api.onrender.com/api/status`

### Frontend on Vercel (free tier)

1. At [vercel.com](https://vercel.com): **Add New → Project** → pick the same repo.
2. Settings:
   - **Root directory**: `frontend`
   - **Framework preset**: Vite (auto-detected)
3. Add environment variable (the frontend already reads it — no code
   change needed, see `VITE_API_BASE_URL` in `src/services/api.js`):
   ```
   VITE_API_BASE_URL=https://smta-api.onrender.com
   ```
4. Deploy, then update `CORS_ORIGINS` on Render with your Vercel URL and
   restart the backend.

### Alternative single-host option

Any VPS (or Railway/Fly.io) can run both: `npm run build` in `frontend`,
serve the static files from FastAPI, and expose one port — no CORS or
proxy config needed at all.

---

## 4. ML pipeline summary

**Sentiment analysis**
```
raw text → preprocessing (lowercase, strip URLs/mentions/punctuation,
           tokenize, remove stopwords)
         → TF-IDF vectorizer
         → Logistic Regression
         → sentiment (positive / negative / neutral) + confidence score
```

**Topic / trend detection**
```
raw text → preprocessing
         → TF-IDF vectorizer
         → K-Means clustering
         → cluster id + top keywords → human-readable topic label
```

Both models live in `backend/app/ml/` as small, swappable classes
(`SentimentModel`, `TopicModel`) — replacing Logistic Regression with, say,
a fine-tuned transformer only requires changing `sentiment_model.py`; the
rest of the app (routes, frontend) is unaffected.

---

## 5. API reference

| Method | Endpoint             | Description                                   |
|--------|-----------------------|------------------------------------------------|
| GET    | `/api/dashboard`      | KPIs, engagement series, sentiment breakdown, top hashtags, trending topics, platform distribution |
| GET    | `/api/posts`          | Paginated/searchable/sortable post table       |
| GET    | `/api/trends`         | Ranked trending hashtags with sparkline data    |
| GET    | `/api/sentiment`      | Sentiment breakdown + per-post predictions      |
| GET    | `/api/topics`         | K-Means cluster summaries                       |
| GET    | `/api/engagement`     | Engagement time series, weekday averages, top posts, scatter data |
| POST   | `/api/fetch-data`     | Triggers a new data collection round            |
| GET    | `/api/status`         | API connection status for the "API Data" page   |

---

## 6. Notes on this implementation

- The demo dataset (`app/services/demo_data.py`) is generated from
  templated phrases across 6 topic domains so that the sentiment and
  topic models have realistic, varied text to work with — it is never
  presented to the user as real collected data.
- Error handling is centralized in `app/main.py`: unexpected errors return a
  friendly JSON message instead of a raw traceback; normal HTTP errors
  (404, validation errors) keep their correct status codes.
- The frontend keeps loading/error/empty states consistent across pages via
  shared `Skeleton`, `EmptyState`, and `ErrorState` components, and shows
  toast notifications for actions like "Fetch New Data."
- Responsive design: the sidebar collapses into a mobile drawer, tables
  scroll horizontally on small screens, and charts resize with their
  container.
