"""Route handlers"""
from fastapi import Request, Depends, Form, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse, Response, RedirectResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, date as date_type, timezone
import math
from config import app
from database import get_db
from models import User, Expense, XPLog, Income
from utils.auth import get_current_user
from utils.calculations import (
    calculate_eco_score, calculate_eco_breakdown, get_eco_tip,
    detect_financial_personality, pseudo_coords_for_merchant, build_db_context
)
from ai_service import ai_service
from gamification import gamification
from forecast_service import forecast_service
from voice_service import voice_service
from pdf_generator import pdf_generator
from local_gems import find_local_gems, format_gem_suggestion

@app.get("/profile")
async def profile_page(request: Request, db: Session = Depends(get_db)):
    """User profile page"""
    user = get_current_user(request, db)
    if not user:
        return RedirectResponse(url="/login", status_code=303)
    
    # Calculate stats
    total_expenses = db.query(Expense).filter(Expense.user_id == user.id).count()
    total_spent_all_time = db.query(func.sum(Expense.amount)).filter(
        Expense.user_id == user.id
    ).scalar() or 0
    total_spent_display = total_spent_all_time
    
    subscriptions = db.query(Expense).filter(
        Expense.user_id == user.id,
        Expense.is_subscription == True
    ).all()
    
    # Get gamification info
    level_info = gamification.get_level_info(user.xp_points)
    next_level = gamification.get_next_level_info(user.xp_points)
    
    # Get XP Logs
    xp_logs = db.query(XPLog).filter(XPLog.user_id == user.id).order_by(XPLog.created_at.desc()).limit(20).all()
    
    # Calculate breakdown
    xp_breakdown = db.query(
        XPLog.action_type, 
        func.sum(XPLog.amount)
    ).filter(
        XPLog.user_id == user.id
    ).group_by(
        XPLog.action_type
    ).all()
    
    xp_breakdown_dict = {action: amount for action, amount in xp_breakdown}

    # React frontend handles routing, so just redirect to login if not authenticated
    # The profile data is available via /api/profile-data endpoint
    return RedirectResponse(url="/login", status_code=303)


