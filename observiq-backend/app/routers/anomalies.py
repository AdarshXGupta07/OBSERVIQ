from fastapi import APIRouter, Depends, BackgroundTasks
from app.database import supabase
from app.utils.auth import get_current_team
from groq import Groq
from app.config import settings
import json

router = APIRouter(prefix="/anomalies", tags=["Anomalies"])
groq_client = Groq(api_key=settings.groq_api_key)


@router.get("")
async def get_anomalies(
    resolved: bool = False,
    team: dict = Depends(get_current_team)
):
    """
    Team ki anomalies fetch karo.
    Default: sirf unresolved anomalies.
    """
    result = supabase.table("anomalies") \
        .select("*") \
        .eq("team_id", team["id"]) \
        .eq("resolved", resolved) \
        .order("created_at", desc=True) \
        .limit(20) \
        .execute()

    return {"anomalies": result.data, "total": len(result.data)}


@router.post("/analyze")
async def analyze_traces(
    background_tasks: BackgroundTasks,
    team: dict = Depends(get_current_team)
):
    """
    Traces analyze karo — Groq se anomaly detection.
    Background mein chalta hai — request instantly return hoti hai.
    """
    background_tasks.add_task(run_anomaly_detection, team["id"])
    return {"message": "Analysis started", "status": "processing"}


@router.patch("/{anomaly_id}/resolve")
async def resolve_anomaly(
    anomaly_id: str,
    team: dict = Depends(get_current_team)
):
    """Anomaly resolve karo."""
    result = supabase.table("anomalies") \
        .update({"resolved": True}) \
        .eq("id", anomaly_id) \
        .eq("team_id", team["id"]) \
        .execute()

    return {"message": "Anomaly resolved"}


async def run_anomaly_detection(team_id: str):
    """
    Actual detection logic — background mein chalta hai.

    Steps:
    1. Last 50 traces fetch karo
    2. Groq ko bhejo
    3. Response parse karo
    4. Supabase mein save karo
    """
    try:
        # Step 1 — Last 50 traces fetch karo
        result = supabase.table("traces") \
            .select("id, model, latency_ms, cost_usd, status, error_message, feature_name, created_at") \
            .eq("team_id", team_id) \
            .order("created_at", desc=True) \
            .limit(50) \
            .execute()

        traces = result.data
        print(f"DEBUG: Found {len(traces)} traces")

        if len(traces) < 3:
            return  # Kam traces mein analyze nahi karte

        # Step 2 — Groq ko bhejo
        traces_summary = json.dumps(traces, indent=2, default=str)

        prompt = f"""You are an AI monitoring expert. Analyze these AI application traces and detect anomalies.

Traces data:
{traces_summary}

Detect anomalies like:
- High latency spikes (>2000ms)
- High error rates (>20% errors)
- Unusual cost spikes
- Repeated errors with same message
- Performance degradation over time

Respond ONLY with a JSON array. No explanation, no markdown, just raw JSON:
[
  {{
    "severity": "high",
    "title": "Short title (max 60 chars)",
    "description": "Clear description of the anomaly (max 200 chars)",
    "affected_trace_ids": ["uuid1", "uuid2"]
  }}
]

If no anomalies found, respond with empty array: []"""

        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000,
            temperature=0.1  # Low temperature — consistent JSON output
        )

        raw = response.choices[0].message.content.strip()
        print(f"DEBUG Groq response: {raw}")  # ← add karo

        # Step 3 — Parse karo
        # Groq kabhi kabhi ```json ... ``` wrap karta hai
        if "```" in raw:
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]

        anomalies = json.loads(raw)

        if not isinstance(anomalies, list):
            return

        # Step 4 — Supabase mein save karo
        for anomaly in anomalies:
            if not all(k in anomaly for k in ["severity", "title", "description"]):
                continue

            # Valid severity check
            if anomaly["severity"] not in ["low", "medium", "high"]:
                anomaly["severity"] = "medium"

            supabase.table("anomalies").insert({
                "team_id": team_id,
                "severity": anomaly["severity"],
                "title": anomaly["title"][:60],
                "description": anomaly["description"][:200],
                "affected_trace_ids": anomaly.get("affected_trace_ids", []),
                "resolved": False
            }).execute()

    except json.JSONDecodeError:
        pass  # Groq ne valid JSON nahi diya — skip
    except Exception as e:
        print(f"Anomaly detection failed: {e}")