from fastapi import APIRouter, HTTPException, Depends
from app.database import supabase
from app.models.schemas import TraceCreate, TraceResponse, TracesListResponse
from app.utils.auth import get_current_team

router = APIRouter(prefix="/traces", tags=["Traces"])


@router.post("", response_model=TraceResponse)
async def create_trace(
    data: TraceCreate,
    team: dict = Depends(get_current_team)  # ← Dependency inject hoti hai
):
    """
    Ek AI call ka trace save karo.

    Depends(get_current_team) matlab:
    1. Pehle API key verify karo
    2. Team info nikalo
    3. Phir is function ka code chalo

    Agar key galat hai → automatically 401 return hoga
    Agar key sahi hai → team dict milega
    """

    # Supabase mein insert karo
    result = supabase.table("traces").insert({
        "team_id": team["id"],      # ← Kis company ka trace hai
        "model": data.model,
        "input": data.input,
        "output": data.output,
        "prompt_tokens": data.prompt_tokens,
        "completion_tokens": data.completion_tokens,
        "latency_ms": data.latency_ms,
        "cost_usd": data.cost_usd,
        "status": data.status,
        "error_message": data.error_message,
        "feature_name": data.feature_name,
        "user_identifier": data.user_identifier,
    }).execute()

    if not result.data:
        raise HTTPException(
            status_code=500,
            detail="Failed to save trace"
        )

    return result.data[0]


@router.get("", response_model=TracesListResponse)
async def get_traces(
    page: int = 1,
    limit: int = 20,
    team: dict = Depends(get_current_team)
):
    """
    Apni team ke saare traces dekho.
    Pagination support hai — ek baar mein 20 traces.

    Kyun pagination?
    1 million traces ek saath load karna
    browser crash kar dega. 20-20 load karo.
    """

    # Offset calculate karo
    # Page 1 → offset 0 (0 se 20)
    # Page 2 → offset 20 (20 se 40)
    offset = (page - 1) * limit

    # Traces fetch karo — sirf apni team ki
    result = supabase.table("traces") \
        .select("*") \
        .eq("team_id", team["id"]) \
        .order("created_at", desc=True) \
        .range(offset, offset + limit - 1) \
        .execute()

    # Total count fetch karo
    count_result = supabase.table("traces") \
        .select("id", count="exact") \
        .eq("team_id", team["id"]) \
        .execute()

    total = count_result.count or 0

    return TracesListResponse(
        traces=result.data,
        total=total,
        page=page,
        limit=limit
    )


@router.get("/{trace_id}", response_model=TraceResponse)
async def get_single_trace(
    trace_id: str,
    team: dict = Depends(get_current_team)
):
    """
    Ek specific trace ki poori detail dekho.

    team_id check kyun?
    Agar Doctor App trace_id guess karke
    ChatBot Inc ka trace dekhe — security breach hoga.
    Isliye team_id bhi check karte hain.
    """

    result = supabase.table("traces") \
        .select("*") \
        .eq("id", trace_id) \
        .eq("team_id", team["id"]) \
        .execute()

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="Trace not found"
        )

    return result.data[0]