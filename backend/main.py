"""Main FastAPI application - Clean and organized structure"""
from dotenv import load_dotenv
from config import app
from database import init_db, seed_demo_data
from fastapi import Request
from fastapi.responses import JSONResponse

# Load environment variables
load_dotenv()

# Import all route modules (they register routes with app)
from routes import (
    auth, stats, dashboard, chat, scan, profile, 
    expenses, dreams, settings, rewards, heatmap, 
    notifications, export
)

# ==================== STARTUP & EVENT HANDLERS ====================

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db()
    seed_demo_data()

@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    """Handle CORS preflight OPTIONS requests"""
    return JSONResponse({"message": "OK"}, status_code=200)

@app.exception_handler(404)
async def custom_404_handler(request: Request, exc):
    """Custom 404 handler - JSON response for React"""
    return JSONResponse(
        {"error": "Not found", "message": "The requested resource was not found"},
        status_code=404
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8200, reload=True)

