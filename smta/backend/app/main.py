from fastapi import FastAPI, Request
from fastapi.exceptions import HTTPException, RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routes import api_router

app = FastAPI(
    title="Social Media Trend Analysis API",
    description="Collects social media data and analyzes it with NLP + ML "
                 "(TF-IDF + Logistic Regression for sentiment, TF-IDF + "
                 "KMeans for topic/trend detection).",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    # Preserve normal HTTP semantics (404, 401, etc.) instead of masking
    # them as a generic 500.
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": True, "message": exc.detail},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"error": True, "message": "Invalid request parameters.", "detail": exc.errors()},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # Anything else (ML prediction errors, unexpected bugs, etc.) becomes a
    # friendly, structured error instead of a raw 500 trace so the frontend
    # can show a clean error state.
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "message": "Something went wrong processing that request. Please try again.",
            "detail": str(exc) if settings.app_env == "development" else None,
        },
    )


@app.get("/")
def root():
    return {
        "name": "Social Media Trend Analysis API",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "ok"}
