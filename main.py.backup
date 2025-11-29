from fastapi import FastAPI, Request, Depends, UploadFile, File, Form, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse, Response, RedirectResponse
from fastapi.exceptions import RequestValidationError
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta, date as date_type, timezone
from typing import Optional
import os
import base64
import asyncio
from dotenv import load_dotenv
from starlette.middleware.sessions import SessionMiddleware

# Load environment variables
load_dotenv()

from database import get_db, init_db, seed_demo_data, reset_demo_data
from models import User, Expense, ChatMessage, XPLog, Wish, Dream, Income
from ai_service import ai_service
from gamification import gamification
from forecast_service import forecast_service
from voice_service import voice_service
from pdf_generator import pdf_generator
import hashlib

# Only AZN supported - currency conversion removed
CURRENCY_SYMBOLS = {
    "AZN": "₼"
}

# Initialize FastAPI app
app = FastAPI(title="FinMate AI", description="Your Personal CFO Assistant")

# Add CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
        "http://localhost:5173",  # Vite dev server (alternative port)
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add session middleware
app.add_middleware(SessionMiddleware, secret_key="finmate-secret-key-change-in-production")

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

# Templates
templates = Jinja2Templates(directory="templates")
templates.env.globals.update({
    "now": datetime.utcnow,
    "enumerate": enumerate,
    "len": len,
    "float": float,
    "int": int,
    "str": str,
    "min": min,  # Added min function
    "max": max   # Added max function
})

# Create static directory if doesn't exist
os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()
    seed_demo_data()


# Custom 404 handler
@app.exception_handler(404)
async def custom_404_handler(request: Request, exc):
    """Custom 404 page with crying pet"""
    return templates.TemplateResponse("404.html", {
        "request": request
    }, status_code=404)


# Offline page route
@app.get("/offline", response_class=HTMLResponse)
async def offline_page(request: Request):
    """Offline page when internet connection is lost"""
    return templates.TemplateResponse("offline.html", {
        "request": request
    })


# ==================== HELPER FUNCTIONS ====================

def hash_password(password: str) -> str:
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, password_hash: str) -> bool:
    """Verify password against hash"""
    return hash_password(password) == password_hash

def get_current_user(request: Request, db: Session = Depends(get_db)) -> Optional[User]:
    """Get current logged in user from session"""
    user_id = request.session.get("user_id")
    if not user_id:
        return None
    
    db.expire_all()
    user = db.query(User).filter(User.id == user_id).first()
    
    # Clear session if user doesn't exist (prevents redirect loops)
    if not user:
        request.session.clear()
    
    return user

def require_auth(request: Request, db: Session = Depends(get_db)) -> User:
    """Require authentication, redirect to login if not authenticated"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user


def build_db_context(db: Session, user_id: int) -> dict:
    """Build financial context from database for AI"""
    
    # Get current month's expenses
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)
    
    expenses = db.query(Expense).filter(
        Expense.user_id == user_id,
        Expense.date >= month_start
    ).all()
    
    # Calculate totals
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


# Currency conversion removed - only AZN supported




def pseudo_coords_for_merchant(merchant: str) -> tuple:
    """Generate stable pseudo-random Baku coordinates for a merchant"""
    seed = int(hashlib.sha256(merchant.encode("utf-8")).hexdigest(), 16)
    # Baku bounding box approx
    lat = 40.35 + (seed % 1000) / 10000.0  # 40.35 - 40.45
    lon = 49.80 + (seed // 1000 % 1500) / 10000.0  # 49.80 - 49.95
    return (round(lat, 5), round(lon, 5))


def pseudo_coords_for_merchant(merchant: str) -> tuple:
    """Generate pseudo-random but stable Baku coords for a merchant"""
    seed = int(hashlib.sha256(merchant.encode("utf-8")).hexdigest(), 16)
    # Baku rough box: lat 40.35 - 40.45, lon 49.80 - 49.95
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
    import random
    return random.choice(tips)


def detect_financial_personality(user_id: int, db: Session) -> dict:
    """Detect user's financial personality based on spending habits"""
    # Get current month's expenses
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


# ==================== AUTH ROUTES ====================

@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request, db: Session = Depends(get_db)):
    """Login page"""
    # If already logged in and user exists, redirect to dashboard
    user = get_current_user(request, db)
    if user:
        return RedirectResponse(url="/", status_code=303)
    
    # Check if user just registered
    registered = request.query_params.get("registered") == "1"
    
    return templates.TemplateResponse("login.html", {
        "request": request,
        "registered": registered
    })

@app.post("/api/login")
async def login(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    """Handle login - React frontend üçün JSON qaytarır"""
    # Check if client wants JSON response (React frontend)
    accept_header = request.headers.get("Accept", "")
    is_json_request = "application/json" in accept_header or request.headers.get("X-Requested-With") == "XMLHttpRequest"
    
    user = db.query(User).filter(User.username == username).first()
    
    # Check for demo user (password: "demo")
    if username == "demo" and password == "demo":
        # Find or create demo user
        user = db.query(User).filter(User.username == "demo").first()
        if not user:
            user = User(username="demo", monthly_budget=3000.0, password_hash=None)
            db.add(user)
            db.commit()
            db.refresh(user)
        request.session["user_id"] = user.id
        
        if is_json_request:
            return JSONResponse({
                "success": True,
                "message": "Login successful",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "xp_points": user.xp_points or 0,
                    "coins": user.coins or 0,
                    "is_premium": user.is_premium or False
                }
            })
        return RedirectResponse(url="/", status_code=303)
    
    # Check for regular users
    if not user or not user.password_hash:
        if is_json_request:
            return JSONResponse({
                "success": False,
                "error": "İstifadəçi adı və ya şifrə yanlışdır"
            }, status_code=401)
        return templates.TemplateResponse("login.html", {
            "request": request,
            "error": "İstifadəçi adı və ya şifrə yanlışdır"
        })
    
    if not verify_password(password, user.password_hash):
        if is_json_request:
            return JSONResponse({
                "success": False,
                "error": "İstifadəçi adı və ya şifrə yanlışdır"
            }, status_code=401)
        return templates.TemplateResponse("login.html", {
            "request": request,
            "error": "İstifadəçi adı və ya şifrə yanlışdır"
        })
    
    request.session["user_id"] = user.id
    
    if is_json_request:
        return JSONResponse({
            "success": True,
            "message": "Login successful",
            "user": {
                "id": user.id,
                "username": user.username,
                "xp_points": user.xp_points or 0,
                "coins": user.coins or 0,
                "is_premium": user.is_premium or False
            }
        })
    return RedirectResponse(url="/", status_code=303)

@app.get("/signup", response_class=HTMLResponse)
async def signup_page(request: Request, db: Session = Depends(get_db)):
    """Signup page"""
    # If already logged in and user exists, redirect to dashboard
    user = get_current_user(request, db)
    if user:
        return RedirectResponse(url="/", status_code=303)
    return templates.TemplateResponse("signup.html", {"request": request})

