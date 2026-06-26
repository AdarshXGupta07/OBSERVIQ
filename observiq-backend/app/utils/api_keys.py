import secrets
import hashlib

def generate_api_key() -> tuple[str, str, str]:
    random_part = secrets.token_hex(32)
    raw_key = f"oiq_{random_part}"
    prefix = raw_key[:12]
    hashed = hashlib.sha256(raw_key.encode()).hexdigest()
    return raw_key, hashed, prefix

def hash_api_key(raw_key: str) -> str:
    return hashlib.sha256(raw_key.encode()).hexdigest()