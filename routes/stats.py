"""Stats and utility routes"""
from fastapi import Request, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db
from models import Expense
from config import app
from utils.auth import get_current_user
from gamification import gamification


@app.get("/api/stats")
async def get_user_stats(request: Request, db: Session = Depends(get_db)):
    """Return updated user stats - React frontend üçün JSON"""
    user = get_current_user(request, db)
    if not user:
        return JSONResponse({"user": None})
    
    # Get user stats
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)
    
    expenses = db.query(Expense).filter(
        Expense.user_id == user.id,
        Expense.date >= month_start
    ).all()
    
    total_spent = sum(exp.amount for exp in expenses)
    total_transactions = len(expenses)
    
    return JSONResponse({
        "user": {
            "id": user.id,
            "username": user.username,
            "xp": user.xp_points or 0,
            "total_spent": total_spent,
            "total_transactions": total_transactions,
            "currency": user.currency or "AZN",
            "is_premium": user.is_premium or False,
            "monthly_budget": user.monthly_budget,
            "login_streak": user.login_streak or 0,
            "level_title": gamification.get_level_info(user.xp_points or 0).get("title", "")
        }
    })