@app.post("/api/signup")
async def signup(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    confirm_password: str = Form(...),
    db: Session = Depends(get_db)
):
    """Handle signup - React frontend üçün JSON qaytarır"""
    # Check if client wants JSON response (React frontend)
    accept_header = request.headers.get("Accept", "")
    is_json_request = "application/json" in accept_header or request.headers.get("X-Requested-With") == "XMLHttpRequest"
    
    # Validation
    if password != confirm_password:
        if is_json_request:
            return JSONResponse({
                "success": False,
                "error": "Şifrələr uyğun gəlmir"
            }, status_code=400)
        return templates.TemplateResponse("signup.html", {
            "request": request,
            "error": "Şifrələr uyğun gəlmir"
        })
    
    if len(password) < 4:
        if is_json_request:
            return JSONResponse({
                "success": False,
                "error": "Şifrə ən azı 4 simvol olmalıdır"
            }, status_code=400)
        return templates.TemplateResponse("signup.html", {
            "request": request,
            "error": "Şifrə ən azı 4 simvol olmalıdır"
        })
    
    if len(username) < 3:
        if is_json_request:
            return JSONResponse({
                "success": False,
                "error": "İstifadəçi adı ən azı 3 simvol olmalıdır"
            }, status_code=400)
        return templates.TemplateResponse("signup.html", {
            "request": request,
            "error": "İstifadəçi adı ən azı 3 simvol olmalıdır"
        })
    
    # Check if user exists
    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user:
        if is_json_request:
            return JSONResponse({
                "success": False,
                "error": "Bu istifadəçi adı artıq mövcuddur"
            }, status_code=400)
        return templates.TemplateResponse("signup.html", {
            "request": request,
            "error": "Bu istifadəçi adı artıq mövcuddur"
        })
    
    # Create new user
    password_hash = hash_password(password)
    new_user = User(
        username=username,
        password_hash=password_hash,
        monthly_budget=1000.0
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    if is_json_request:
        return JSONResponse({
            "success": True,
            "message": "Qeydiyyat uğurla tamamlandı",
            "user": {
                "id": new_user.id,
                "username": new_user.username
            }
        })
    # Redirect to login page with success message
    return RedirectResponse(url="/login?registered=1", status_code=303)

@app.get("/logout")
async def logout(request: Request):
    """Logout user"""
    request.session.clear()
    return RedirectResponse(url="/login", status_code=303)

# ==================== ROUTES ====================

@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request, db: Session = Depends(get_db)):
    """Main dashboard page"""
    user = get_current_user(request, db)
    if not user:
        return RedirectResponse(url="/login", status_code=303)
    # Greeting
    hour = datetime.now().hour
    if hour < 12:
        greeting = "Sabahın xeyir"
    elif hour < 18:
        greeting = "Günün aydın"
    else:
        greeting = "Axşamın xeyir"
    
    # Track login streak
    today = date_type.today()
    if user.last_login_date != today:
        if user.last_login_date == today - timedelta(days=1):
            # Consecutive day login
            user.login_streak += 1
            gamification.award_xp(user, "daily_login", db)
        else:
            # Streak broken
            user.login_streak = 1
        user.last_login_date = today
        db.commit()
    
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
    
    # Calculate salary increase (compare to previous month)
    salary_increase_info = None
    current_month_salary = None
    
    # Get current month salary income
    current_salary_incomes = [inc for inc in incomes if inc.source.lower() in ["maaş", "salary", "maas"]]
    if current_salary_incomes:
        current_month_salary = sum(inc.amount for inc in current_salary_incomes)
        
        # Get previous month's salary
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
            
            # Calculate increase
            if prev_month_salary > 0 and current_month_salary > prev_month_salary:
                increase_amount = current_month_salary - prev_month_salary
                increase_percentage = (increase_amount / prev_month_salary) * 100
                
                salary_increase_info = {
                    "amount": increase_amount,
                    "percentage": increase_percentage,
                    "current": current_month_salary,
                    "previous": prev_month_salary
                }

    
    # Calculate stats (all amounts are stored in AZN)
    total_spending_azn = sum(exp.amount for exp in expenses)
    total_income_azn = sum(inc.amount for inc in incomes)
    
    # Calculate total available (budget + income - spending)
    total_available_azn = user.monthly_budget + total_income_azn - total_spending_azn
    effective_budget_azn = user.monthly_budget + total_income_azn  # Base budget + Extra income
    
    # All amounts are in AZN (only AZN supported)
    total_spending = total_spending_azn
    total_income = total_income_azn
    monthly_budget_display = effective_budget_azn  # Show effective budget
    monthly_income_display = user.monthly_income or 0 if user.monthly_income else 0
    remaining_budget = effective_budget_azn - total_spending_azn
    total_available = total_available_azn
    
    # Category breakdown
    category_data = {}
    for exp in expenses:
        if exp.category not in category_data:
            category_data[exp.category] = 0
        category_data[exp.category] += exp.amount
    
    # Recent expenses (last 10 by creation time so freshly scanned items appear)
    recent_expenses = db.query(Expense).filter(
        Expense.user_id == user.id
    ).order_by(Expense.created_at.desc()).limit(10).all()
    
    # Budget percentage (use AZN values for calculation to maintain accuracy)
    # Use effective budget as the denominator
    budget_percentage = (total_spending_azn / effective_budget_azn * 100) if effective_budget_azn > 0 else 0
    
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
        
        # Daily limit values (all in AZN)
        today_total_display = today_total
        daily_limit_display = user.daily_budget_limit
        
        # Round for comparison to avoid floating point issues
        today_total_rounded = round(today_total, 2)
        limit_rounded = round(user.daily_budget_limit, 2)
        
        if today_total_rounded > limit_rounded:
            daily_limit_alert = {
                "exceeded": True,
                "today_spending": today_total_display,
                "limit": daily_limit_display,
                "over_by": today_total - user.daily_budget_limit
            }
        elif today_total >= user.daily_budget_limit * 0.9:
            daily_limit_alert = {
                "exceeded": False,
                "warning": True,
                "today_spending": today_total_display,
                "limit": daily_limit_display,
                "remaining": user.daily_budget_limit - today_total
            }
    
    # Get level info for gamification
    level_info = gamification.get_level_info(user.xp_points)

    # Check for Monthly Savings Reward
    monthly_reward_alert = None
    try:
        today = date_type.today()
        # Calculate last month
        first = today.replace(day=1)
        last_month_date = first - timedelta(days=1)
        last_month_str = last_month_date.strftime("%Y-%m")
        
        # Check if already rewarded for last month
        if user.last_rewarded_month != last_month_str:
            # Calculate savings for last month
            last_month_start = last_month_date.replace(day=1)
            # End of last month is start of current month (first)
            
            last_month_expenses = db.query(Expense).filter(
                Expense.user_id == user.id,
                Expense.date >= last_month_start,
                Expense.date < first
            ).all()
            
            last_month_spending = sum(exp.amount for exp in last_month_expenses)
            
            # If user had a budget
            if user.monthly_budget > 0:
                savings = user.monthly_budget - last_month_spending
                if savings > 0:
                    savings_percent = (savings / user.monthly_budget) * 100
                    # Award coins: 1 coin for every 1% saved
                    coins_to_award = int(savings_percent)
                    
                    if coins_to_award > 0:
                        user.coins = (user.coins or 0) + coins_to_award
                        user.last_rewarded_month = last_month_str
                        db.commit()
                        
                        monthly_reward_alert = {
                            "coins": coins_to_award,
                            "percent": int(savings_percent),
                            "month": last_month_date.strftime("%B")
                        }
            else:
                # Mark as checked even if no budget, to avoid re-checking
                user.last_rewarded_month = last_month_str
                db.commit()
    except Exception as e:
        print(f"Error checking monthly reward: {e}")
    
    # Get forecast data
    forecast = forecast_service.get_forecast(user.id, db)
    
    # Forecast values (all in AZN)
    # No conversion needed - all values are already in AZN
    # Wishlist items
    wishes = db.query(Wish).filter(Wish.user_id == user.id).order_by(Wish.created_at.desc()).limit(10).all()

    # ===== NEW: ECO-SCORE CALCULATION =====
    eco_score = calculate_eco_score(expenses)
    eco_breakdown = calculate_eco_breakdown(category_data)
    eco_tip = get_eco_tip(eco_breakdown)

    # ===== NEW: DREAM VAULT DATA =====
    dream_goal = 2999.0  # PS5 price
    dream_saved = 450.0  # Demo data - in production, store in DB
    dream_progress = (dream_saved / dream_goal) * 100
    dream_blur = max(0, 20 - (dream_progress / 100 * 20))  # 20px at 0%, 0px at 100%

    # ===== NEW: LOCAL GEMS - Find expensive expenses and suggest alternatives =====
    from local_gems import find_local_gems, format_gem_suggestion
    local_gems_suggestions = []
    
    # Find expensive expenses (above average or specific expensive merchants)
    expensive_merchants = ["Starbucks", "McDonald's", "KFC", "Papa John's", "Kino", "Cinema"]
    for expense in recent_expenses[:5]:  # Check last 5 expenses
        merchant = expense.merchant
        amount = expense.amount
        
        # Check if it's an expensive merchant or above average amount (use AZN for comparison)
        is_expensive = any(exp_merchant.lower() in merchant.lower() for exp_merchant in expensive_merchants)
        avg_amount = total_spending_azn / len(expenses) if expenses else 0
        is_above_avg = amount > avg_amount * 1.5 if avg_amount > 0 else False
        
        if is_expensive or is_above_avg:
            alternatives = find_local_gems(merchant, amount, expense.category)
            if alternatives:
                gem_text = format_gem_suggestion(merchant, amount, alternatives)
                if gem_text:
                    local_gems_suggestions.append({
                        "merchant": merchant,
                        "amount": amount,
                        "category": expense.category,
                        "suggestions": gem_text,
                        "alternatives": alternatives[:2]  # Top 2 alternatives
                    })
    
    # Limit to 3 suggestions max
    local_gems_suggestions = local_gems_suggestions[:3]

    # Get currency symbol
    currency_symbol = "₼"  # Only AZN supported

    return templates.TemplateResponse("dashboard.html", {
        "request": request,
        "user": user,
        "total_spending": total_spending,  # Already converted to user currency
        "total_income": total_income,  # Current month income
        "monthly_income_display": monthly_income_display,  # Monthly salary
        "monthly_budget_display": monthly_budget_display,  # Converted to user currency
        "remaining_budget": remaining_budget,  # Converted to user currency
        "total_available": total_available,  # Budget + Income - Spending
        "incomes": incomes,  # List of incomes for this month
        "budget_percentage": budget_percentage,
        "category_data": category_data,
        "recent_expenses": recent_expenses,
        "daily_limit_alert": daily_limit_alert,
        "level_info": level_info,
        "forecast": forecast,
        "wishes": wishes,
        "min": min,
        "float": float,
        "now": now,
        "greeting": greeting,
        # New data
        "eco_score": eco_score,
        "eco_breakdown": eco_breakdown,
        "eco_tip": eco_tip,
        "dream_goal": dream_goal,
        "dream_saved": dream_saved,
        "dream_progress": dream_progress,
        "dream_blur": dream_blur,
        "local_gems": local_gems_suggestions,
        "currency_symbol": currency_symbol,
        "salary_increase_info": salary_increase_info
    })


@app.get("/chat", response_class=HTMLResponse)
async def chat_page(request: Request, db: Session = Depends(get_db)):
    """AI Chat page"""
    user = get_current_user(request, db)
    if not user:
        return RedirectResponse(url="/login", status_code=303)
    
    # Get chat history
    messages = db.query(ChatMessage).filter(
        ChatMessage.user_id == user.id
    ).order_by(ChatMessage.timestamp.asc()).all()
    
    return templates.TemplateResponse("chat.html", {
        "request": request,
        "user": user,
        "messages": messages
    })


@app.post("/api/chat")
async def send_chat_message(
    request: Request,
    message: str = Form(...),
    db: Session = Depends(get_db)
):
    """Handle chat message from user"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Save user message
    user_msg = ChatMessage(
        user_id=user.id,
        role="user",
        content=message,
        timestamp=datetime.utcnow()
    )
    db.add(user_msg)
    db.commit()
    
    # Build database context
    db_context = build_db_context(db, user.id)
    
    # Get recent chat history
    recent_messages = db.query(ChatMessage).filter(
        ChatMessage.user_id == user.id
    ).order_by(ChatMessage.timestamp.desc()).limit(10).all()
    
    chat_history = [
        {"role": msg.role, "content": msg.content}
        for msg in reversed(recent_messages)
    ]
    
    # Get AI response with dynamic persona (force Azerbaijani replies)
    ai_response = ai_service.chat_with_cfo(
        message,
        db_context,
        chat_history,
        "az",
        user  # Pass user for behavioral profiling
    )
    
    # Convert markdown to HTML in AI response for better formatting
    import re
    
    # Bold text: **text** -> <strong>text</strong>
    ai_response_formatted = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', ai_response)
    
    # Italic text: *text* (but not ** which is bold)
    ai_response_formatted = re.sub(r'(?<!\*)\*(?!\*)([^\*]+?)\*(?!\*)', r'<em>\1</em>', ai_response_formatted)
    
    # Bullet points: ↑ or • at start of line -> styled bullet
    ai_response_formatted = re.sub(r'(^|\n)([↑•])\s*(.+)', r'\1<span class="chat-bullet">\2</span> \3', ai_response_formatted)
    
    # Line breaks: convert \n to <br> for proper display
    ai_response_formatted = ai_response_formatted.replace('\n', '<br>')
    
    # Save AI response
    ai_msg = ChatMessage(
        user_id=user.id,
        role="ai",
        content=ai_response_formatted,
        timestamp=datetime.utcnow()
    )
    db.add(ai_msg)
    db.commit()
    
    # Award XP for chat interaction
    xp_result = gamification.award_xp(user, "chat_message", db)
    db.refresh(user)  # Refresh to get updated XP
    
    # Return JSON for React frontend
    return JSONResponse({
        "success": True,
        "response": ai_response_formatted,
        "message": ai_response_formatted,  # Alias for compatibility
        "user_message": message,
        "xp_awarded": xp_result.get("xp", 0) if xp_result else 0,
        "xp_result": xp_result
    })


@app.get("/api/chat-history")
async def get_chat_history(request: Request, db: Session = Depends(get_db)):
    """Get chat history for current user"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Get chat history
    messages = db.query(ChatMessage).filter(
        ChatMessage.user_id == user.id
    ).order_by(ChatMessage.timestamp.asc()).all()
    
    # Format messages for React
    formatted_messages = [
        {
            "id": msg.id,
            "role": msg.role,
            "content": msg.content,
            "timestamp": msg.timestamp.isoformat() if msg.timestamp else None
        }
        for msg in messages
    ]
    
    return JSONResponse({
        "success": True,
        "messages": formatted_messages
    })


@app.get("/scan", response_class=HTMLResponse)
async def scan_page(request: Request, db: Session = Depends(get_db)):
    """Receipt scanner page"""
    user = get_current_user(request, db)
    if not user:
        return RedirectResponse(url="/login", status_code=303)
    return templates.TemplateResponse("scan.html", {
        "request": request,
        "user": user
    })


