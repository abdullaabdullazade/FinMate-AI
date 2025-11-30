"""Main FastAPI application - Clean and organized structure"""
from dotenv import load_dotenv
load_dotenv()

from config import app
from database import init_db, seed_demo_data
from fastapi import Request
from fastapi.responses import JSONResponse

# Import all routes to register them with the app
# Routes use @app decorators, so they need to be imported AFTER config.app is created
import routes.stats
import routes.settings
import routes.rewards
import routes.profile
import routes.dashboard
import routes.chat
import routes.scan
import routes.expenses
import routes.dreams
import routes.auth
import routes.heatmap
import routes.notifications
import routes.export


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
