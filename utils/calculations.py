"""Calculation and analysis helper functions"""
from datetime import datetime
from sqlalchemy.orm import Session
import hashlib
import random
from models import Expense, User


def build_db_context(db: Session, user_id: int) -> dict:
    """Build financial context from database for AI"""
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)
    
    expenses = db.query(Expense).filter(
        Expense.user_id == user_id,
        Expense.date >= month_start
    ).all()
    
    total_spending = sum(exp.amount for exp in expenses)
    
    # Category breakdown
    category_breakdown = {}
    for exp in expenses:
        if exp.category not in category_breakdown:
            category_breakdown[exp.category] = 0
        category_breakdown[exp.category] += exp.amount
    
    # Sort categories by amount
    category_breakdown = dict(sorted(category_breakdown.items(), key=lambda x: x[1], reverse=True))
    
    # Subscription count
    subscription_count = db.query(Expense).filter(
        Expense.user_id == user_id,
        Expense.is_subscription == True
    ).count()
    
    # Recent expenses (last 5)
    recent_expenses = db.query(Expense).filter(
        Expense.user_id == user_id
    ).order_by(Expense.date.desc()).limit(5).all()
    
    recent_exp_list = [
        {"merchant": exp.merchant, "amount": exp.amount, "category": exp.category}
        for exp in recent_expenses
    ]
    
    # Largest expense this month
    largest_expense = db.query(Expense).filter(
        Expense.user_id == user_id,
        Expense.date >= month_start
    ).order_by(Expense.amount.desc()).first()
    
    largest_exp_dict = None
    if largest_expense:
        largest_exp_dict = {
            "merchant": largest_expense.merchant,
            "amount": largest_expense.amount,
            "category": largest_expense.category
        }
    
    # Get user budget
    user = db.query(User).filter(User.id == user_id).first()
    
    return {
        "total_spending": total_spending,
        "budget": user.monthly_budget if user else 2000.0,
        "category_breakdown": category_breakdown,
        "subscription_count": subscription_count,
        "recent_expenses": recent_exp_list,
        "largest_expense": largest_exp_dict
    }


def pseudo_coords_for_merchant(merchant: str) -> tuple:
    """Generate stable pseudo-random Baku coordinates for a merchant"""
    seed = int(hashlib.sha256(merchant.encode("utf-8")).hexdigest(), 16)
    # Baku bounding box: lat 40.35 - 40.45, lon 49.80 - 49.95
    lat = 40.35 + (seed % 1000) / 10000.0
    lon = 49.80 + (seed // 1000 % 1500) / 10000.0
    return (round(lat, 5), round(lon, 5))


def calculate_eco_score(expenses):
    """Calculate total CO2 impact from expenses"""
    total_co2 = 0
    for exp in expenses:
        category = exp.category.lower()
        amount = exp.amount
        
        # CO2 estimation (kg per AZN spent)
        if 'nəqliyyat' in category or 'transport' in category:
            total_co2 += amount * 0.5  # High impact
        elif 'market' in category or 'restoran' in category or 'kafe' in category:
            total_co2 += amount * 0.2  # Medium impact
        else:
            total_co2 += amount * 0.05  # Low impact
    
    # Determine icon based on total
    if total_co2 > 100:
        icon = "🍂"  # Red leaf
    elif total_co2 > 50:
        icon = "🌿"  # Yellow/green leaf
    else:
        icon = "🌱"  # Green leaf
    
    return {
        "value": round(total_co2, 1),
        "icon": icon
    }


def calculate_eco_breakdown(category_data):
    """Calculate CO2 breakdown by category"""
    breakdown = {}
    
    for category, amount in category_data.items():
        cat_lower = category.lower()
        
        if 'nəqliyyat' in cat_lower or 'transport' in cat_lower:
            co2 = amount * 0.5
            icon = "🚗"
            level = "Yüksək təsir"
        elif 'market' in cat_lower or 'restoran' in cat_lower or 'kafe' in cat_lower:
            co2 = amount * 0.2
            icon = "🍔"
            level = "Orta təsir"
        else:
            co2 = amount * 0.05
            icon = "💻"
            level = "Aşağı təsir"
        
        breakdown[category] = {
            "co2": round(co2, 1),
            "icon": icon,
            "level": level
        }
    
    # Sort by CO2 impact
    breakdown = dict(sorted(breakdown.items(), key=lambda x: x[1]['co2'], reverse=True)[:5])
    return breakdown


def get_eco_tip(eco_breakdown):
    """Generate AI eco tip based on spending"""
    tips = [
        "Piyada getməklə 10kg CO₂ qənaət etdiniz! 🚶",
        "Ev yeməyi hazırlamaqla planetə kömək edirsiniz! 🌍",
        "Digital xidmətlər daha az karbon izi buraxır! 💚",
        "İctimai nəqliyyatdan istifadə edin - daha ekolojikdir! 🚌",
        "Yerli məhsullar almaqla daşınma emissiyalarını azaldın! 🥬"
    ]
    return random.choice(tips)


def detect_financial_personality(user_id: int, db: Session) -> dict:
    """Detect user's financial personality based on spending habits"""
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)
    
    expenses = db.query(Expense).filter(
        Expense.user_id == user_id,
        Expense.date >= month_start
    ).all()
    
    if not expenses:
        return {
            "title": "The Beginner",
            "emoji": "🌱",
            "quote": "Hər böyük səyahət bir addımla başlayır",
            "top_category": "Yeni",
            "spending_score": 5
        }
    
    # Calculate category totals
    category_totals = {}
    total_spending = 0
    for exp in expenses:
        total_spending += exp.amount
        if exp.category not in category_totals:
            category_totals[exp.category] = 0
        category_totals[exp.category] += exp.amount
    
    # Find top category
    top_category = max(category_totals, key=category_totals.get) if category_totals else "Digər"
    top_amount = category_totals.get(top_category, 0)
    top_percentage = (top_amount / total_spending * 100) if total_spending > 0 else 0
    
    # Get user budget
    user = db.query(User).filter(User.id == user_id).first()
    savings_percentage = ((user.monthly_budget - total_spending) / user.monthly_budget * 100) if user.monthly_budget > 0 else 0
    
    # Determine personality
    if savings_percentage > 30:
        return {
            "title": "The Monk",
            "emoji": "🧘",
            "quote": "Maliyyə Zen ustadı",
            "top_category": top_category,
            "spending_score": 9
        }
    elif 'Restoran' in top_category or 'Kafe' in top_category or 'Market' in top_category:
        return {
            "title": "The Foodie",
            "emoji": "🍔",
            "quote": "Dad hər şeydir səninçün",
            "top_category": top_category,
            "spending_score": 7
        }
    elif 'Nəqliyyat' in top_category or 'Transport' in top_category:
        return {
            "title": "The Explorer",
            "emoji": "✈️",
            "quote": "Həmişə hərəkətdəsən",
            "top_category": top_category,
            "spending_score": 6
        }
    elif top_percentage > 40:
        return {
            "title": "The Specialist",
            "emoji": "🎯",
            "quote": "Fokuslanmış və məqsədyönlü",
            "top_category": top_category,
            "spending_score": 8
        }
    else:
        return {
            "title": "The Balanced Pro",
            "emoji": "⚖️",
            "quote": "Tarazlıq sənin gücündür",
            "top_category": top_category,
            "spending_score": 8
        }

