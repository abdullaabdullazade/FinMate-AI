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
    
    # Maaşın yarısını ayın ilk 10 günündə xərcləmə xəbərdarlığı
    if user.monthly_income and user.monthly_income > 0:
        current_day = now.day
        salary_half = user.monthly_income / 2
        
        # Ayın ilk 10 günündə maaşın yarısını xərcləyibsə
        if current_day <= 10 and total_spending >= salary_half:
            remaining_days = 30 - current_day
            daily_allowance = (user.monthly_income - total_spending) / remaining_days if remaining_days > 0 else 0
            notifications.append({
                "icon": "🚨",
                "color": "red-500",
                "message": f"Diqqət! Ayın ilk 10 günündə maaşının yarısını ({total_spending:.0f} AZN) xərcləmisən. Qənaət etməsən ac qalacaqsan! Gündəlik limit: {daily_allowance:.0f} AZN"
            })
        # Ayın ilk 10 günündə maaşın 40%-ni xərcləyibsə
        elif current_day <= 10 and total_spending >= user.monthly_income * 0.4:
            notifications.append({
                "icon": "⚠️",
                "color": "amber-500",
                "message": f"Diqqət! Ayın ilk 10 günündə maaşının 40%-ni ({total_spending:.0f} AZN) xərcləmisən. Qənaət etməyə başla!"
            })
    
    # Ayın ilk yarısında maaşın 70%-ni xərcləmə xəbərdarlığı
    if user.monthly_income and user.monthly_income > 0:
        current_day = now.day
        if current_day <= 15 and total_spending >= user.monthly_income * 0.7:
            notifications.append({
                "icon": "🔥",
                "color": "red-500",
                "message": f"Təhlükə! Ayın ilk yarısında maaşının 70%-ni ({total_spending:.0f} AZN) xərcləmisən. Dərhal qənaət etməyə başla!"
            })
    
    # Həftəlik xərcləmə analizi
    week_start = now - timedelta(days=now.weekday())
    week_expenses = db.query(Expense).filter(
        Expense.user_id == user.id,
        Expense.date >= week_start,
        Expense.date <= now
    ).all()
    week_total = sum(exp.amount for exp in week_expenses)
    
    if user.monthly_income and user.monthly_income > 0:
        weekly_budget = user.monthly_income / 4  # Həftəlik büdcə (aylıq maaşın 1/4-i)
        if week_total > weekly_budget * 1.2:  # Həftəlik büdcənin 120%-dən çox
            notifications.append({
                "icon": "📊",
                "color": "amber-500",
                "message": f"Bu həftə həftəlik büdcənizi ({weekly_budget:.0f} AZN) 20% artıq keçmisiniz. Cari: {week_total:.0f} AZN"
            })
    
    # Kategoriya əsaslı xəbərdarlıqlar - ən çox xərclənən kateqoriya
    if expenses:
        category_totals = {}
        for exp in expenses:
            category = exp.category or exp.category_name or "Digər"
            category_totals[category] = category_totals.get(category, 0) + exp.amount
        
        if category_totals:
            top_category = max(category_totals.items(), key=lambda x: x[1])
            top_category_name, top_category_amount = top_category
            top_category_percentage = (top_category_amount / total_spending * 100) if total_spending > 0 else 0
            
            # Əgər bir kateqoriyaya 50%-dən çox xərcləyibsə
            if top_category_percentage > 50:
                notifications.append({
                    "icon": "🎯",
                    "color": "blue-500",
                    "message": f"'{top_category_name}' kateqoriyasına xərclərinizin {top_category_percentage:.0f}%-ni ({top_category_amount:.0f} AZN) xərcləmisiniz. Diversifikasiya edin!"
                })
    
    # Qənaət təklifləri - əgər xərcləmə normaldırsa
    if user.monthly_income and user.monthly_income > 0:
        savings_potential = user.monthly_income - total_spending
        if savings_potential > user.monthly_income * 0.2 and now.day >= 20:  # Ayın sonuna yaxın və 20%+ qənaət var
            notifications.append({
                "icon": "💰",
                "color": "green-500",
                "message": f"Əla! Bu ay {savings_potential:.0f} AZN qənaət edə bilərsən. Arzu qutusuna əlavə et!"
            })
    
    # Günün sonu xəbərdarlığı - əgər gün ərzində çox xərcləyibsə
    today = date_type.today()
    today_expenses = db.query(Expense).filter(
        Expense.user_id == user.id,
        Expense.date >= today,
        Expense.date < today + timedelta(days=1)
    ).all()
    today_total = sum(exp.amount for exp in today_expenses)
    
    if user.monthly_income and user.monthly_income > 0:
        daily_budget = user.monthly_income / 30  # Gündəlik büdcə
        if today_total > daily_budget * 1.5:  # Gündəlik büdcənin 150%-dən çox
            notifications.append({
                "icon": "🌙",
                "color": "amber-500",
                "message": f"Bu gün gündəlik büdcənizi ({daily_budget:.0f} AZN) 50% artıq keçmisiniz. Sabah daha diqqətli olun!"
            })
    
    # Scan/Coin bildirişləri - silindi, çünki scan edildikdə onsuzda coin bildirişi WebSocket ilə gəlir
    # Random təkliflər - silindi, çünki scan edildikdə atılmamalıdır
    
    # Positive message if no critical notifications
    critical_notifications = [n for n in notifications if n.get("color") in ["red-500", "amber-500"]]
    if not critical_notifications:
        notifications.append({
            "icon": "✅",
            "color": "green-500",
            "message": "Maliyyə vəziyyətiniz yaxşıdır!"
        })
    
    return JSONResponse({"notifications": notifications})