@app.get("/api/profile-data")
async def get_profile_data(request: Request, db: Session = Depends(get_db)):
    """API endpoint for profile data - React frontend üçün"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Calculate stats
    total_expenses = db.query(Expense).filter(Expense.user_id == user.id).count()
    total_spent_all_time = db.query(func.sum(Expense.amount)).filter(
        Expense.user_id == user.id
    ).scalar() or 0
    total_spent_display = total_spent_all_time
    
    subscriptions = db.query(Expense).filter(
        Expense.user_id == user.id,
        Expense.is_subscription == True
    ).all()
    
    # Get gamification info
    level_info = gamification.get_level_info(user.xp_points)
    next_level = gamification.get_next_level_info(user.xp_points)
    
    # Get XP Logs
    xp_logs = db.query(XPLog).filter(XPLog.user_id == user.id).order_by(XPLog.created_at.desc()).limit(20).all()
    
    # Calculate breakdown
    xp_breakdown = db.query(
        XPLog.action_type, 
        func.sum(XPLog.amount)
    ).filter(
        XPLog.user_id == user.id
    ).group_by(
        XPLog.action_type
    ).all()
    
    # Sanitize float values helper
    def sanitize_float(value):
        """Convert inf/nan to 0.0, ensure value is float"""
        if value is None:
            return 0.0
        try:
            val = float(value)
            if math.isinf(val) or math.isnan(val):
                return 0.0
            return val
        except (ValueError, TypeError):
            return 0.0
    
    xp_breakdown_dict = {action: sanitize_float(amount) for action, amount in xp_breakdown}
    
    # Financial personality detection
    personality = detect_financial_personality(user.id, db)
    
    # Serialize subscriptions
    subscriptions_list = [
        {
            "id": sub.id,
            "merchant": sub.merchant,
            "category": sub.category,
            "amount": sanitize_float(sub.amount),
            "date": sub.date.isoformat() if sub.date else None
        }
        for sub in subscriptions
    ]
    
    # Serialize XP logs
    xp_logs_list = [
        {
            "id": log.id,
            "action_type": log.action_type,
            "amount": int(log.amount) if log.amount else 0,
            "created_at": log.created_at.isoformat() if log.created_at else None
        }
        for log in xp_logs
    ]
    
    # Sanitize progress_percentage
    progress_pct = level_info.get("progress_percentage", 0)
    if isinstance(progress_pct, float):
        if math.isinf(progress_pct) or math.isnan(progress_pct):
            progress_pct = 0.0
        else:
            progress_pct = max(0.0, min(100.0, progress_pct))  # Clamp between 0-100
    else:
        progress_pct = sanitize_float(progress_pct)
    
    return JSONResponse({
        "user": {
            "id": user.id,
            "username": user.username,
            "xp_points": user.xp_points or 0,
            "currency": user.currency or "AZN",
            "monthly_budget": sanitize_float(user.monthly_budget) if user.monthly_budget else 0.0
        },
        "total_expenses": total_expenses,
        "total_spent_all_time": sanitize_float(total_spent_display),
        "subscriptions": subscriptions_list,
        "level_info": {
            "title": level_info.get("title"),
            "emoji": level_info.get("emoji"),
            "progress_percentage": progress_pct,
            "current_level": level_info.get("current_level"),
            "min_xp": sanitize_float(level_info.get("min_xp")) if level_info.get("min_xp") else 0,
            "max_xp": sanitize_float(level_info.get("max_xp")) if level_info.get("max_xp") else 0
        },
        "next_level": {
            "next_level_title": next_level.get("next_level_title"),
            "next_level_emoji": next_level.get("next_level_emoji"),
            "xp_needed": int(sanitize_float(next_level.get("xp_needed", 0))) if next_level.get("xp_needed") else 0
        },
        "xp_logs": xp_logs_list,
        "xp_breakdown": xp_breakdown_dict,
        "personality": personality
    })


@app.get("/api/dashboard-data")
async def get_dashboard_data(request: Request, db: Session = Depends(get_db)):
    """API endpoint for dashboard data - React frontend üçün"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Sanitize all float values to prevent inf/nan JSON serialization errors
    def sanitize_float(value):
        """Convert inf/nan to 0.0, ensure value is float"""
        if value is None:
            return 0.0
        try:
            val = float(value)
            if math.isinf(val) or math.isnan(val):
                return 0.0
            return val
        except (ValueError, TypeError):
            return 0.0
    
    # Get current month's expenses
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)
    
    expenses = db.query(Expense).filter(
        Expense.user_id == user.id,
        Expense.date >= month_start
    ).all()
    
    # Get current month's incomes
    incomes = db.query(Income).filter(
        Income.user_id == user.id,
        Income.date >= month_start
    ).all()
    
    # Calculate stats (all amounts are stored in AZN)
    total_spending_azn = sum(exp.amount for exp in expenses)
    total_income_azn = sum(inc.amount for inc in incomes)
    total_available_azn = user.monthly_budget + total_income_azn - total_spending_azn
    effective_budget_azn = user.monthly_budget + total_income_azn
    
    # All amounts in AZN (only AZN supported)
    total_spending = total_spending_azn
    total_income = total_income_azn
    monthly_budget_display = effective_budget_azn
    remaining_budget = effective_budget_azn - total_spending_azn
    
    # Category breakdown
    category_data = {}
    for exp in expenses:
        if exp.category not in category_data:
            category_data[exp.category] = 0
        category_data[exp.category] += exp.amount
    
    # Chart data
    chart_labels = list(category_data.keys())
    chart_values = list(category_data.values())
    
    # Top category
    top_category = None
    if category_data:
        top_category_name = max(category_data, key=category_data.get)
        top_category = {
            "name": top_category_name,
            "total": category_data[top_category_name]
        }
    
    # Recent expenses (last 10) - includes both expenses and incomes
    recent_expenses = db.query(Expense).filter(
        Expense.user_id == user.id
    ).order_by(Expense.created_at.desc()).limit(10).all()
    
    # Recent incomes (last 10) - to show in recent activity
    # Sort by created_at first, then by date if created_at is None
    recent_incomes = db.query(Income).filter(
        Income.user_id == user.id
    ).order_by(Income.created_at.desc(), Income.date.desc()).limit(10).all()
    
    # Last week total
    week_ago = now - timedelta(days=7)
    last_week_expenses = db.query(Expense).filter(
        Expense.user_id == user.id,
        Expense.date >= week_ago
    ).all()
    last_week_total = sum(exp.amount for exp in last_week_expenses)
    
    # Subscriptions total
    subscriptions = db.query(Expense).filter(
        Expense.user_id == user.id,
        Expense.is_subscription == True,
        Expense.date >= month_start
    ).all()
    subscriptions_total = sum(sub.amount for sub in subscriptions)
    
    # Format recent expenses and incomes together
    recents = []
    
    # Add expenses
    for exp in recent_expenses:
        category_name = exp.category or "General"
        # Parse items from JSON if exists
        items_list = []
        if exp.items:
            try:
                if isinstance(exp.items, str):
                    import json
                    items_list = json.loads(exp.items)
                elif isinstance(exp.items, list):
                    items_list = exp.items
            except:
                items_list = []
        
        # Use created_at for sorting if available, otherwise use date
        sort_date = exp.created_at if exp.created_at else (exp.date if exp.date else datetime.utcnow())
        recents.append({
            "id": exp.id,
            "merchant": exp.merchant,
            "amount": sanitize_float(exp.amount),
            "date": exp.date.isoformat() if exp.date else None,
            "created_at": sort_date.isoformat() if hasattr(sort_date, 'isoformat') else sort_date,
            "category": category_name,
            "category_name": category_name,
            "is_subscription": exp.is_subscription or False,
            "items": items_list,
            "notes": exp.notes,
            "type": "expense"  # Mark as expense
        })
    
    # Add incomes as recent activity
    for inc in recent_incomes:
        # Use created_at for sorting if available, otherwise use date
        sort_date = inc.created_at if inc.created_at else (inc.date if inc.date else datetime.utcnow())
        recents.append({
            "id": f"income_{inc.id}",
            "merchant": inc.source,
            "amount": sanitize_float(inc.amount),
            "date": inc.date.isoformat() if inc.date else None,
            "created_at": sort_date.isoformat() if hasattr(sort_date, 'isoformat') else sort_date,
            "category": "Gəlir",
            "category_name": "Gəlir",
            "is_subscription": False,
            "items": [],
            "notes": inc.description,  # Income description
            "type": "income",  # Mark as income
            "description": inc.description  # Include description
        })
    
    # Sort by created_at first (most recent first), then by date
    # Convert to datetime objects for proper sorting
    def get_sort_key(item):
        created_at = item.get("created_at")
        date = item.get("date")
        
        # Try to parse created_at first
        if created_at:
            try:
                if isinstance(created_at, str):
                    return datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                return created_at
            except:
                pass
        
        # Fallback to date
        if date:
            try:
                if isinstance(date, str):
                    return datetime.fromisoformat(date.replace('Z', '+00:00'))
                return date
            except:
                pass
        
        # Fallback to current time (shouldn't happen)
        return datetime.utcnow()
    
    recents.sort(key=get_sort_key, reverse=True)
    # Limit to 10 most recent
    recents = recents[:10]
    
    # Calculate eco score
    eco_score = calculate_eco_score(expenses)
    eco_breakdown = calculate_eco_breakdown(category_data)
    eco_tip = get_eco_tip(eco_breakdown)
    
    # Get level info
    level_info = gamification.get_level_info(user.xp_points)
    
    # Calculate salary increase (compare to previous month)
    salary_increase_info = None
    current_month_salary = None
    current_salary_incomes = [inc for inc in incomes if inc.source.lower() in ["maaş", "salary", "maas"]]
    if current_salary_incomes:
        current_month_salary = sum(inc.amount for inc in current_salary_incomes)
        prev_month = month_start - timedelta(days=1)
        prev_month_start = datetime(prev_month.year, prev_month.month, 1)
        prev_month_end = month_start
        prev_salary_incomes = db.query(Income).filter(
            Income.user_id == user.id,
            Income.date >= prev_month_start,
            Income.date < prev_month_end
        ).all()
        prev_salary_list = [inc for inc in prev_salary_incomes if inc.source.lower() in ["maaş", "salary", "maas"]]
        if prev_salary_list:
            prev_month_salary = sum(inc.amount for inc in prev_salary_list)
            if prev_month_salary > 0 and current_month_salary > prev_month_salary:
                increase_amount = current_month_salary - prev_month_salary
                increase_percentage = (increase_amount / prev_month_salary) * 100
                salary_increase_info = {
                    "amount": increase_amount,
                    "percentage": increase_percentage,
                    "current": current_month_salary,
                    "previous": prev_month_salary
                }
    
    # Check daily budget limit
    daily_limit_alert = None
    if user.daily_budget_limit:
        today = date_type.today()
        today_expenses = db.query(Expense).filter(
            Expense.user_id == user.id,
            Expense.date >= today,
            Expense.date < today + timedelta(days=1)
        ).all()
        today_total = sum(exp.amount for exp in today_expenses)
        today_total_rounded = round(today_total, 2)
        limit_rounded = round(user.daily_budget_limit, 2)
        if today_total_rounded > limit_rounded:
            daily_limit_alert = {
                "exceeded": True,
                "today_spending": today_total,
                "limit": user.daily_budget_limit,
                "over_by": today_total - user.daily_budget_limit
            }
        elif today_total >= user.daily_budget_limit * 0.9:
            daily_limit_alert = {
                "exceeded": False,
                "warning": True,
                "today_spending": today_total,
                "limit": user.daily_budget_limit,
                "remaining": user.daily_budget_limit - today_total
            }
    
    # Local gems
    from local_gems import find_local_gems
    local_gems_suggestions = []
    expensive_merchants = ["Starbucks", "McDonald's", "KFC", "Papa John's", "Kino", "Cinema"]
    for expense in recent_expenses[:5]:
        merchant = expense.merchant
        amount = expense.amount
        is_expensive = any(exp_merchant.lower() in merchant.lower() for exp_merchant in expensive_merchants)
        avg_amount = sanitize_float(total_spending_azn / len(expenses) if expenses else 0)
        is_above_avg = amount > avg_amount * 1.5 if avg_amount > 0 else False
        if is_expensive or is_above_avg:
            alternatives = find_local_gems(merchant, amount, expense.category)
            if alternatives:
                local_gems_suggestions.append({
                    "merchant": merchant,
                    "amount": sanitize_float(amount),
                    "category": expense.category,
                    "alternatives": alternatives[:2]
                })
    local_gems_suggestions = local_gems_suggestions[:3]
    
    # Sanitize all float values to prevent inf/nan JSON serialization errors
    def sanitize_float(value):
        """Convert inf/nan to 0.0, ensure value is float"""
        if value is None:
            return 0.0
        try:
            val = float(value)
            if math.isinf(val) or math.isnan(val):
                return 0.0
            return val
        except (ValueError, TypeError):
            return 0.0
    
    # Sanitize progress_percentage
    progress_pct = level_info.get("progress_percentage", 0)
    if isinstance(progress_pct, float):
        if math.isinf(progress_pct) or math.isnan(progress_pct):
            progress_pct = 0.0
        else:
            progress_pct = max(0.0, min(100.0, progress_pct))  # Clamp between 0-100
    else:
        progress_pct = float(progress_pct) if progress_pct else 0.0
    
    # Sanitize salary_increase_info percentage
    if salary_increase_info and "percentage" in salary_increase_info:
        pct = salary_increase_info["percentage"]
        if isinstance(pct, float) and (math.isinf(pct) or math.isnan(pct)):
            salary_increase_info["percentage"] = 0.0
        else:
            salary_increase_info["percentage"] = sanitize_float(pct)
        # Also sanitize other float fields in salary_increase_info
        for key in ["amount", "current", "previous"]:
            if key in salary_increase_info:
                salary_increase_info[key] = sanitize_float(salary_increase_info[key])
    
    # Sanitize category_data
    sanitized_category_data = {}
    for k, v in category_data.items():
        sanitized_category_data[k] = sanitize_float(v)
    
    # Sanitize chart_values
    sanitized_chart_values = [sanitize_float(v) for v in chart_values]
    
    # Sanitize top_category total
    if top_category and "total" in top_category:
        top_category["total"] = sanitize_float(top_category["total"])
    
    # Sanitize daily_limit_alert values
    if daily_limit_alert:
        for key in ["today_spending", "limit", "over_by", "remaining"]:
            if key in daily_limit_alert:
                daily_limit_alert[key] = sanitize_float(daily_limit_alert[key])
    
    # Sanitize eco_breakdown (it's a dict with nested dicts containing co2, icon, level)
    sanitized_eco_breakdown = {}
    if eco_breakdown:
        for category, impact_data in eco_breakdown.items():
            if isinstance(impact_data, dict):
                sanitized_eco_breakdown[category] = {
                    "co2": sanitize_float(impact_data.get("co2", 0)),
                    "icon": impact_data.get("icon", "💻"),
                    "level": impact_data.get("level", "Aşağı təsir")
                }
            else:
                # Fallback: if it's just a number, convert to dict format
                sanitized_eco_breakdown[category] = {
                    "co2": sanitize_float(impact_data),
                    "icon": "💻",
                    "level": "Aşağı təsir"
                }
    
    return JSONResponse({
        "context": {
            "total_spend": sanitize_float(total_spending),
            "budget": sanitize_float(monthly_budget_display),
            "currency": "AZN",
            "last_week_total": sanitize_float(last_week_total),
            "subscriptions": sanitize_float(subscriptions_total),
            "categories": list(sanitized_category_data.keys()),
            "category_data": sanitized_category_data,
            "remaining_budget": sanitize_float(remaining_budget),
            "total_available": sanitize_float(total_available_azn),
            "eco_score": {
                "value": sanitize_float(eco_score.get("value", 0)) if isinstance(eco_score, dict) else sanitize_float(eco_score) if eco_score else 0.0,
                "icon": eco_score.get("icon", "🌍") if isinstance(eco_score, dict) else "🌍"
            },
            "eco_breakdown": sanitized_eco_breakdown if sanitized_eco_breakdown else eco_breakdown,
            "eco_tip": eco_tip,
            "level_info": {
                "title": level_info.get("title"),
                "emoji": level_info.get("emoji"),
                "progress_percentage": progress_pct,
                "level": level_info.get("current_level"),
                "max_xp": sanitize_float(level_info.get("max_xp")) if level_info.get("max_xp") else 0
            },
            "xp_points": user.xp_points or 0,
            "salary_increase_info": salary_increase_info,
            "daily_limit_alert": daily_limit_alert,
            "local_gems": local_gems_suggestions
        },
        "recents": recents,
        "chart_labels": chart_labels,
        "chart_values": sanitized_chart_values,
        "top_category": top_category
    })


