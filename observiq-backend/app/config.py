from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    supabase_url: str
    supabase_service_key: str
    secret_key: str = "change-in-production"
    groq_api_key: str = ""  # ← yeh add karo

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()