@app.post("/api/scan-receipt")
async def scan_receipt(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Process uploaded receipt image"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Check if client wants JSON response (React frontend)
    accept_header = request.headers.get("Accept", "")
    x_client = request.headers.get("X-Client-Appended", "")
    origin = request.headers.get("Origin", "")
    
    # More robust detection: check Accept header, X-Client-Appended, or if request comes from React dev server
    wants_json = (
        "application/json" in accept_header 
        or x_client == "true"
        or "react" in accept_header.lower()
        or "localhost:5173" in origin  # Vite dev server
        or "localhost:3000" in origin  # React dev server
    )
    
    # Debug logging
    if not wants_json:
        print(f"⚠️ Scan API: HTML response requested. Accept: {accept_header}, X-Client: {x_client}, Origin: {origin}")
    else:
        print(f"✅ Scan API: JSON response requested. Accept: {accept_header}, X-Client: {x_client}, Origin: {origin}")
    
    try:
        # Save uploaded file
        file_path = f"static/uploads/{file.filename}"
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Analyze receipt with AI
        receipt_data = ai_service.analyze_receipt(file_path)

        # Normalize payload to avoid JSON serialization issues
        items = receipt_data.get("items", [])
        if not isinstance(items, list):
            try:
                items = list(items)
            except Exception:
                items = []
        receipt_data["items"] = items
        receipt_data["merchant"] = receipt_data.get("merchant") or "Unknown Merchant"
        receipt_data["suggested_category"] = receipt_data.get("suggested_category") or "Other"
        # Don't override date if AI extracted it, only set default if missing
        if not receipt_data.get("date") or receipt_data.get("date") == "null":
            # Will use current date/time from browser or UTC+4
            receipt_data["date"] = None
    
        # Check if this is actually a receipt
        if not receipt_data.get("is_receipt", True):
            if wants_json:
                return JSONResponse({
                    "success": False,
                    "receipt_data": {
                        "error": "Bu qəbz deyil. Xahiş edirik qəbz şəkli yükləyin.",
                        "is_not_receipt": True
                    }
                })
            return templates.TemplateResponse("partials/receipt_result.html", {
                "request": request,
                "receipt_data": {
                    "error": "Bu qəbz deyil. Xahiş edirik qəbz şəkli yükləyin.",
                    "is_not_receipt": True
                },
                "success": False
            })
        
        # Only AZN supported - no currency conversion
        receipt_data["currency"] = "AZN"
        conversion_note = None

        # Surface non-blocking AI warnings (offline/fallback mode)
        if not conversion_note and isinstance(receipt_data, dict):
            conversion_note = receipt_data.get("note")
    
        # Check if error occurred
        if "error" in receipt_data:
            if wants_json:
                return JSONResponse({
                    "success": False,
                    "receipt_data": receipt_data
                })
            return templates.TemplateResponse("partials/receipt_result.html", {
                "request": request,
                "receipt_data": receipt_data,
                "success": False
            })

        # Auto-save expense (skip manual confirmation)
        try:
            raw_date = receipt_data.get("date")
            # Get client date/time from request headers (browser's local time)
            client_date_str = request.headers.get("X-Client-Date", None)
            
            try:
                raw_time = receipt_data.get("time")
                if raw_date and raw_date != "null" and raw_date.lower() != "none":
                    # Use date from receipt if available (assume it's in Azerbaijan time UTC+4)
                    if raw_time and raw_time != "null" and raw_time.lower() != "none":
                        # Both date and time from receipt - treat as UTC+4
                        try:
                            time_parts = raw_time.split(":")
                            hour = int(time_parts[0]) if len(time_parts) > 0 else 0
                            minute = int(time_parts[1]) if len(time_parts) > 1 else 0
                            # Receipt time is already in Azerbaijan time (UTC+4), so use it directly
                            expense_date = datetime.strptime(raw_date, "%Y-%m-%d").replace(hour=hour, minute=minute)
                        except:
                            expense_date = datetime.strptime(raw_date, "%Y-%m-%d")
                    else:
                        # Only date from receipt, use current time in UTC+4
                        az_timezone = timezone(timedelta(hours=4))
                        now_az = datetime.now(az_timezone)
                        expense_date = datetime.strptime(raw_date, "%Y-%m-%d").replace(hour=now_az.hour, minute=now_az.minute)
                elif client_date_str:
                    # Use browser's local time, but convert to UTC+4 (Azerbaijan time)
                    from dateutil import parser
                    client_datetime = parser.isoparse(client_date_str)
                    # If browser sends UTC time, convert to UTC+4
                    # If browser sends local time, assume it's already in user's timezone
                    # For Azerbaijan, we want UTC+4
                    if client_datetime.tzinfo is None:
                        # No timezone info, assume it's UTC and convert to UTC+4
                        az_timezone = timezone(timedelta(hours=4))
                        expense_date = client_datetime.replace(tzinfo=timezone.utc).astimezone(az_timezone).replace(tzinfo=None)
                    else:
                        # Has timezone, convert to UTC+4
                        az_timezone = timezone(timedelta(hours=4))
                        expense_date = client_datetime.astimezone(az_timezone).replace(tzinfo=None)
                else:
                    # Fallback to UTC+4 (Azerbaijan time) - current date and time
                    az_timezone = timezone(timedelta(hours=4))
                    expense_date = datetime.now(az_timezone).replace(tzinfo=None)
            except Exception as date_err:
                # Fallback to UTC+4 - current date and time
                print(f"Date parsing error: {date_err}, using current time")
                az_timezone = timezone(timedelta(hours=4))
                expense_date = datetime.now(az_timezone).replace(tzinfo=None)

            items_list = receipt_data.get("items", [])
            if not isinstance(items_list, list):
                items_list = []

            expense = Expense(
                user_id=user.id,
                amount=float(receipt_data.get("total", 0.0) or 0.0),
                merchant=receipt_data.get("merchant") or "Unknown Merchant",
                category=receipt_data.get("suggested_category") or "Other",
                date=expense_date,
                items=items_list
            )
            db.add(expense)
            db.commit()
            db.refresh(expense)
            
            # Update receipt_data with formatted date/time for display
            receipt_data["date"] = expense_date.strftime("%d.%m.%Y")
            receipt_data["time"] = expense_date.strftime("%H:%M")
            receipt_data["date_time"] = expense_date.strftime("%d.%m.%Y, %H:%M")

            # Check daily budget limit - only for today's receipts
            daily_limit_alert = None
            if user.daily_budget_limit:
                # Use receipt date
                receipt_date = expense_date.date() if isinstance(expense_date, datetime) else expense_date
                today = date_type.today()
                
                # Only check limit if receipt is from today
                if receipt_date == today:
                    day_start = datetime.combine(today, datetime.min.time())
                    day_end = datetime.combine(today, datetime.max.time())
                    
                    today_expenses = db.query(Expense).filter(
                        Expense.user_id == user.id,
                        Expense.date >= day_start,
                        Expense.date <= day_end
                    ).all()
                    today_total = sum(exp.amount for exp in today_expenses)
                    
                    if today_total > user.daily_budget_limit:
                        daily_limit_alert = {
                            "type": "daily_limit_exceeded",
                            "message": f"⚠️ Gündəlik limit keçildi! Bu gün {today_total:.2f} AZN xərclədiniz (Limit: {user.daily_budget_limit:.2f} AZN)",
                            "today_spending": today_total,
                            "limit": user.daily_budget_limit
                        }
                    elif today_total > user.daily_budget_limit * 0.9:
                        daily_limit_alert = {
                            "type": "approaching",
                            "message": f"⚡ Gündəlik limitə yaxınlaşırsınız! Bu gün {today_total:.2f} AZN xərclədiniz (Limit: {user.daily_budget_limit:.2f} AZN)",
                            "today_spending": today_total,
                            "limit": user.daily_budget_limit
                        }

            scan_xp = gamification.award_xp(user, "scan_receipt", db)
            
            # Award FinMate Coins
            if user.coins is None:
                user.coins = 0
            user.coins += 1
            milestone_reached = None
            
            # Check for milestones
            milestones = {
                100: {"name": "🥉 Bronz", "reward": "1 Coffee Kuponu"},
                200: {"name": "🥈 Gümüş", "reward": "3 Coffee Kuponu"},
                500: {"name": "🥇 Qızıl", "reward": "5 AZN pul mükafatı"},
                5000: {"name": "💎 Platin", "reward": "Premium 1 ay + 20 AZN"}
            }
            
            if user.coins in milestones:
                milestone_reached = {
                    "coins": user.coins,
                    "name": milestones[user.coins]["name"],
                    "reward": milestones[user.coins]["reward"]
                }
            
            db.commit()
            db.refresh(user)

            # Return JSON for React frontend if requested
            if wants_json:
                return JSONResponse({
                    "success": True,
                    "receipt_data": receipt_data,
                    "conversion_note": conversion_note,
                    "expense_id": expense.id,  # Include expense ID for delete functionality
                    "xp_result": {
                        "xp_awarded": scan_xp["xp_awarded"] if scan_xp else 0,
                        "new_total": user.xp_points,
                        "level_up": scan_xp.get("level_up", False) if scan_xp else False,
                        "new_level": scan_xp.get("new_level") if scan_xp else None,
                        "level_info": scan_xp.get("level_info") if scan_xp else None,
                        "coins_awarded": scan_xp.get("coins_awarded", 0) if scan_xp else 0,
                    },
                    "coins": user.coins,
                    "milestone_reached": milestone_reached,
                    "daily_limit_alert": daily_limit_alert
                }, headers={"HX-Trigger": "update-stats"})
            
            # Return HTML for HTMX frontend
            return templates.TemplateResponse("partials/receipt_result.html", {
                "request": request,
                "receipt_data": receipt_data,
                "success": True,
                "conversion_note": conversion_note,
                "xp_result": {
                    "xp_awarded": scan_xp["xp_awarded"] if scan_xp else 0,
                    "new_total": user.xp_points
                },
                "coins": user.coins,
                "milestone_reached": milestone_reached,
                "daily_limit_alert": daily_limit_alert
            }, headers={"HX-Trigger": "update-stats"})
        except Exception as save_err:
            if wants_json:
                return JSONResponse({
                    "success": False,
                    "receipt_data": {
                        "error": f"Yadda saxlama xətası: {save_err}"
                    }
                })
            return templates.TemplateResponse("partials/receipt_result.html", {
                "request": request,
                "receipt_data": {
                    "error": f"Yadda saxlama xətası: {save_err}"
                },
                "success": False
            })
        
    except Exception as e:
        if wants_json:
            return JSONResponse({
                "success": False,
                "receipt_data": {
                    "error": f"Xəta baş verdi: {str(e)}",
                    "items": [],
                    "merchant": "Error",
                    "total": 0.0,
                    "date": datetime.now().strftime("%Y-%m-%d"),
                    "suggested_category": "Error"
                }
            })
        return templates.TemplateResponse("partials/receipt_result.html", {
            "request": request,
            "receipt_data": {
                "error": f"Xəta baş verdi: {str(e)}",
                "items": [],
                "merchant": "Error",
                "total": 0.0,
                "date": datetime.now().strftime("%Y-%m-%d"),
                "suggested_category": "Error"
            },
            "success": False
        })


@app.post("/api/confirm-receipt")
async def confirm_receipt(
    request: Request,
    total: float = Form(...),
    merchant: str = Form(...),
    category: str = Form(...),
    date: str = Form(...),
    items: str = Form("[]"),
    db: Session = Depends(get_db)
):
    """Save receipt after user confirmation/correction"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        # Parse date safely - use UTC+4 (Azerbaijan time) or browser time
        try:
            if not date:
                from datetime import timezone as tz
                az_timezone = tz(timedelta(hours=4))
                expense_date = datetime.now(az_timezone).replace(tzinfo=None)
            else:
                expense_date = datetime.strptime(date, "%Y-%m-%d")
        except ValueError:
            from datetime import timezone as tz
            az_timezone = tz(timedelta(hours=4))
            expense_date = datetime.now(az_timezone).replace(tzinfo=None)
        
        # Parse items JSON
        import json
        try:
            items_list = json.loads(items) if items else []
        except:
            items_list = []
        
        # Save to database with user-confirmed/corrected amount
        expense = Expense(
            user_id=user.id,
            amount=total,
            merchant=merchant,
            category=category,
            date=expense_date,
            items=items_list
        )
        db.add(expense)
        db.commit()
        
        # Check daily budget limit - only for today's receipts
        daily_limit_alert = None
        if user.daily_budget_limit:
            # Parse date from form
            try:
                if not date:
                    receipt_date = date_type.today()
                else:
                    receipt_date = datetime.strptime(date, "%Y-%m-%d").date()
            except:
                receipt_date = date_type.today()
            
            today = date_type.today()
            
            # Only check limit if receipt is from today
            if receipt_date == today:
                day_start = datetime.combine(today, datetime.min.time())
                day_end = datetime.combine(today, datetime.max.time())
                
                today_expenses = db.query(Expense).filter(
                    Expense.user_id == user.id,
                    Expense.date >= day_start,
                    Expense.date <= day_end
                ).all()
                today_total = sum(exp.amount for exp in today_expenses)
                
                if today_total > user.daily_budget_limit:
                    daily_limit_alert = {
                        "type": "daily_limit_exceeded",
                        "message": f"⚠️ Gündəlik limit keçildi! Bu gün {today_total:.2f} AZN xərclədiniz (Limit: {user.daily_budget_limit:.2f} AZN)",
                        "today_spending": today_total,
                        "limit": user.daily_budget_limit
                    }
                elif today_total > user.daily_budget_limit * 0.9:
                    daily_limit_alert = {
                        "type": "approaching",
                        "message": f"⚡ Gündəlik limitə yaxınlaşırsınız! Bu gün {today_total:.2f} AZN xərclədiniz (Limit: {user.daily_budget_limit:.2f} AZN)",
                        "today_spending": today_total,
                        "limit": user.daily_budget_limit
                    }
        
        # Award XP for scanning receipt
        scan_xp = gamification.award_xp(user, "scan_receipt", db)
        db.refresh(user)
        
        # Return success result with extended timer
        return templates.TemplateResponse("partials/receipt_result.html", {
            "request": request,
            "receipt_data": {
                "items": items_list,
                "merchant": merchant,
                "total": total,
                "date": expense_date.strftime("%d.%m.%Y"),
                "suggested_category": category,
                "currency": "AZN"
            },
            "success": True,
            "xp_result": {
                "xp_awarded": scan_xp["xp_awarded"] if scan_xp else 0,
                "new_total": user.xp_points,
                "level_up": scan_xp.get("level_up", False) if scan_xp else False,
                "new_level": scan_xp.get("new_level", "") if scan_xp else "",
                "level_info": scan_xp.get("level_info", {}) if scan_xp else {},
                "coins_awarded": scan_xp.get("coins_awarded", 0) if scan_xp else 0
            },
            "daily_limit_alert": daily_limit_alert
        }, headers={"HX-Trigger": "update-stats"})
        
    except Exception as e:
        return templates.TemplateResponse("partials/receipt_result.html", {
            "request": request,
            "receipt_data": {
                "error": f"Yadda saxlama xətası: {str(e)}"
            },
            "success": False
        })


@app.get("/profile", response_class=HTMLResponse)
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

    # ===== NEW: FINANCIAL PERSONALITY DETECTION =====
    personality = detect_financial_personality(user.id, db)
    
    return templates.TemplateResponse("profile.html", {
        "request": request,
        "user": user,
        "total_expenses": total_expenses,
        "total_spent_all_time": total_spent_display,
        "subscriptions": subscriptions,
        "level_info": level_info,
        "next_level": next_level,
        "xp_logs": xp_logs,
        "xp_breakdown": xp_breakdown_dict,
        "personality": personality
    })


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
    
    xp_breakdown_dict = {action: float(amount) for action, amount in xp_breakdown}
    
    # Financial personality detection
    personality = detect_financial_personality(user.id, db)
    
    # Serialize subscriptions
    subscriptions_list = [
        {
            "id": sub.id,
            "merchant": sub.merchant,
            "category": sub.category,
            "amount": float(sub.amount),
            "date": sub.date.isoformat() if sub.date else None
        }
        for sub in subscriptions
    ]
    
    # Serialize XP logs
    xp_logs_list = [
        {
            "id": log.id,
            "action_type": log.action_type,
            "amount": log.amount,
            "created_at": log.created_at.isoformat() if log.created_at else None
        }
        for log in xp_logs
    ]
    
    return JSONResponse({
        "user": {
            "id": user.id,
            "username": user.username,
            "xp_points": user.xp_points,
            "currency": user.currency or "AZN",
            "monthly_budget": float(user.monthly_budget) if user.monthly_budget else 0.0
        },
        "total_expenses": total_expenses,
        "total_spent_all_time": float(total_spent_display),
        "subscriptions": subscriptions_list,
        "level_info": {
            "title": level_info.get("title"),
            "emoji": level_info.get("emoji"),
            "progress_percentage": float(level_info.get("progress_percentage", 0)),
            "current_level": level_info.get("current_level"),
            "min_xp": level_info.get("min_xp"),
            "max_xp": level_info.get("max_xp")
        },
        "next_level": {
            "next_level_title": next_level.get("next_level_title"),
            "next_level_emoji": next_level.get("next_level_emoji"),
            "xp_needed": int(next_level.get("xp_needed", 0))
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
            "amount": exp.amount,
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
            "amount": inc.amount,
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
        avg_amount = total_spending_azn / len(expenses) if expenses else 0
        is_above_avg = amount > avg_amount * 1.5 if avg_amount > 0 else False
        if is_expensive or is_above_avg:
            alternatives = find_local_gems(merchant, amount, expense.category)
            if alternatives:
                local_gems_suggestions.append({
                    "merchant": merchant,
                    "amount": amount,
                    "category": expense.category,
                    "alternatives": alternatives[:2]
                })
    local_gems_suggestions = local_gems_suggestions[:3]
    
    return JSONResponse({
        "context": {
            "total_spend": total_spending,
            "budget": monthly_budget_display,
            "currency": "AZN",
            "last_week_total": last_week_total,
            "subscriptions": subscriptions_total,
            "categories": list(category_data.keys()),
            "category_data": category_data,
            "remaining_budget": remaining_budget,
            "total_available": total_available_azn,
            "eco_score": eco_score,
            "eco_breakdown": eco_breakdown,
            "eco_tip": eco_tip,
            "level_info": {
                "title": level_info.get("title"),
                "emoji": level_info.get("emoji"),
                "progress_percentage": float(level_info.get("progress_percentage", 0)),
                "level": level_info.get("current_level"),
                "max_xp": level_info.get("max_xp")
            },
            "xp_points": user.xp_points or 0,
            "salary_increase_info": salary_increase_info,
            "daily_limit_alert": daily_limit_alert,
            "local_gems": local_gems_suggestions
        },
        "recents": recents,
        "chart_labels": chart_labels,
        "chart_values": chart_values,
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
    
    # Return JSON for React frontend
    return JSONResponse({
        "total_spending": total_spending,
        "total_income": total_income,
        "monthly_income_display": monthly_income_display,
        "monthly_budget_display": monthly_budget_display,
        "remaining_budget": remaining_budget,
        "total_available": total_available,
        "budget_percentage": budget_percentage,
        "eco_score": eco_score,
        "currency": "AZN"
    })


@app.get("/heatmap", response_class=HTMLResponse)
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
    
    # Check if request wants JSON (React frontend)
    accept_header = request.headers.get("accept", "")
    if "application/json" in accept_header or request.headers.get("X-Requested-With") == "XMLHttpRequest":
        return JSONResponse({
            "points": points,
            "stats": {
                "total_amount": total_amount,
                "total_points": len(points),
                "total_categories": len(categories),
                "average": average
            }
        })
    
    # Return HTML for HTMX requests
    return templates.TemplateResponse("heatmap.html", {
        "request": request,
        "user": user,
        "points": points
    })


@app.get("/heatmap", response_class=HTMLResponse)
async def heatmap_page(request: Request, db: Session = Depends(get_db)):
    """Spending heatmap page (HTMX)"""
    user = get_current_user(request, db)
    if not user:
        return RedirectResponse(url="/login", status_code=303)
    expenses = db.query(Expense).filter(Expense.user_id == user.id).all()
    points = []
    for exp in expenses:
        lat, lon = pseudo_coords_for_merchant(exp.merchant)
        points.append({
            "merchant": exp.merchant,
            "amount": exp.amount,
            "category": exp.category,
            "lat": lat,
            "lon": lon
        })
    return templates.TemplateResponse("heatmap.html", {
        "request": request,
        "user": user,
        "points": points
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


# ==================== NEW API ENDPOINTS ====================

@app.put("/api/expenses/{expense_id}")
async def update_expense(
    request: Request,
    expense_id: int,
    merchant: str = Form(...),
    amount: float = Form(...),
    category: str = Form(...),
    db: Session = Depends(get_db)
):
    """Update an existing expense"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == user.id).first()
    
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    try:
        expense.merchant = merchant
        expense.amount = amount
        expense.category = category
        
        db.commit()
        db.refresh(expense)
        
        # Check if request is from React (JSON) or HTMX (HTML)
        accept_header = request.headers.get("Accept", "")
        x_requested_with = request.headers.get("X-Requested-With", "")
        
        if "application/json" in accept_header or x_requested_with == "XMLHttpRequest":
            # React frontend - return JSON
            return JSONResponse({
                "success": True,
                "message": "Əməliyyat uğurla yeniləndi",
                "expense": {
                    "id": expense.id,
                    "merchant": expense.merchant,
                    "amount": expense.amount,
                    "category": expense.category,
                    "date": expense.date.isoformat() if expense.date else None
                }
            }, headers={"HX-Trigger": "update-stats"})
        else:
            # HTMX frontend - return HTML
            return templates.TemplateResponse("partials/transaction_row.html", {
                "request": request,
                "expense": expense,
                "user": user
            }, headers={"HX-Trigger": "update-stats"})
    except Exception as e:
        print(f"❌ Update Expense Error: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)


@app.post("/api/voice-command")
async def voice_command_endpoint(
    request: Request,
    file: UploadFile = File(...),
    language: str = Form("az"),
    db: Session = Depends(get_db)
):
    """Process voice command and create expense"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    if not user.voice_enabled:
        return JSONResponse({"success": False, "error": "Səsli əmrlər deaktiv edilib"}, status_code=403)
    
    try:
        # Read file content
        audio_data = await file.read()
        mime_type = file.content_type
        
        # Process voice command (transcribe and parse)
        result = await voice_service.process_voice_command(audio_data, user, db, language, mime_type, save_to_db=False)
        
        if not result.get("success"):
            return JSONResponse({"success": False, "error": result.get("error")}, status_code=400)
        
        # Return confirmation dialog instead of saving immediately
        # This allows user to review and edit before final save
        return templates.TemplateResponse("partials/voice_confirmation.html", {
            "request": request,
            "transcribed_text": result["transcribed_text"],
            "expense_data": result["expense_data"]
        })
        
    except Exception as e:
        print(f"❌ Voice Command Error: {e}")
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)


@app.post("/api/confirm-voice")
async def confirm_voice_expense(
    request: Request,
    amount: float = Form(...),
    merchant: str = Form(...),
    category: str = Form(...),
    db: Session = Depends(get_db)
):
    """Save voice expense after user confirmation"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        # Create expense
        expense = Expense(
            user_id=user.id,
            amount=amount,
            merchant=merchant,
            category=category,
            date=datetime.utcnow()
        )
        db.add(expense)
        db.commit()
        
        # Award XP - Fixed to 15 XP for voice commands
        xp_result = gamification.award_xp(user, "voice_command", db)
        db.refresh(user)
        
        # Always award 15 XP for voice commands
        xp_awarded = 15
        
        # Return success response - Use toast notification
        # Use window.showToast if available, otherwise create toast directly
        return HTMLResponse(content=f"""
            <script id="voice-success-script">
                // This script will be executed manually in voice_confirmation.html
                (function() {{
                    'use strict';
                    
                    // Trigger dashboard update
                    try {{
                        if (document.body) {{
                            document.body.dispatchEvent(new Event('expensesUpdated'));
                        }}
                    }} catch(e) {{
                        console.log('Event error:', e);
                    }}
                    
                    // Try to use global showToast function first
                    if (typeof window.showToast === 'function') {{
                        window.showToast(' Uğurla əlavə olundu! {amount} AZN - {merchant} (+{xp_awarded} XP)', 'success');
                        return;
                    }}
                    
                    // Fallback: Create toast manually
                    var container = document.getElementById('toast-container');
                    if (!container) {{
                        container = document.createElement('div');
                        container.id = 'toast-container';
                        container.className = 'fixed top-24 right-4 sm:right-6 z-[100] flex flex-col gap-2 pointer-events-none';
                        if (document.body) {{
                            document.body.appendChild(container);
                        }} else {{
                            setTimeout(arguments.callee, 50);
                            return;
                        }}
                    }}
                    
                    // Create toast
                    var toast = document.createElement('div');
                    toast.className = 'pointer-events-auto backdrop-blur-md text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-lg border flex items-center gap-3 transform transition-all duration-500 translate-x-full bg-green-500/90 border-green-400/50 shadow-green-500/20';
                    toast.innerHTML = '<span class="text-xl">✅</span><span class="font-medium text-sm sm:text-base">Uğurla əlavə olundu! {amount} AZN - {merchant} (+{xp_awarded} XP)</span>';
                    
                    container.appendChild(toast);
                    
                    // Animate in
                    setTimeout(function() {{
                        toast.classList.remove('translate-x-full');
                    }}, 50);
                    
                    // Remove after 3 seconds
                    setTimeout(function() {{
                        toast.classList.add('translate-x-full', 'opacity-0');
                        setTimeout(function() {{
                            if (toast && toast.parentNode) {{
                                toast.parentNode.removeChild(toast);
                            }}
                        }}, 500);
                    }}, 3000);
                }})();
            </script>
        """)
        
    except Exception as e:
        print(f"❌ Voice confirmation error: {e}")
        return HTMLResponse(content=f"""
            <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div class="glass-card p-6 text-center max-w-sm">
                    <div class="text-6xl mb-4">❌</div>
                    <h3 class="text-xl font-bold text-white">Xəta baş verdi</h3>
                </div>
            </div>
        """, status_code=500)


@app.get("/api/export-xlsx")
async def export_xlsx(request: Request, db: Session = Depends(get_db)):
    """Generate and download Excel (XLSX) report"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    try:
        from openpyxl import Workbook
        from openpyxl.styles import Font, PatternFill, Alignment
        from io import BytesIO
        
        # Get current month expenses
        now = datetime.utcnow()
        month_start = datetime(now.year, now.month, 1)
        expenses = db.query(Expense).filter(
            Expense.user_id == user.id,
            Expense.date >= month_start
        ).order_by(Expense.date.desc()).all()
        
        # Create workbook
        wb = Workbook()
        ws = wb.active
        ws.title = "Expenses"
        
        # Header styling
        header_fill = PatternFill(start_color="6B46C1", end_color="6B46C1", fill_type="solid")
        header_font = Font(color="FFFFFF", bold=True, size=12)
        
        # Headers
        headers = ["Tarix", "Merchant", "Kateqoriya", "Məbləğ (₼)", "Qeyd"]
        for col, header in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col, value=header)
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal="center", vertical="center")
        
        # Data rows
        total = 0
        for row, expense in enumerate(expenses, 2):
            ws.cell(row=row, column=1, value=expense.date.strftime("%d.%m.%Y %H:%M"))
            ws.cell(row=row, column=2, value=expense.merchant)
            ws.cell(row=row, column=3, value=expense.category)
            amount_cell = ws.cell(row=row, column=4, value=expense.amount)
            amount_cell.number_format = '#,##0.00'
            ws.cell(row=row, column=5, value=expense.notes or "")
            total += expense.amount
        
        # Total row
        total_row = len(expenses) + 2
        ws.cell(row=total_row, column=3, value="CƏMI:").font = Font(bold=True)
        total_cell = ws.cell(row=total_row, column=4, value=total)
        total_cell.font = Font(bold=True)
        total_cell.number_format = '#,##0.00'
        
        # Column widths
        ws.column_dimensions['A'].width = 18
        ws.column_dimensions['B'].width = 25
        ws.column_dimensions['C'].width = 20
        ws.column_dimensions['D'].width = 15
        ws.column_dimensions['E'].width = 30
        
        # Save to BytesIO
        excel_file = BytesIO()
        wb.save(excel_file)
        excel_file.seek(0)
        
        return Response(
            content=excel_file.read(),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=finmate_expenses_{now.strftime('%Y%m%d')}.xlsx"}
        )
    except Exception as e:
        print(f"❌ XLSX Export Error: {e}")
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)


@app.get("/api/forecast")
async def get_forecast_endpoint(request: Request, db: Session = Depends(get_db)):
    """Get spending forecast for current month"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        forecast = forecast_service.get_forecast(user.id, db)
        return JSONResponse(forecast)
    except Exception as e:
        print(f"❌ Forecast Error: {e}")
        return JSONResponse({"error": str(e)}, status_code=500)


@app.get("/api/forecast-chart")
async def get_forecast_chart_endpoint(request: Request, db: Session = Depends(get_db)):
    """Get forecast data points for chart"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        forecast_points = forecast_service.get_chart_forecast_data(user.id, db)
        return JSONResponse({"forecast_points": forecast_points})
    except Exception as e:
        print(f"❌ Forecast Chart Error: {e}")
        return JSONResponse({"error": str(e)}, status_code=500)


@app.post("/api/tts")
async def text_to_speech(
    text: str = Form(...),
    language: str = Form("az"),
    rate: str = Form("+0%"),      # Speech rate: -50% to +100%
    pitch: str = Form("+0Hz"),    # Pitch: -50Hz to +50Hz
    volume: str = Form("+0%"),    # Volume: -50% to +100%
    quality: str = Form("high")   # Quality flag (for future use)
):
    """Convert text to speech using edge-tts with enhanced quality parameters"""
    try:
        # Enhanced parameters for high-quality TTS
        # Adjust rate slightly for more natural speech (slightly slower = clearer)
        if quality == "high":
            rate = "+0%"  # Natural speed
            pitch = "+0Hz"  # Natural pitch
            volume = "+0%"  # Full volume
        
        audio_bytes = await voice_service.generate_voice_response(
            text, 
            language, 
            rate=rate,
            pitch=pitch,
            volume=volume
        )
        if not audio_bytes:
            return JSONResponse({"success": False, "error": "TTS failed"}, status_code=500)
        return JSONResponse({
            "success": True,
            "audio_response": base64.b64encode(audio_bytes).decode()
        })
    except Exception as e:
        print(f"❌ TTS API Error: {e}")
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)


@app.post("/api/reset-demo")
async def reset_demo_endpoint():
    """Reset database to curated demo data (manual action)"""
    try:
        reset_demo_data()
        return JSONResponse({"success": True, "message": "Demo məlumatları yeniləndi"})
    except Exception as e:
        print(f"❌ Reset Demo Error: {e}")
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)


@app.post("/api/activate-trial")
async def activate_trial_endpoint(request: Request, db: Session = Depends(get_db)):
    """Activate premium trial for current user"""
    try:
        user = get_current_user(request, db)
        if not user:
            return JSONResponse({"success": False, "error": "İstifadəçi tapılmadı"}, status_code=401)
            
        user.is_premium = True
        db.commit()
        return JSONResponse({"success": True, "message": "Premium aktivləşdirildi! 14 gün pulsuz sınaq başladı."})
    except Exception as e:
        print(f"❌ Trial Activation Error: {e}")
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)


@app.post("/api/expense")
async def add_manual_expense(
    request: Request,
    amount: float = Form(...),
    merchant: str = Form(...),
    category: str = Form(...),
    notes: str = Form(""),
    db: Session = Depends(get_db)
):
    """Add manual expense"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        expense = Expense(
            user_id=user.id,
            amount=amount,
            merchant=merchant,
            category=category,
            notes=notes,
            date=datetime.utcnow()
        )
        db.add(expense)
        db.commit()
        
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
            
            if today_total > user.daily_budget_limit:
                daily_limit_alert = {
                    "type": "daily_limit_exceeded",
                    "message": f"⚠️ Gündəlik limit keçildi! Bu gün {today_total:.2f} AZN xərclədiniz (Limit: {user.daily_budget_limit:.2f} AZN)",
                    "today_spending": today_total,
                    "limit": user.daily_budget_limit
                }
        
        # Award XP
        xp_result = gamification.award_xp(user, "manual_expense", db)
        
        response_data = {
            "success": True,
            "expense_id": expense.id,
            "xp_result": xp_result
        }
        
        if daily_limit_alert:
            response_data["daily_limit_alert"] = daily_limit_alert
        
        return JSONResponse(response_data)
        
    except Exception as e:
        print(f"❌ Add Expense Error: {e}")
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)


