# ObservIQ — AI Observability Platform

> Professional observability for every AI call in your application.

ObservIQ helps engineering teams understand how their AI features behave in production — what models are being called, how much they cost, where latency spikes appear, and whether requests are succeeding or failing.

## 🔗 Live Demo

| Service | URL |
|---------|-----|
| **Dashboard (Frontend)** | https://symphonious-sunburst-bcd1a4.netlify.app |
| **API (Backend)** | https://observiq-production.up.railway.app |
| **API Docs (Swagger)** | https://observiq-production.up.railway.app/docs |
| **Documentation** | https://observiq-docs.netlify.app |

---

## 📸 What It Does

ObservIQ gives you a real-time operational view of all your AI model traffic:

- **Overview** — Live stats: total calls, average latency, total cost, success rate
- **Traces** — Every AI request logged with model, input, output, tokens, latency, cost, and status
- **Analytics** — Breakdown by model, by feature, and daily trends with recharts visualizations
- **Anomalies** — Auto-detected errors and high-latency requests

---

## 🏗️ Architecture

```
OBSERVIQ/
├── observiq-dashboard/     # Next.js 14 frontend (Netlify)
├── observiq-backend/       # FastAPI backend (Railway)
├── observiq-sdk/           # Python SDK (pip install)
└── README.md
```

### Tech Stack

**Frontend**
- Next.js 14 (App Router)
- Tailwind CSS v3
- Recharts (analytics charts)
- TypeScript
- Lucide React (icons)

**Backend**
- FastAPI (Python)
- Supabase (PostgreSQL database)
- Pydantic v2 (data validation)
- Groq (AI integration)
- Uvicorn (ASGI server)

**SDK**
- Pure Python
- Zero dependencies beyond `requests`
- Context manager pattern for clean tracing

---

## 🚀 Quick Start

### 1. Create an account

Go to the [dashboard](https://symphonious-sunburst-bcd1a4.netlify.app), click **Sign up**, enter your team name and email, and save your API key.

### 2. Install the SDK

```bash
pip install observiq-sdk
```

### 3. Instrument your AI calls

```python
from observiq_sdk import ObservIQ

client = ObservIQ(api_key="oiq_your_api_key_here")

# Wrap any AI call
with client.trace(
    model="gpt-4o-mini",
    feature_name="support-summary"
):
    response = openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": "Summarize this ticket..."}]
    )
```

### 4. Open your dashboard

Log in at [symphonious-sunburst-bcd1a4.netlify.app](https://symphonious-sunburst-bcd1a4.netlify.app) with your API key and watch traces appear in real time.

---

## 🔌 API Reference

Base URL: `https://observiq-production.up.railway.app`

Full interactive docs at: `https://observiq-production.up.railway.app/docs`

### Authentication

All endpoints require a Bearer token:

```
Authorization: Bearer oiq_your_api_key
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/teams/register` | Create a new team and get an API key |
| `GET` | `/teams/me` | Get current team info |
| `POST` | `/traces` | Send a new trace |
| `GET` | `/traces` | Get all traces (paginated) |
| `GET` | `/analytics/overview` | Summary stats |
| `GET` | `/analytics/by-model` | Usage broken down by model |
| `GET` | `/analytics/by-feature` | Usage broken down by feature |
| `GET` | `/analytics/daily` | Daily usage trends (last 7 days) |
| `GET` | `/anomalies` | Detected errors and slow requests |
| `GET` | `/health` | Health check |

---

## 🛠️ Local Development

### Prerequisites

- Node.js 20+
- Python 3.11+
- A Supabase project

### Frontend

```bash
cd observiq-dashboard
npm install
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

### Backend

```bash
cd observiq-backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_SERVICE_KEY, SECRET_KEY
uvicorn app.main:app --reload --port 8000
```

### Environment Variables

**Frontend** (`observiq-dashboard/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend** (`observiq-backend/.env`)

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
SECRET_KEY=your_secret_key
GROQ_API_KEY=your_groq_api_key
CORS_ORIGINS=http://localhost:3000
```

---

## 🗄️ Database Schema

ObservIQ uses two tables in Supabase (PostgreSQL):

**teams**
```sql
id, name, email, api_key_hash, api_key_prefix, plan, created_at
```

**traces**
```sql
id, team_id, model, input, output, prompt_tokens, completion_tokens,
latency_ms, cost_usd, status, error_message, feature_name,
user_identifier, created_at
```

Migrations are in `observiq-backend/supabase/migrations/`.

---

## 📦 SDK Reference

```python
from observiq_sdk import ObservIQ

client = ObservIQ(
    api_key="oiq_...",
    base_url="https://observiq-production.up.railway.app"  # optional
)

# Context manager — auto captures latency, status, errors
with client.trace(
    model="llama-3.3-70b",
    feature_name="invoice-parser",
    user_identifier="user_123"       # optional
) as trace:
    result = call_your_model(prompt)
    trace.set_output(result)
```

---

## 🚢 Deployment

### Frontend → Netlify

1. Connect GitHub repo to Netlify
2. Set base directory: `observiq-dashboard`
3. Build command: `npm run build`
4. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app`

### Backend → Railway

1. Connect GitHub repo to Railway
2. Set watch path: `/observiq-backend/**`
3. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add all environment variables from the `.env` section above

---

## 📄 License

MIT

---

Built by [Adarsh Gupta](https://github.com/AdarshXGupta07)
