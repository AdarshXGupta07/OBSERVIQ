from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# ═══════════════════════════════
# TEAM SCHEMAS (Day 1 se same)
# ═══════════════════════════════

class TeamRegister(BaseModel):
    name: str
    email: EmailStr

class TeamRegisterResponse(BaseModel):
    id: str
    name: str
    email: str
    api_key: str
    api_key_prefix: str
    plan: str
    created_at: datetime
    message: str

class TeamInfo(BaseModel):
    id: str
    name: str
    email: str
    api_key_prefix: str
    plan: str
    created_at: datetime

class HealthResponse(BaseModel):
    status: str
    version: str
    database: str

# ═══════════════════════════════
# TRACE SCHEMAS (Day 2 — naya)
# ═══════════════════════════════

class TraceCreate(BaseModel):
    """
    Yeh data Doctor App bhejegi har AI call ke baad.
    Optional fields hain kyunki sabka setup alag hota hai.
    Koi cost track karta hai, koi nahi karta.
    """
    model: str
    input: Optional[str] = None
    output: Optional[str] = None
    prompt_tokens: Optional[int] = 0
    completion_tokens: Optional[int] = 0
    latency_ms: Optional[int] = 0
    cost_usd: Optional[float] = 0.0
    status: Optional[str] = "success"
    error_message: Optional[str] = None

    # Extra context — optional
    feature_name: Optional[str] = None
    user_identifier: Optional[str] = None


class TraceResponse(BaseModel):
    """
    Trace save hone ke baad yeh return hoga.
    """
    id: str
    team_id: str
    model: str
    input: Optional[str]
    output: Optional[str]
    prompt_tokens: int
    completion_tokens: int
    latency_ms: int
    cost_usd: float
    status: str
    error_message: Optional[str]
    feature_name: Optional[str]
    user_identifier: Optional[str]
    created_at: datetime


class TracesListResponse(BaseModel):
    """
    GET /traces ka response —
    traces ki list + total count
    """
    traces: list[TraceResponse]
    total: int
    page: int
    limit: int