@app.delete("/api/expenses/{expense_id}")
async def delete_expense(request: Request, expense_id: int, db: Session = Depends(get_db)):
    """Delete an expense (with ownership verification)"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    try:
        expense = db.query(Expense).filter(
            Expense.id == expense_id,
            Expense.user_id == user.id  # Ensure ownership
        ).first()
        
        if not expense:
            return JSONResponse(
                {"success": False, "error": "Expense not found or unauthorized"},
                status_code=404
            )
        
        if user.coins and user.coins > 0:
            user.coins -= 1
            
        db.delete(expense)
        db.commit()
        
        # Return response with HX-Refresh header to reload page and recalculate totals
        return Response(
            status_code=200,
            headers={"HX-Refresh": "true", "HX-Trigger": "update-stats"}
        )
    except Exception as e:
        print(f"❌ Delete Error: {e}")
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)


@app.post("/api/set-budget")
async def set_budget(
    request: Request,
    monthly_budget: float = Form(...),
    db: Session = Depends(get_db)
):
    """Set monthly budget"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        # Validate amount
        if monthly_budget < 100:
            return JSONResponse({"success": False, "error": "Büdcə minimum 100 AZN olmalıdır"}, status_code=400)
        
        # Update monthly budget
        user.monthly_budget = monthly_budget
        # Ensure user currency is AZN
        if user.currency != "AZN":
            user.currency = "AZN"
        
        db.commit()
        db.refresh(user)
        
        print(f"✅ Budget set: {monthly_budget} AZN for user {user.id}")
        
        # Return success response
        return JSONResponse({
            "success": True, 
            "message": f"Aylıq büdcə təyin edildi: {monthly_budget:.2f} AZN"
        }, headers={"HX-Trigger": "update-stats"})
    except Exception as e:
        print(f"❌ Set Budget Error: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse({"success": False, "error": f"Xəta: {str(e)}"}, status_code=500)


@app.post("/api/add-income")
async def add_income(
    request: Request,
    db: Session = Depends(get_db)
):
    """Add income (salary or extra income)"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        # Get form data
        form = await request.form()
        amount_str = form.get("amount")
        source = form.get("source")
        date_str = form.get("date")
        description = form.get("description")
        is_recurring_str = form.get("is_recurring", "false")
        
        print(f"📥 Add Income Request - User: {user.id}")
        print(f"   Amount: {amount_str}, Source: {source}, Date: {date_str}")
        
        # Validate and parse amount
        if not amount_str:
            return JSONResponse({"success": False, "error": "Məbləğ daxil edilməyib"}, status_code=400)
        
        try:
            amount = float(amount_str)
        except (ValueError, TypeError):
            return JSONResponse({"success": False, "error": "Yanlış məbləğ formatı"}, status_code=400)
        
        if amount <= 0:
            return JSONResponse({"success": False, "error": "Məbləğ 0-dan böyük olmalıdır"}, status_code=400)
        
        # Validate source
        if not source:
            return JSONResponse({"success": False, "error": "Mənbə seçilməyib"}, status_code=400)
        
        # Parse date
        if date_str:
            try:
                income_date = datetime.strptime(date_str, "%Y-%m-%d")
            except ValueError:
                income_date = datetime.utcnow()
        else:
            income_date = datetime.utcnow()
        
        # Parse is_recurring
        is_recurring = is_recurring_str.lower() in ["true", "1", "on", "yes"]
        
        # If source is "Maaş" or "Salary", update monthly_income
        if source.lower() in ["maaş", "salary", "maas"]:
            user.monthly_income = amount
            is_recurring = True
            print(f"   Updating monthly_income to {amount}")
        
        # Create Income record
        income = Income(
            user_id=user.id,
            amount=amount,
            source=source,
            description=description if description else None,
            date=income_date,
            is_recurring=is_recurring
        )
        
        print(f"   Creating Income record: {amount} {source} on {income_date}")
        
        db.add(income)
        db.commit()
        db.refresh(income)
        db.refresh(user)
        
        print(f"✅ Income added successfully: ID={income.id}, Amount={amount}, Source={source}, User={user.id}")
        print(f"   Date: {income_date}")
        print(f"   Is recurring: {is_recurring}")
        print(f"   User's monthly_income updated to: {user.monthly_income}")
        
        # Trigger stats update
        return JSONResponse({
            "success": True, 
            "message": f"Gəlir əlavə edildi: {amount:.2f} {user.currency or 'AZN'}"
        }, headers={"HX-Trigger": "update-stats"})
    except Exception as e:
        print(f"❌ Add Income Error: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse({"success": False, "error": f"Xəta: {str(e)}"}, status_code=500)

async def add_wishlist_item(
    request: Request,
    title: str = Form(...),
    url: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    db: Session = Depends(get_db)
):
    """Add wish to 24h impulse-control list"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    try:
        locked_until = datetime.utcnow() + timedelta(hours=24)
        wish = Wish(
            user_id=user.id,
            title=title,
            url=url,
            price=price,
            locked_until=locked_until
        )
        db.add(wish)
        db.commit()
        db.refresh(wish)
        # Refresh list
        wishes = db.query(Wish).filter(Wish.user_id == user.id).order_by(Wish.created_at.desc()).limit(10).all()
        return templates.TemplateResponse("partials/wishlist_list.html", {"request": request, "wishes": wishes})
    except Exception as e:
        print(f"❌ Wishlist Error: {e}")
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)