@app.get("/api/dashboard-stats")
async def get_dashboard_stats(request: Request, db: Session = Depends(get_db)):
    """Get dashboard stats for auto-update"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Get current month's expenses
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)
    
    expenses = db.query(Expense).filter(
        Expense.user_id == user.id,
        Expense.date >= month_start
    ).all()
    
    # Get current month's incomes
    incomes = db.query(Income).filter(
        Income.user_id == user.id,
        Income.date >= month_start
    ).all()
    
    # Debug logging for income calculation
    print(f"\n📊 Dashboard Stats Debug - User: {user.id} ({user.username})")
    print(f"   Current time (UTC): {now}")
    print(f"   Month start: {month_start}")
    print(f"   Found {len(incomes)} income(s) this month")
    for inc in incomes:
        print(f"     - {inc.source}: {inc.amount} AZN on {inc.date}")
    
    # Calculate stats (all amounts are stored in AZN)
    total_spending_azn = sum(exp.amount for exp in expenses)
    total_income_azn = sum(inc.amount for inc in incomes)
    
    print(f"   Total income (AZN): {total_income_azn}")
    print(f"   Total spending (AZN): {total_spending_azn}")
    total_available_azn = user.monthly_budget + total_income_azn - total_spending_azn
    effective_budget_azn = user.monthly_budget + total_income_azn  # Base budget + Extra income
    
    # All amounts in AZN (only AZN supported)
    total_spending = total_spending_azn
    total_income = total_income_azn
    monthly_income_display = user.monthly_income or 0 if user.monthly_income else 0
    monthly_budget_display = effective_budget_azn  # Show effective budget
    remaining_budget = effective_budget_azn - total_spending_azn
    total_available = total_available_azn
    
    # Budget percentage (use AZN values for calculation to maintain accuracy)
    # Use effective budget as the denominator
    budget_percentage = (total_spending_azn / effective_budget_azn * 100) if effective_budget_azn > 0 else 0
    
    # Recalculate eco_score for the partial
    eco_score = calculate_eco_score(expenses)
    
    # Sanitize all float values
    def sanitize_float(value):
        """Convert inf/nan to 0.0, ensure value is float"""
        if value is None:
            return 0.0
        try:
            val = float(value)
            if math.isinf(val) or math.isnan(val):
                return 0.0
            return val
        except (ValueError, TypeError):
            return 0.0
    
    # Return JSON for React frontend
    return JSONResponse({
        "total_spending": sanitize_float(total_spending),
        "total_income": sanitize_float(total_income),
        "monthly_income_display": sanitize_float(monthly_income_display),
        "monthly_budget_display": sanitize_float(monthly_budget_display),
        "remaining_budget": sanitize_float(remaining_budget),
        "total_available": sanitize_float(total_available),
        "budget_percentage": sanitize_float(budget_percentage),
        "eco_score": sanitize_float(eco_score) if eco_score else 0.0,
        "currency": "AZN"
    })


