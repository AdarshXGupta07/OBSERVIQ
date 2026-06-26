from fastapi import APIRouter, Depends
from app.database import supabase
from app.utils.auth import get_current_team
from collections import defaultdict
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview")
async def get_overview(team: dict = Depends(get_current_team)):
    """
    Overall stats — dashboard ke top cards ke liye.
    Saare traces fetch karo aur Python mein calculate karo.

    Kyun Python mein calculate?
    Supabase REST API mein complex aggregation limited hai.
    Python mein karo — simple, readable, debuggable.
    """
    result = supabase.table("traces") \
        .select("latency_ms, cost_usd, status") \
        .eq("team_id", team["id"]) \
        .execute()

    traces = result.data

    if not traces:
        return {
            "total_calls": 0,
            "avg_latency_ms": 0,
            "total_cost_usd": 0.0,
            "success_rate": 0.0,
            "error_count": 0
        }

    total = len(traces)
    avg_latency = sum(t["latency_ms"] or 0 for t in traces) / total
    total_cost = sum(float(t["cost_usd"] or 0) for t in traces)
    success_count = sum(1 for t in traces if t["status"] == "success")

    return {
        "total_calls": total,
        "avg_latency_ms": round(avg_latency),
        "total_cost_usd": round(total_cost, 6),
        "success_rate": round((success_count / total) * 100, 1),
        "error_count": total - success_count
    }


@router.get("/by-model")
async def get_by_model(team: dict = Depends(get_current_team)):
    """
    Har model ka breakdown.
    "llama-3.3-70b ne 500 calls kiye, avg 340ms, $1.20 kharcha"

    defaultdict kyun?
    Har model ke liye automatically empty dict bana deta hai.
    Bina check kiye data[model]["calls"] += 1 kam karta hai.
    """
    result = supabase.table("traces") \
        .select("model, latency_ms, cost_usd, status") \
        .eq("team_id", team["id"]) \
        .execute()

    traces = result.data

    model_data = defaultdict(lambda: {
        "calls": 0,
        "latency_sum": 0,
        "cost_sum": 0.0,
        "success": 0
    })

    for t in traces:
        m = t["model"] or "unknown"
        model_data[m]["calls"] += 1
        model_data[m]["latency_sum"] += t["latency_ms"] or 0
        model_data[m]["cost_sum"] += float(t["cost_usd"] or 0)
        if t["status"] == "success":
            model_data[m]["success"] += 1

    result_list = []
    for model, data in model_data.items():
        calls = data["calls"]
        result_list.append({
            "model": model,
            "call_count": calls,
            "avg_latency_ms": round(data["latency_sum"] / calls) if calls else 0,
            "total_cost_usd": round(data["cost_sum"], 6),
            "success_rate": round((data["success"] / calls) * 100, 1) if calls else 0
        })

    # Sabse zyada use hone wale model pehle
    return sorted(result_list, key=lambda x: x["call_count"], reverse=True)


@router.get("/by-feature")
async def get_by_feature(team: dict = Depends(get_current_team)):
    """
    Feature-wise cost breakdown.
    "medical_advice feature ne aaj $1.80 kharcha kiya"

    feature_name None ho sakta hai — isliye 'unknown' fallback
    """
    result = supabase.table("traces") \
        .select("feature_name, latency_ms, cost_usd, status") \
        .eq("team_id", team["id"]) \
        .execute()

    traces = result.data

    feature_data = defaultdict(lambda: {
        "calls": 0,
        "latency_sum": 0,
        "cost_sum": 0.0,
        "success": 0
    })

    for t in traces:
        feature = t["feature_name"] or "unknown"
        feature_data[feature]["calls"] += 1
        feature_data[feature]["latency_sum"] += t["latency_ms"] or 0
        feature_data[feature]["cost_sum"] += float(t["cost_usd"] or 0)
        if t["status"] == "success":
            feature_data[feature]["success"] += 1

    result_list = []
    for feature, data in feature_data.items():
        calls = data["calls"]
        result_list.append({
            "feature_name": feature,
            "call_count": calls,
            "avg_latency_ms": round(data["latency_sum"] / calls) if calls else 0,
            "total_cost_usd": round(data["cost_sum"], 6),
            "success_rate": round((data["success"] / calls) * 100, 1) if calls else 0
        })

    return sorted(result_list, key=lambda x: x["total_cost_usd"], reverse=True)


@router.get("/daily")
async def get_daily(team: dict = Depends(get_current_team)):
    """
    Last 7 days ka daily trend.
    "Is hafte Monday pe 340 calls, Tuesday pe 120 calls..."

    Kyun 7 days?
    Weekly pattern dikhta hai — weekdays vs weekends.
    Company decide kar sakti hai ki AI usage pattern sahi hai ya nahi.

    Empty days bhi include karte hain (0 calls wale din bhi dikhte hain).
    Warna graph mein gaps aate hain.
    """
    seven_days_ago = (
        datetime.now(timezone.utc) - timedelta(days=7)
    ).isoformat()

    result = supabase.table("traces") \
        .select("created_at, cost_usd, latency_ms, status") \
        .eq("team_id", team["id"]) \
        .gte("created_at", seven_days_ago) \
        .execute()

    traces = result.data

    daily_data = defaultdict(lambda: {
        "calls": 0,
        "cost_sum": 0.0,
        "latency_sum": 0,
        "errors": 0
    })

    for t in traces:
        # "2026-06-25T14:32:01Z" → "2026-06-25"
        date = t["created_at"][:10]
        daily_data[date]["calls"] += 1
        daily_data[date]["cost_sum"] += float(t["cost_usd"] or 0)
        daily_data[date]["latency_sum"] += t["latency_ms"] or 0
        if t["status"] != "success":
            daily_data[date]["errors"] += 1

    # Last 7 days — aaj se 6 din pehle tak
    result_list = []
    for i in range(6, -1, -1):
        date = (
            datetime.now(timezone.utc) - timedelta(days=i)
        ).strftime("%Y-%m-%d")

        data = daily_data.get(date, {
            "calls": 0, "cost_sum": 0.0, "latency_sum": 0, "errors": 0
        })

        result_list.append({
            "date": date,
            # Short format for chart label: "Jun 25"
            "label": (
                datetime.now(timezone.utc) - timedelta(days=i)
            ).strftime("%b %d"),
            "call_count": data["calls"],
            "total_cost_usd": round(data["cost_sum"], 6),
            "avg_latency_ms": round(
                data["latency_sum"] / data["calls"]
            ) if data["calls"] else 0,
            "error_count": data["errors"]
        })

    return result_list