# ==================== DREAM VAULT API ENDPOINTS ====================

@app.get("/api/dreams")
async def get_dreams_api(request: Request, db: Session = Depends(get_db)):
    """Get all dreams for current user - JSON for React frontend"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        # Get all active dreams
        active_dreams = db.query(Dream).filter(
            Dream.user_id == user.id,
            Dream.is_completed == False
        ).order_by(Dream.priority.desc(), Dream.created_at.desc()).all()
        
        # Get completed dreams
        completed_dreams = db.query(Dream).filter(
            Dream.user_id == user.id,
            Dream.is_completed == True
        ).order_by(Dream.updated_at.desc()).limit(5).all()
        
        # Serialize dreams
        def serialize_dream(dream):
            return {
                "id": dream.id,
                "title": dream.title,
                "description": dream.description,
                "target_amount": float(dream.target_amount),
                "saved_amount": float(dream.saved_amount),
                "image_url": dream.image_url,
                "category": dream.category,
                "target_date": dream.target_date.isoformat() if dream.target_date else None,
                "priority": dream.priority,
                "created_at": dream.created_at.isoformat() if dream.created_at else None,
                "updated_at": dream.updated_at.isoformat() if dream.updated_at else None,
                "is_completed": dream.is_completed,
            }
        
        return JSONResponse({
            "success": True,
            "dreams": [serialize_dream(d) for d in active_dreams] + [serialize_dream(d) for d in completed_dreams],
        })
    except Exception as e:
        print(f"❌ Get Dreams API Error: {e}")
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)

@app.get("/dream-vault", response_class=HTMLResponse)
async def dream_vault_page(request: Request, db: Session = Depends(get_db)):
    """Dream Vault page - visualize and track savings goals"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Get all dreams for user
    dreams = db.query(Dream).filter(
        Dream.user_id == user.id,
        Dream.is_completed == False
    ).order_by(Dream.priority.desc(), Dream.created_at.desc()).all()
    
    # Get completed dreams
    completed_dreams = db.query(Dream).filter(
        Dream.user_id == user.id,
        Dream.is_completed == True
    ).order_by(Dream.updated_at.desc()).limit(5).all()
    
    # Calculate total saved across all dreams
    total_saved = sum(dream.saved_amount for dream in dreams)
    total_target = sum(dream.target_amount for dream in dreams)
    
    return templates.TemplateResponse("dream_vault.html", {
        "request": request,
        "user": user,
        "dreams": dreams,
        "completed_dreams": completed_dreams,
        "total_saved": total_saved,
        "total_target": total_target,
        "today_date": datetime.utcnow().strftime("%Y-%m-%d"),
        "now": datetime.utcnow(),
        "date_type": date_type,
        "max": max,
        "min": min
    })


