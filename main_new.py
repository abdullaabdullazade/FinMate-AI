"""Main FastAPI application - Refactored and organized"""
from dotenv import load_dotenv
from config import app, templates
from database import init_db, seed_demo_data

# Load environment variables
load_dotenv()

# Import all routes
from routes import auth
from routes import dashboard
from routes import chat
from routes import scan
from routes import profile
from routes import expenses
from routes import dreams
from routes import settings
from routes import rewards
from routes import heatmap
from routes import notifications
from routes import export
from routes import stats

# ==================== STARTUP & EVENT HANDLERS ====================

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db()
    seed_demo_data()

@app.exception_handler(404)
async def custom_404_handler(request, exc):
    """Custom 404 page"""
    return templates.TemplateResponse("404.html", {"request": request}, status_code=404)

@app.get("/offline")
async def offline_page(request):
    """Offline page when internet connection is lost"""
    return templates.TemplateResponse("offline.html", {"request": request})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8200, reload=True)

