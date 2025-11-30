"""Dashboard routes"""
from fastapi import Request, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from database import get_db
from models import  Expense
from config import app
from utils.auth import get_current_user
from datetime import datetime
from math import isinf, isnan

@app.get("/")
async def dashboard(request: Request, db: Session = Depends(get_db)):
    """Main dashboard page - Redirects to React frontend"""
    # React frontend handles routing, so just return a simple response
    return JSONResponse({
        "message": "Please use the React frontend",
        "api_endpoint": "/api/dashboard-data"
    })



def clean_floats(obj):
    """Convert inf / -inf / NaN to safe JSON values"""
    if isinstance(obj, dict):
        return {k: clean_floats(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [clean_floats(v) for v in obj]
    if isinstance(obj, float):
        if isinf(obj) or isnan(obj):
            return 0
    return obj


@app.get("/api/dashboard-updates")
async def get_dashboard_updates(request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")

    now = datetime.now()
    start_of_month = datetime(now.year, now.month, 1)

    expenses = (
        db.query(Expense)
        .filter(Expense.user_id == user.id, Expense.date >= start_of_month)
        .all()
    )

    total_spending = float(sum(e.amount for e in expenses))

    monthly_budget = float(user.monthly_budget or 0)

    # Safe remaining budget
    remaining_budget = monthly_budget - total_spending

    # Safe budget percentage (avoid division by zero)
    if monthly_budget > 0:
        budget_percentage = (total_spending / monthly_budget) * 100
    else:
        budget_percentage = 0

    # Category totals
    category_data = {}
    for exp in expenses:
        category_data[exp.category] = category_data.get(exp.category, 0) + float(exp.amount)

    # Recent expense list
    recent_expenses = (
        db.query(Expense)
        .filter(Expense.user_id == user.id)
        .order_by(Expense.created_at.desc())
        .limit(10)
        .all()
    )

    recent_expenses_list = [
        {
            "id": exp.id,
            "merchant": exp.merchant,
            "amount": float(exp.amount),
            "category": exp.category,
            "date": exp.date.isoformat() if exp.date else None,
            "created_at": exp.created_at.isoformat() if exp.created_at else None,
        }
        for exp in recent_expenses
    ]

    response = {
        "total_spending": total_spending,
        "monthly_budget_display": monthly_budget,
        "remaining_budget": remaining_budget,
        "budget_percentage": budget_percentage,
        "category_data": category_data,
        "recent_expenses": recent_expenses_list,
        "currency": "₼",
    }

    # REMOVE inf / NaN safely
    response = clean_floats(response)

    return JSONResponse(response)