@app.post("/api/dreams")
async def create_dream(
    request: Request,
    title: str = Form(...),
    description: Optional[str] = Form(None),
    target_amount: float = Form(...),
    image_url: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    target_date: Optional[str] = Form(None),
    priority: int = Form(1),
    db: Session = Depends(get_db)
):
    """Create a new dream"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Check active dreams limit
    active_dreams_count = db.query(Dream).filter(
        Dream.user_id == user.id, 
        Dream.saved_amount < Dream.target_amount
    ).count()
    
    if active_dreams_count >= 5:
        return JSONResponse({"success": False, "error": "Maksimum 5 aktiv arzu yarada bilərsiniz"}, status_code=400)

    try:
        # Parse target_date if provided
        parsed_date = None
        if target_date:
            try:
                parsed_date = datetime.strptime(target_date, "%Y-%m-%d").date()
            except ValueError:
                pass
        
        dream = Dream(
            user_id=user.id,
            title=title,
            description=description,
            target_amount=target_amount,
            saved_amount=0.0,
            image_url=image_url,
            category=category or "Digər",
            target_date=parsed_date,
            priority=min(max(priority, 1), 5)  # Clamp between 1-5
        )
        db.add(dream)
        db.commit()
        db.refresh(dream)
        
        # Check if request wants JSON (React frontend)
        accept_header = request.headers.get("accept", "")
        if "application/json" in accept_header or request.headers.get("X-Requested-With") == "XMLHttpRequest":
            # Serialize dream
            dream_data = {
                "id": dream.id,
                "title": dream.title,
                "description": dream.description,
                "target_amount": float(dream.target_amount),
                "saved_amount": float(dream.saved_amount),
                "image_url": dream.image_url,
                "category": dream.category,
                "target_date": dream.target_date.isoformat() if dream.target_date else None,
                "priority": dream.priority,
                "created_at": dream.created_at.isoformat() if dream.created_at else None,
                "updated_at": dream.updated_at.isoformat() if dream.updated_at else None,
                "is_completed": dream.is_completed,
            }
            return JSONResponse({
                "success": True,
                "dream": dream_data,
                "message": "Arzu uğurla yaradıldı"
            })
        
        # Get all active dreams for the list refresh
        active_dreams = db.query(Dream).filter(
            Dream.user_id == user.id, 
            Dream.saved_amount < Dream.target_amount
        ).order_by(Dream.priority.desc(), Dream.created_at.desc()).all()
        
        # Return HTML for HTMX requests
        response = templates.TemplateResponse("partials/dream_list.html", {
            "request": request,
            "dreams": active_dreams,
            "user": user,
            "now": datetime.utcnow(),
            "date_type": date_type,
            "max": max,
            "min": min
        })
        # Trigger stats update - fire dreamUpdated event on body so stats refresh
        response.headers["HX-Trigger"] = 'dreamUpdated'
        return response
    except Exception as e:
        print(f"❌ Create Dream Error: {e}")
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)


@app.put("/api/dreams/{dream_id}")
async def update_dream(
    request: Request,
    dream_id: int,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    target_amount: Optional[float] = Form(None),
    image_url: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    target_date: Optional[str] = Form(None),
    priority: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    """Update a dream"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    dream = db.query(Dream).filter(Dream.id == dream_id, Dream.user_id == user.id).first()
    
    if not dream:
        raise HTTPException(status_code=404, detail="Dream not found")
    
    try:
        if title is not None:
            dream.title = title
        if description is not None:
            dream.description = description
        if target_amount is not None:
            dream.target_amount = target_amount
        if image_url is not None:
            dream.image_url = image_url
        if category is not None:
            dream.category = category
        if target_date is not None:
            try:
                dream.target_date = datetime.strptime(target_date, "%Y-%m-%d").date()
            except ValueError:
                pass
        if priority is not None:
            dream.priority = min(max(priority, 1), 5)
        
        dream.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(dream)
        
        # Check if request wants JSON (React frontend)
        accept_header = request.headers.get("accept", "")
        if "application/json" in accept_header or request.headers.get("X-Requested-With") == "XMLHttpRequest":
            # Serialize dream
            dream_data = {
                "id": dream.id,
                "title": dream.title,
                "description": dream.description,
                "target_amount": float(dream.target_amount),
                "saved_amount": float(dream.saved_amount),
                "image_url": dream.image_url,
                "category": dream.category,
                "target_date": dream.target_date.isoformat() if dream.target_date else None,
                "priority": dream.priority,
                "created_at": dream.created_at.isoformat() if dream.created_at else None,
                "updated_at": dream.updated_at.isoformat() if dream.updated_at else None,
                "is_completed": dream.is_completed,
            }
            return JSONResponse({
                "success": True,
                "dream": dream_data,
                "message": "Arzu uğurla yeniləndi"
            })
        
        # Return HTML for HTMX requests
        response = templates.TemplateResponse("partials/dream_card.html", {
            "request": request,
            "dream": dream,
            "user": user,
            "now": datetime.utcnow(),
            "date_type": date_type,
            "max": max,
            "min": min
        })
        # Trigger stats update - fire dreamUpdated event on body so stats refresh
        response.headers["HX-Trigger"] = 'dreamUpdated'
        return response
    except Exception as e:
        print(f"❌ Update Dream Error: {e}")
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)


