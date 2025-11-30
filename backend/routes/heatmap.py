"""Heatmap routes"""
from fastapi import Request, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db
from models import Expense
from config import app
from utils.auth import get_current_user
from utils.calculations import pseudo_coords_for_merchant

@app.get("/heatmap")
async def heatmap_page(request: Request, db: Session = Depends(get_db)):
    """Heatmap page - Redirects to React frontend"""
    return JSONResponse({
        "message": "Please use the React frontend",
        "api_endpoint": "/api/heatmap"
    })

@app.get("/api/heatmap")
async def get_heatmap_data(request: Request, db: Session = Depends(get_db)):
    """Get heatmap data - JSON for React frontend"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    expenses = db.query(Expense).filter(Expense.user_id == user.id).all()
    points = []
    for exp in expenses:
        lat, lon = pseudo_coords_for_merchant(exp.merchant)
        points.append({
            "merchant": exp.merchant,
            "amount": float(exp.amount),
            "category": exp.category,
            "lat": lat,
            "lon": lon
        })
    
    # Calculate stats
    total_amount = sum(p["amount"] for p in points)
    categories = list(set(p["category"] for p in points))
    average = total_amount / len(points) if points else 0
    
    return JSONResponse({
            "points": points,
            "stats": {
                "total_amount": total_amount,
                "total_points": len(points),
                "total_categories": len(categories),
                "average": average
            }
    })


@app.get("/api/ghost-subscriptions")
async def ghost_subscriptions(request: Request, db: Session = Depends(get_db)):
    """Detect potential hidden subscriptions"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)
    expenses = db.query(Expense).filter(Expense.user_id == user.id, Expense.date >= month_start).all()

    by_merchant = {}
    for exp in expenses:
        key = (exp.merchant, round(exp.amount, 2))
        by_merchant.setdefault(key, []).append(exp)

    suspects = []
    for (merchant, amount), exps in by_merchant.items():
        if len(exps) >= 2 or any(e.is_subscription for e in exps):
            suspects.append({
                "merchant": merchant,
                "amount": amount,
                "count": len(exps),
                "category": exps[0].category,
                "latest": max(e.date for e in exps).strftime("%d.%m.%Y")
            })

    return JSONResponse({"suspects": suspects})


