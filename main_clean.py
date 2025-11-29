"""Main FastAPI application - Clean and organized structure"""
from dotenv import load_dotenv
from config import app, templates
from database import init_db, seed_demo_data
from fastapi import Request
from fastapi.responses import HTMLResponse

# Load environment variables
load_dotenv()

# Import all route modules (they register routes with app)
from routes import auth, stats

# Note: Other routes will be imported as they are created
# from routes import dashboard, chat, scan, profile, expenses, dreams, settings, rewards, heatmap, notifications, export

# ==================== STARTUP & EVENT HANDLERS ====================

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db()
    seed_demo_data()

@app.exception_handler(404)
async def custom_404_handler(request: Request, exc):
    """Custom 404 page"""
    return templates.TemplateResponse("404.html", {"request": request}, status_code=404)

@app.get("/offline", response_class=HTMLResponse)
async def offline_page(request: Request):
    """Offline page when internet connection is lost"""
    return templates.TemplateResponse("offline.html", {"request": request})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8200, reload=True)