@app.post("/api/dreams/{dream_id}/add-savings")
async def add_dream_savings(
    request: Request,
    dream_id: int,
    amount: float = Form(...),
    db: Session = Depends(get_db)
):
    """Add savings to a dream"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    dream = db.query(Dream).filter(Dream.id == dream_id, Dream.user_id == user.id).first()
    
    if not dream:
        raise HTTPException(status_code=404, detail="Dream not found")
    
    try:
        # Check if user has enough balance
        now = datetime.utcnow()
        month_start = datetime(now.year, now.month, 1)
        
        # Calculate current balance (all in AZN)
        expenses = db.query(Expense).filter(
            Expense.user_id == user.id,
            Expense.date >= month_start
        ).all()
        incomes = db.query(Income).filter(
            Income.user_id == user.id,
            Income.date >= month_start
        ).all()
        
        total_spending_azn = sum(exp.amount for exp in expenses)
        total_income_azn = sum(inc.amount for inc in incomes)
        current_balance_azn = user.monthly_budget + total_income_azn - total_spending_azn
        
        # Amount is already in AZN (only AZN supported)
        amount_azn = amount
        
        if current_balance_azn < amount_azn:
            return JSONResponse({
                "success": False,
                "error": f"Kifayət qədər balansınız yoxdur. Cari balans: {current_balance_azn:.2f} AZN"
            }, status_code=400)
        
        # Create expense record for the savings (this will reduce the balance)
        # Store amount in AZN (as all expenses are stored in AZN)
        expense = Expense(
            user_id=user.id,
            amount=amount_azn,  # Store in AZN
            merchant=f"Arzu: {dream.title}",
            category="Qənaət",
            date=datetime.utcnow(),
            notes=f"Arzuya qənaət: {dream.title}"
        )
        db.add(expense)
        
        dream.saved_amount += amount_azn
        
        # Award XP for funding a dream
        gamification.award_xp(user, "add_savings", db)
        
        # Check if dream is completed
        dream_was_completed = False
        if dream.saved_amount >= dream.target_amount:
            dream.saved_amount = dream.target_amount
            dream.is_completed = True
            dream.updated_at = datetime.utcnow()
            dream_was_completed = True
            # Award bonus XP for completing a dream
            gamification.award_xp(user, "complete_dream", db)
        
        db.commit()
        db.refresh(dream)
        
        # Check if request wants JSON (React frontend)
        accept_header = request.headers.get("accept", "")
        if "application/json" in accept_header or request.headers.get("X-Requested-With") == "XMLHttpRequest":
            # Serialize dream
            dream_data = {
                "id": dream.id,
                "title": dream.title,
                "description": dream.description,
                "target_amount": float(dream.target_amount),
                "saved_amount": float(dream.saved_amount),
                "image_url": dream.image_url,
                "category": dream.category,
                "target_date": dream.target_date.isoformat() if dream.target_date else None,
                "priority": dream.priority,
                "created_at": dream.created_at.isoformat() if dream.created_at else None,
                "updated_at": dream.updated_at.isoformat() if dream.updated_at else None,
                "is_completed": dream.is_completed,
            }
            return JSONResponse({
                "success": True,
                "dream": dream_data,
                "message": f"Qənaət uğurla əlavə edildi! {dream.saved_amount:.2f} / {dream.target_amount:.2f} AZN",
                "was_completed": dream_was_completed
            })
        
        # Return HTML for HTMX requests
        response = templates.TemplateResponse("partials/dream_card.html", {
            "request": request,
            "dream": dream,
            "user": user,
            "now": datetime.utcnow(),
            "date_type": date_type,
            "max": max,
            "min": min
        })
        # Trigger stats update - fire dreamUpdated event on body so stats refresh
        # Also trigger dashboard update to refresh balance
        response.headers["HX-Trigger"] = 'dreamUpdated, dashboardUpdated'
        
        # If dream was just completed, trigger page refresh
        if dream_was_completed:
            response.headers["HX-Refresh"] = "true"
        
        return response
    except Exception as e:
        print(f"❌ Add Savings Error: {e}")
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)


@app.delete("/api/dreams/{dream_id}")
async def delete_dream(request: Request, dream_id: int, db: Session = Depends(get_db)):
    """Delete a dream"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    dream = db.query(Dream).filter(Dream.id == dream_id, Dream.user_id == user.id).first()
    
    if not dream:
        return JSONResponse({"success": False, "error": "Dream not found"}, status_code=404)
    
    try:
        db.delete(dream)
        db.commit()
        
        # Check if request wants JSON (React frontend)
        accept_header = request.headers.get("accept", "")
        if "application/json" in accept_header or request.headers.get("X-Requested-With") == "XMLHttpRequest":
            return JSONResponse({
                "success": True,
                "message": "Arzu uğurla silindi"
            })
        
        # Return empty response and trigger updates for HTMX
        return Response(
            status_code=200,
            headers={
                "HX-Trigger": "dreamUpdated",
                "HX-Reswap": "none"
            }
        )
    except Exception as e:
        print(f"❌ Delete Dream Error: {e}")
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)


@app.get("/api/dream-stats")
async def get_dream_stats(request: Request, db: Session = Depends(get_db)):
    """Get dynamic dream statistics - JSON for React frontend"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Get all active dreams
    dreams = db.query(Dream).filter(
        Dream.user_id == user.id,
        Dream.is_completed == False
    ).all()
    
    # Calculate totals
    total_saved = sum(dream.saved_amount for dream in dreams)
    total_target = sum(dream.target_amount for dream in dreams)
    total_progress = (total_saved / total_target * 100) if total_target > 0 else 0
    
    # Check if request wants JSON (React frontend)
    accept_header = request.headers.get("accept", "")
    if "application/json" in accept_header or request.headers.get("X-Requested-With") == "XMLHttpRequest":
        return JSONResponse({
            "total_saved": float(total_saved),
            "total_target": float(total_target),
            "total_progress": float(total_progress),
        })
    
    # Return HTML for HTMX requests
    return templates.TemplateResponse("partials/dream_stats.html", {
        "request": request,
        "user": user,
        "total_saved": total_saved,
        "total_target": total_target,
        "max": max,
        "min": min
    })


@app.get("/api/dreams/{dream_id}/data")
async def get_dream_data(request: Request, dream_id: int, db: Session = Depends(get_db)):
    """Get dream data for editing"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    dream = db.query(Dream).filter(Dream.id == dream_id, Dream.user_id == user.id).first()
    
    if not dream:
        return JSONResponse({"success": False, "error": "Dream not found"}, status_code=404)
    
    return JSONResponse({
        "success": True,
        "dream": {
            "id": dream.id,
            "title": dream.title,
            "description": dream.description,
            "target_amount": dream.target_amount,
            "saved_amount": dream.saved_amount,
            "image_url": dream.image_url,
            "category": dream.category,
            "target_date": dream.target_date.strftime("%Y-%m-%d") if dream.target_date else None,
            "priority": dream.priority
        }
    })


