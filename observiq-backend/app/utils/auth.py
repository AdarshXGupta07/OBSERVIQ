from fastapi import Header, HTTPException
from app.database import supabase
from app.utils.api_keys import hash_api_key


async def get_current_team(authorization: str = Header(...)):
    """
    Yeh function har protected endpoint mein use hoga.
    API key verify karta hai aur team info return karta hai.

    FastAPI mein isko 'Dependency' kehte hain.
    Ek baar likho — hazaar jagah use karo.
    """

    # Format check
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Format: Authorization: Bearer oiq_your_key"
        )

    raw_key = authorization.replace("Bearer ", "").strip()

    # Key format check
    if not raw_key.startswith("oiq_"):
        raise HTTPException(
            status_code=401,
            detail="Invalid API key format. Keys start with oiq_"
        )

    # DB mein verify karo
    key_hash = hash_api_key(raw_key)
    result = supabase.table("teams") \
        .select("*") \
        .eq("api_key_hash", key_hash) \
        .execute()

    if not result.data:
        raise HTTPException(
            status_code=401,
            detail="Invalid API key"
        )

    return result.data[0]