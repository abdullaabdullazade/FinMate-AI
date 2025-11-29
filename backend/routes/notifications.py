"""Notification routes"""
from fastapi import Request, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, date as date_type
from database import get_db
from models import User, Expense
from config import app
from utils.auth import get_current_user

@app.get("/api/notifications")
async def get_notifications(request: Request, db: Session = Depends(get_db)):
    """Generate dynamic notifications based on user data"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    notifications = []
    
    # Get current month's data
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)
    expenses = db.query(Expense).filter(
        Expense.user_id == user.id,
        Expense.date >= month_start
    ).all()
    
    total_spending = sum(exp.amount for exp in expenses)
    budget_percentage = (total_spending / user.monthly_budget * 100) if user.monthly_budget > 0 else 0
    
    # Budget warning
    if budget_percentage >= 100:
        notifications.append({
            "icon": "⚠️",
            "color": "red-500",
            "message": f"Büdcə limiti keçildi! {budget_percentage:.0f}% istifadə edilib."
        })
    elif budget_percentage >= 80:
        notifications.append({
            "icon": "⚡",
            "color": "amber-500",
            "message": f"Diqqət: Büdcənin {budget_percentage:.0f}%-ni istifadə etmisən."
        })
    
    # Daily budget limit check
    if user.daily_budget_limit:
        today = date_type.today()
        today_expenses = db.query(Expense).filter(
            Expense.user_id == user.id,
            Expense.date >= today,
            Expense.date < today + timedelta(days=1)
        ).all()
        today_total = sum(exp.amount for exp in today_expenses)
        
        if today_total > user.daily_budget_limit:
            notifications.append({
                "icon": "🚨",
                "color": "red-500",
                "message": f"Gündəlik limit keçildi! Bu gün {today_total:.2f} AZN xərclədiniz (Limit: {user.daily_budget_limit:.2f} AZN)"
            })
        elif today_total >= user.daily_budget_limit * 0.9:
            notifications.append({
                "icon": "⚡",
                "color": "amber-500",
                "message": f"Gündəlik limitə yaxınlaşırsınız! Bu gün {today_total:.2f} AZN xərclədiniz (Limit: {user.daily_budget_limit:.2f} AZN)"
            })
    
    # Subscription reminder
    subscriptions = db.query(Expense).filter(
        Expense.user_id == user.id,
        Expense.is_subscription == True
    ).all()
    
    if subscriptions:
        sub_names = [sub.merchant for sub in subscriptions[:2]]
        if len(sub_names) == 1:
            notifications.append({
                "icon": "🎬",
                "color": "purple-500",
                "message": f"{sub_names[0]} abunəliyinizi yoxlayın."
            })
        elif len(sub_names) > 1:
            notifications.append({
                "icon": "💳",
                "color": "purple-500",
                "message": f"{len(subscriptions)} aktiv abunəliyiniz var."
            })
    
    # Spending trend
    last_month_start = month_start - timedelta(days=month_start.day)
    last_month_end = month_start - timedelta(days=1)
    last_month_expenses = db.query(Expense).filter(
        Expense.user_id == user.id,
        Expense.date >= last_month_start,
        Expense.date <= last_month_end
    ).all()
    
    if last_month_expenses:
        last_month_total = sum(exp.amount for exp in last_month_expenses)
        if last_month_total > 0:
            increase = ((total_spending - last_month_total) / last_month_total) * 100
            if increase > 15:
                notifications.append({
                    "icon": "📈",
                    "color": "blue-500",
                    "message": f"Keçən aya görə {increase:.0f}% çox xərcləyirsən."
                })
            elif increase < -15:
                notifications.append({
                    "icon": "🎉",
                    "color": "green-500",
                    "message": f"Afərin! Keçən aya görə {abs(increase):.0f}% az xərclədin."
                })
    
    # XP achievement notification
    if user.xp_points > 0 and user.xp_points % 100 < 20:
        next_milestone = ((user.xp_points // 100) + 1) * 100
        remaining = next_milestone - user.xp_points
        notifications.append({
            "icon": "⭐",
            "color": "yellow-500",
            "message": f"{next_milestone} XP-yə çatmağa {remaining} XP qalıb!"
        })
    
    # Positive message if no notifications
    if not notifications:
        notifications.append({
            "icon": "✅",
            "color": "green-500",
            "message": "Maliyyə vəziyyətiniz yaxşıdır!"
        })
    
    return JSONResponse({"notifications": notifications})


