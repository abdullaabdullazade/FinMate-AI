"""Application configuration"""
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
import os

# Currency configuration - Only AZN supported
CURRENCY_SYMBOLS = {"AZN": "₼"}

# Initialize FastAPI app
app = FastAPI(title="FinMate AI", description="Your Personal CFO Assistant")

# Add CORS middleware for React frontend - MUST be before other middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
        "http://localhost:5173",  # Vite dev server (alternative port)
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8200",  # Backend port (for development)
        "http://127.0.0.1:8200",  # Backend port (alternative)
        "http://185.207.251.177:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],  # Expose all headers
    max_age=3600,  # Cache preflight for 1 hour
)

# Add session middleware
app.add_middleware(SessionMiddleware, secret_key="finmate-secret-key-change-in-production")

# Create static directory if doesn't exist
os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