@app.get("/api/settings")
async def get_settings(request: Request, db: Session = Depends(get_db)):
    """Get user settings"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    return JSONResponse({
        "user": {
            "monthly_budget": user.monthly_budget,
            "daily_budget_limit": user.daily_budget_limit,
            "preferred_language": user.preferred_language,
            "voice_enabled": user.voice_enabled,
            "voice_mode": user.voice_mode if hasattr(user, 'voice_mode') else False,
            "readability_mode": user.readability_mode,
            "currency": user.currency,
            "login_streak": user.login_streak,
            "ai_name": user.ai_name,
            "ai_persona_mode": user.ai_persona_mode,
            "ai_attitude": user.ai_attitude,
            "ai_style": user.ai_style,
            "incognito_mode": user.incognito_mode if hasattr(user, 'incognito_mode') else False
        }
    })


@app.post("/api/settings")
async def update_settings(
    request: Request,
    db: Session = Depends(get_db)
):
    """Update user settings"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")

    def parse_bool(val):
        if val is None:
            return None
        if isinstance(val, list) and val:
            val = val[-1]
        if isinstance(val, bool):
            return val
        return str(val).lower() in ["true", "1", "on", "yes", "y", "checked"]

    try:
        form = await request.form()
        def last_value(key):
            vals = form.getlist(key)
            return vals[-1] if vals else None

        monthly_budget = last_value("monthly_budget")
        daily_budget_limit = last_value("daily_budget_limit")
        preferred_language = last_value("preferred_language")
        voice_enabled = parse_bool(form.getlist("voice_enabled"))
        voice_mode = parse_bool(form.getlist("voice_mode"))  # TTS mode
        readability_mode = parse_bool(form.getlist("readability_mode"))
        # currency = last_value("currency")  # Removed: User requested only AZN
        ai_name = last_value("ai_name")
        ai_persona_mode = last_value("ai_persona_mode")
        ai_attitude = last_value("ai_attitude")
        ai_style = last_value("ai_style")
        
        # Visual Preferences
        theme = last_value("theme")
        incognito_mode = parse_bool(form.getlist("incognito_mode"))

        if monthly_budget not in (None, ""):
            try:
                # Clean the value - remove commas and spaces
                budget_str = str(monthly_budget).replace(',', '').replace(' ', '').strip()
                budget_val = float(budget_str)
                
                if budget_val < 100:
                    return JSONResponse({"success": False, "error": "Büdcə minimum 100 AZN olmalıdır"}, status_code=400)
                
                # Enforce AZN currency
                user.monthly_budget = budget_val
                # Ensure user currency is AZN
                if user.currency != "AZN":
                    user.currency = "AZN"
                
                print(f"✅ Monthly budget updated: {budget_val} AZN for user {user.id}")
            except (ValueError, TypeError) as e:
                print(f"❌ Invalid monthly_budget: {monthly_budget}, error: {e}")
                import traceback
                traceback.print_exc()
                return JSONResponse({"success": False, "error": f"Yanlış büdcə dəyəri: {str(e)}"}, status_code=400)

        
        # Handle daily_budget_limit - allow empty string to clear it
        # No maximum limit - user can set any positive value
        if daily_budget_limit is not None and daily_budget_limit != "":
            try:
                daily_val = float(daily_budget_limit)
                if daily_val < 0:
                    raise ValueError("Daily limit cannot be negative")
                
                # Enforce AZN currency
                user.daily_budget_limit = daily_val
                # Ensure user currency is AZN
                if user.currency != "AZN":
                    user.currency = "AZN"
            except (ValueError, TypeError) as e:
                print(f"❌ Invalid daily_budget_limit: {daily_budget_limit}, error: {e}")
                return JSONResponse({"success": False, "error": "Gündəlik limit mənfi ola bilməz. İstənilən müsbət məbləğ daxil edə bilərsiniz."}, status_code=400)
        else:
            # Empty string or None means clear the limit
            user.daily_budget_limit = None

        if preferred_language is not None:
            user.preferred_language = preferred_language
        if voice_enabled is not None:
            user.voice_enabled = voice_enabled
        if voice_mode is not None:
            user.voice_mode = voice_mode
        if readability_mode is not None:
            user.readability_mode = readability_mode
        
        # Enforce AZN currency
        user.currency = "AZN"

        # AI Persona Settings
        if ai_name and ai_name.strip():
            user.ai_name = ai_name.strip()
        if ai_persona_mode is not None:
            user.ai_persona_mode = ai_persona_mode
        if ai_attitude is not None:
            user.ai_attitude = ai_attitude
        if ai_style is not None:
            user.ai_style = ai_style
            
        # Save Visual Preferences
        if theme is not None:
            user.theme = theme
        if incognito_mode is not None:
            user.incognito_mode = incognito_mode

        db.commit()
        db.refresh(user)
        
        print(f"✅ Settings updated successfully for user {user.id}")
        
        return JSONResponse(
            {
                "success": True, 
                "message": "Tənzimləmələr yadda saxlanıldı",
                "user": {
                    "voice_mode": user.voice_mode if hasattr(user, 'voice_mode') else False,
                    "voice_enabled": user.voice_enabled,
                    "readability_mode": user.readability_mode
                }
            },
            headers={"HX-Trigger": "update-stats,settingsUpdated"}
        )
    except Exception as e:
        print(f"❌ Settings Update Error: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse({"success": False, "error": f"Xəta: {str(e)}"}, status_code=500)


# Currency update endpoint removed as per user request (Only AZN allowed)
        if not confirm:
            preview_data = calculate_conversion_preview(user, old_currency, new_currency, db)
            return JSONResponse({
                "preview": True,
                "old_currency": old_currency,
                "new_currency": new_currency,
                "data": preview_data
            })
        
        # Perform actual conversion
        conversion_result = convert_all_amounts(user, old_currency, new_currency, db)
        
        # Update user's currency preference
        user.currency = new_currency
        db.commit()
        
        return JSONResponse({
            "success": True,
            "message": f"Valyuta {old_currency}-dən {new_currency}-ə çevrildi",
            "converted_items": conversion_result
        })
        
    except Exception as e:
        print(f"❌ Currency Update Error: {e}")
        db.rollback()
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


# Currency conversion helpers removed as per user request (Only AZN allowed)




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

@app.get("/api/dashboard-updates")
async def get_dashboard_updates(request: Request, db: Session = Depends(get_db)):
    """Return updated dashboard stats and transaction list for HTMX OOB swap"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Calculate total spending for current month
    now = datetime.now()
    start_of_month = datetime(now.year, now.month, 1)
    
    expenses = db.query(Expense).filter(
        Expense.user_id == user.id,
        Expense.date >= start_of_month
    ).all()
    
    total_spending_azn = sum(e.amount for e in expenses)
    
    # Convert to user's preferred currency for display
    user_currency = user.currency or "AZN"
    # All amounts in AZN (only AZN supported)
    total_spending = total_spending_azn
    monthly_budget_display = user.monthly_budget
    remaining_budget = user.monthly_budget - total_spending_azn
    
    # Category breakdown for live updates (matches main dashboard view)
    category_data = {}
    for exp in expenses:
        category_data[exp.category] = category_data.get(exp.category, 0) + exp.amount
    
    # Calculate budget percentage (use AZN values for calculation to maintain accuracy)
    budget_percentage = 0
    if user.monthly_budget > 0:
        budget_percentage = (total_spending_azn / user.monthly_budget) * 100
        
    # Get recent expenses by creation time so new scans show immediately
    recent_expenses = db.query(Expense).filter(
        Expense.user_id == user.id
    ).order_by(Expense.created_at.desc()).limit(10).all()
    
    return templates.TemplateResponse("partials/dashboard_updates.html", {
        "request": request,
        "user": user,
        "total_spending": total_spending,
        "monthly_budget_display": monthly_budget_display,
        "remaining_budget": remaining_budget,
        "budget_percentage": budget_percentage,
        "category_data": category_data,
        "recent_expenses": recent_expenses,
        "now": now,
        "min": min,
        "float": float,
        "currency_symbol": "₼"
    })


@app.get("/rewards")
def rewards_page(request: Request, db: Session = Depends(get_db)):
    """Rewards page - show user's achievements and milestones"""
    user = get_current_user(request, db)
    if not user:
        return RedirectResponse("/login", status_code=303)
    
    # Get user's claimed rewards
    from models import UserReward
    claimed_rewards = db.query(UserReward).filter(UserReward.user_id == user.id).order_by(UserReward.claimed_at.desc()).all()
    
    # Count by type
    reward_counts = {}
    for reward in claimed_rewards:
        reward_counts[reward.reward_type] = reward_counts.get(reward.reward_type, 0) + 1
    
    return templates.TemplateResponse("rewards.html", {
        "request": request,
        "user": user,
        "claimed_rewards": claimed_rewards,
        "reward_counts": reward_counts
    })


@app.get("/api/rewards-data")
async def get_rewards_data(request: Request, db: Session = Depends(get_db)):
    """Get rewards data for React frontend"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Get user's claimed rewards
    from models import UserReward
    claimed_rewards = db.query(UserReward).filter(UserReward.user_id == user.id).order_by(UserReward.claimed_at.desc()).all()
    
    # Count by type
    reward_counts = {}
    for reward in claimed_rewards:
        reward_counts[reward.reward_type] = reward_counts.get(reward.reward_type, 0) + 1
    
    # Format claimed rewards
    formatted_rewards = [
        {
            "id": reward.id,
            "reward_type": reward.reward_type,
            "reward_name": reward.reward_name,
            "coins_spent": reward.coins_spent,
            "claimed_at": reward.claimed_at.isoformat() if reward.claimed_at else None
        }
        for reward in claimed_rewards
    ]
    
    return JSONResponse({
        "success": True,
        "user": {
            "coins": user.coins if hasattr(user, 'coins') and user.coins is not None else 0,
        },
        "claimed_rewards": formatted_rewards,
        "reward_counts": reward_counts
    })


@app.post("/api/claim-reward")
async def claim_reward(
    request: Request,
    reward_type: str = Form(...),
    db: Session = Depends(get_db)
):
    """Claim a reward and deduct coins"""
    user = get_current_user(request, db)
    if not user:
        return JSONResponse({"success": False, "error": "Authentication required"}, status_code=401)
    
    # Define rewards
    rewards = {
        "bronze": {"name": "1 Coffee Kuponu", "cost": 100},
        "silver": {"name": "3 Coffee Kuponu", "cost": 200},
        "gold": {"name": "5 AZN pul mükafatı", "cost": 500},
        "platinum": {"name": "Premium 1 ay + 20 AZN", "cost": 5000}
    }
    
    if reward_type not in rewards:
        return JSONResponse({"success": False, "error": "Invalid reward type"}, status_code=400)
    
    reward_info = rewards[reward_type]
    cost = reward_info["cost"]
    
    # Check if user has enough coins
    if user.coins < cost:
        return JSONResponse({
            "success": False,
            "error": f"Kifayət qədər coin yoxdur. Lazım: {cost}, Sizin: {user.coins}"
        }, status_code=400)
    
    # Deduct coins
    user.coins -= cost
    
    # Create reward record
    from models import UserReward
    claimed_reward = UserReward(
        user_id=user.id,
        reward_type=reward_type,
        reward_name=reward_info["name"],
        coins_spent=cost
    )
    db.add(claimed_reward)
    db.commit()
    db.refresh(user)
    
    return JSONResponse({
        "success": True,
        "message": f"🎉 {reward_info['name']} alındı!",
        "remaining_coins": user.coins,
        "new_balance": user.coins,  # For frontend update
        "reward_name": reward_info["name"],
        "show_coupon": "Coffee" in reward_info["name"]
    }, headers={"HX-Trigger": "update-stats"})


@app.get("/settings", response_class=HTMLResponse)
async def settings_page(request: Request, db: Session = Depends(get_db)):
    """Settings page"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Get currency symbol
    user_currency = user.currency or "AZN"
    currency_symbol = "₼"  # Only AZN supported
    
    return templates.TemplateResponse("settings.html", {
        "request": request,
        "user": user,
        "currency_symbol": currency_symbol,
        "min": min,
        "max": max
    })


@app.get("/api/export-pdf")
async def export_pdf(
    request: Request,
    month: Optional[int] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Export monthly report as PDF"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        # Default to current month/year if not specified
        now = datetime.utcnow()
        target_month = month if month else now.month
        target_year = year if year else now.year
        
        # Generate PDF
        pdf_bytes = pdf_generator.generate_monthly_report(user.id, target_month, target_year, db)
        
        # Create filename
        filename = f"finmate-report-{target_year}-{target_month:02d}.pdf"
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        print(f"❌ PDF Export Error: {e}")
        return JSONResponse({"error": str(e)}, status_code=500)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8200, reload=True)
