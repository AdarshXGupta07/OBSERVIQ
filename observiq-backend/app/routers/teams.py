from fastapi import APIRouter, HTTPException, Depends
from app.database import supabase
from app.models.schemas import TeamRegister, TeamRegisterResponse, TeamInfo
from app.utils.api_keys import generate_api_key
from app.utils.auth import get_current_team

router = APIRouter(prefix="/teams", tags=["Teams"])


@router.post("/register", response_model=TeamRegisterResponse)
async def register_team(data: TeamRegister):
    # Duplicate email check
    existing = supabase.table("teams") \
        .select("id") \
        .eq("email", data.email) \
        .execute()

    if existing.data:
        raise HTTPException(
            status_code=400,
            detail="Email already registered."
        )

    raw_key, hashed_key, prefix = generate_api_key()

    result = supabase.table("teams").insert({
        "name": data.name,
        "email": data.email,
        "api_key_hash": hashed_key,
        "api_key_prefix": prefix,
        "plan": "free"
    }).execute()

    if not result.data:
        raise HTTPException(
            status_code=500,
            detail="Failed to create team"
        )

    team = result.data[0]

    return TeamRegisterResponse(
        id=team["id"],
        name=team["name"],
        email=team["email"],
        api_key=raw_key,
        api_key_prefix=prefix,
        plan=team["plan"],
        created_at=team["created_at"],
        message="Save your API key now — it won't be shown again!"
    )


@router.get("/me", response_model=TeamInfo)
async def get_my_team(team: dict = Depends(get_current_team)):
    """
    Day 1 mein manually auth code likha tha.
    Ab Depends(get_current_team) se ho jaata hai.
    Clean aur simple.
    """
    return TeamInfo(
        id=team["id"],
        name=team["name"],
        email=team["email"],
        api_key_prefix=team["api_key_prefix"],
        plan=team["plan"],
        created_at=team["created_at"]
    )