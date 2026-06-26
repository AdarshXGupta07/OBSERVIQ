from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from app.routers import health, teams, traces, analytics, anomalies
import os

app = FastAPI(
    title="ObservIQ API",
    description="AI Application Observability Platform",
    version="0.4.0"
)

# Get CORS origins from environment variable
cors_origins_env = os.getenv("CORS_ORIGINS", "*")
if cors_origins_env == "*":
    cors_origins = ["*"]
else:
    cors_origins = [origin.strip() for origin in cors_origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(teams.router)
app.include_router(traces.router)
app.include_router(analytics.router)
app.include_router(anomalies.router)

@app.get("/")
async def root():
    return {
        "message": "ObservIQ API is running 🚀",
        "docs": "/docs",
        "version": "0.4.0"
    }

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="ObservIQ API",
        version="0.4.0",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {"type": "http", "scheme": "bearer"}
    }
    for path in openapi_schema["paths"].values():
        for method in path.values():
            method["security"] = [{"BearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi