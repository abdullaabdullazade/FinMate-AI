from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from models import Base, User, Expense, ChatMessage, XPLog, Dream, Income
from datetime import datetime, timedelta
import random

# SQLite Database Configuration
DATABASE_URL = "sqlite:///./finmate.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database and create tables, preserving existing data"""
    Base.metadata.create_all(bind=engine)
    ensure_schema()
    print("✅ Database initialized")


def ensure_schema():
    """Ensure new columns exist without wiping data"""
    conn = engine.raw_connection()
    cursor = conn.cursor()

    # Helper to check and add missing column
    def add_column_if_missing(table, column_def):
        cursor.execute(f"PRAGMA table_info('{table}')")
        columns = [row[1] for row in cursor.fetchall()]
        col_name = column_def.split()[0]
        if col_name not in columns:
            cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column_def}")

    # User table columns (keeps existing data intact)
    add_column_if_missing("users", "xp_points INTEGER DEFAULT 0")
    add_column_if_missing("users", "level_title VARCHAR DEFAULT 'Rookie'")
    add_column_if_missing("users", "preferred_language VARCHAR DEFAULT 'az'")
    add_column_if_missing("users", "voice_enabled BOOLEAN DEFAULT 1")
    add_column_if_missing("users", "daily_budget_limit FLOAT")
    add_column_if_missing("users", "currency VARCHAR DEFAULT 'AZN'")
    add_column_if_missing("users", "personality_mode VARCHAR DEFAULT 'normal'")
    add_column_if_missing("users", "is_premium BOOLEAN DEFAULT 0")
    add_column_if_missing("users", "readability_mode BOOLEAN DEFAULT 0")
    add_column_if_missing("users", "ai_name VARCHAR DEFAULT 'FinMate'")
    add_column_if_missing("users", "ai_attitude VARCHAR DEFAULT 'Professional'")
    add_column_if_missing("users", "ai_style VARCHAR DEFAULT 'Formal'")
    add_column_if_missing("users", "ai_persona_mode VARCHAR DEFAULT 'Auto'")
    add_column_if_missing("users", "login_streak INTEGER DEFAULT 0")
    add_column_if_missing("users", "last_login_date DATE")
    add_column_if_missing("users", "last_rewarded_month VARCHAR")
    add_column_if_missing("users", "coins INTEGER DEFAULT 0")
    add_column_if_missing("users", "created_at DATETIME DEFAULT CURRENT_TIMESTAMP")
    add_column_if_missing("users", "password_hash VARCHAR")
    add_column_if_missing("users", "password_hash VARCHAR")
    add_column_if_missing("users", "monthly_income FLOAT")
    
    # Visual Preferences
    add_column_if_missing("users", "theme VARCHAR DEFAULT 'default'")
    add_column_if_missing("users", "incognito_mode BOOLEAN DEFAULT 0")

    # Expense table safety
    add_column_if_missing("expenses", "is_subscription BOOLEAN DEFAULT 0")
    add_column_if_missing("expenses", "items JSON")
    add_column_if_missing("expenses", "notes TEXT")
    add_column_if_missing("expenses", "created_at DATETIME DEFAULT CURRENT_TIMESTAMP")

    # Create incomes table if it doesn't exist
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS incomes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            amount FLOAT NOT NULL,
            source VARCHAR NOT NULL,
            description TEXT,
            date DATETIME NOT NULL,
            is_recurring BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    conn.commit()
    conn.close()


def seed_demo_data():
    """Seed database with realistic AZERBAIJAN market data"""
    db = SessionLocal()
    
    # Check if data already exists
    existing_user = db.query(User).filter(User.username == "demo").first()
    if existing_user:
        print("ℹ️ Demo data already present, skipping seed to preserve operations")
        db.close()
        return
    
    # Create demo user (username: demo, password: demo)
    demo_user = User(
        username="demo",
        password_hash=None,  # Demo user has no password hash (login checks password directly)
        monthly_budget=3000.0,  # 3000 AZN monthly budget
        currency="AZN",
        is_premium=True
    )
    db.add(demo_user)
    db.commit()
    db.refresh(demo_user)
    
    # Real Azerbaijan merchants with categories
    expense_data = [
        # Supermarkets
        {"merchant": "Bravo", "category": "Market", "amount": 89.50, "days_ago": 1, "logo": "🛒"},
        {"merchant": "Araz Market", "category": "Market", "amount": 124.80, "days_ago": 3, "logo": "🛒"},
        {"merchant": "Bolmart", "category": "Market", "amount": 65.30, "days_ago": 7, "logo": "🛒"},
        {"merchant": "Bazarstore", "category": "Market", "amount": 43.20, "days_ago": 10, "logo": "🛒"},
        
        # Food & Dining
        {"merchant": "KFC Baku", "category": "Restoran", "amount": 32.50, "days_ago": 1, "logo": "🍗"},
        {"merchant": "McDonald's 28 May", "category": "Restoran", "amount": 28.90, "days_ago": 2, "logo": "🍔"},
        {"merchant": "Nargile Lounge", "category": "Restoran", "amount": 67.00, "days_ago": 4, "logo": "🍽️"},
        {"merchant": "Coffeemania", "category": "Kafe", "amount": 15.50, "days_ago": 2, "logo": "☕"},
        {"merchant": "Starbucks Park Bulvar", "category": "Kafe", "amount": 18.00, "days_ago": 5, "logo": "☕"},
        
        # Transportation
        {"merchant": "Bolt", "category": "Nəqliyyat", "amount": 8.50, "days_ago": 1, "logo": "🚗"},
        {"merchant": "Uber Baku", "category": "Nəqliyyat", "amount": 12.30, "days_ago": 2, "logo": "🚕"},
        {"merchant": "BakuBus Kart", "category": "Nəqliyyat", "amount": 20.00, "days_ago": 3, "logo": "🚌"},
        {"merchant": "BakuKart Doldurmaq", "category": "Nəqliyyat", "amount": 30.00, "days_ago": 5, "logo": "💳"},
        {"merchant": "SOCAR Benzin", "category": "Nəqliyyat", "amount": 60.00, "days_ago": 6, "logo": "⛽"},
        
        # Mobile & Internet
        {"merchant": "Azercell", "category": "Mobil Operator", "amount": 25.00, "days_ago": 1, "is_subscription": True, "logo": "📱"},
        {"merchant": "Bakcell", "category": "Mobil Operator", "amount": 20.00, "days_ago": 15, "logo": "📱"},
        {"merchant": "Nar Mobile", "category": "Mobil Operator", "amount": 15.00, "days_ago": 8, "logo": "📱"},
        {"merchant": "AzTelecom Internet", "category": "İnternet", "amount": 35.00, "days_ago": 5, "is_subscription": True, "logo": "🌐"},
        
        # Utilities & Services
        {"merchant": "Azərişıq (Elektrik)", "category": "Kommunal", "amount": 45.50, "days_ago": 10, "logo": "⚡"},
        {"merchant": "Azersu (Su)", "category": "Kommunal", "amount": 18.30, "days_ago": 10, "logo": "💧"},
        {"merchant": "Azerigas (Qaz)", "category": "Kommunal", "amount": 28.00, "days_ago": 10, "logo": "🔥"},
        {"merchant": "ASAN Service", "category": "Dövlət Xidməti", "amount": 12.00, "days_ago": 12, "logo": "🏛️"},
        
        # Shopping
        {"merchant": "Park Bulvar", "category": "Alış-veriş", "amount": 156.00, "days_ago": 4, "logo": "🏬"},
        {"merchant": "28 Mall", "category": "Alış-veriş", "amount": 89.50, "days_ago": 8, "logo": "🏬"},
        {"merchant": "Zara Ganjlik Mall", "category": "Geyim", "amount": 198.00, "days_ago": 9, "logo": "👔"},
        {"merchant": "LC Waikiki", "category": "Geyim", "amount": 76.50, "days_ago": 11, "logo": "👕"},
        
        # Online Shopping & Services
        {"merchant": "AliExpress", "category": "Online Alış-veriş", "amount": 45.80, "days_ago": 7, "logo": "📦"},
        {"merchant": "Amazon", "category": "Online Alış-veriş", "amount": 92.00, "days_ago": 14, "logo": "📦"},
        
        # Entertainment
        {"merchant": "Netflix", "category": "Əyləncə", "amount": 15.99, "days_ago": 5, "is_subscription": True, "logo": "🎬"},
        {"merchant": "Spotify", "category": "Əyləncə", "amount": 9.99, "days_ago": 5, "is_subscription": True, "logo": "🎵"},
        {"merchant": "CinemaPlus", "category": "Əyləncə", "amount": 22.00, "days_ago": 6, "logo": "🎥"},
        
        # Pharmacy & Health
        {"merchant": "36.6 Aptek", "category": "Aptек", "amount": 34.50, "days_ago": 8, "logo": "💊"},
        {"merchant": "Mərkəzi Aptek", "category": "Aptек", "amount": 28.00, "days_ago": 13, "logo": "💊"},
        {"merchant": "GymFit Fitness", "category": "İdman", "amount": 80.00, "days_ago": 1, "is_subscription": True, "logo": "💪"},
        
        # Banking & Finance
        {"merchant": "Kapital Bank (Komissiya)", "category": "Bank Xidməti", "amount": 5.00, "days_ago": 3, "logo": "🏦"},
        {"merchant": "M10 Kart Doldurmaq", "category": "E-ödəniş", "amount": 50.00, "days_ago": 4, "logo": "💳"},
    ]
    
    # Add expenses
    for exp_data in expense_data:
        expense = Expense(
            user_id=demo_user.id,
            merchant=exp_data["merchant"],
            category=exp_data["category"],
            amount=exp_data["amount"],
            date=datetime.utcnow() - timedelta(days=exp_data["days_ago"]),
            is_subscription=exp_data.get("is_subscription", False),
            notes=exp_data.get("logo", "💰")  # Store emoji logo in notes field temporarily
        )
        db.add(expense)
    
    # Add welcome chat messages in Azerbaijani
    welcome_msg_user = ChatMessage(
        user_id=demo_user.id,
        role="user",
        content="Salam! Maliyyəmi idarə etməyə kömək edə bilərsənmi?",
        timestamp=datetime.utcnow() - timedelta(minutes=30)
    )
    
    welcome_msg_ai = ChatMessage(
        user_id=demo_user.id,
        role="ai",
        content="👋 Salam! Mən sizin şəxsi maliyyə məsləhətçinizəm. Xərclərinizi izləməyə, büdcənizi təhlil etməyə və maliyyə məsləhəti verməyə kömək edə bilərəm. Məsələn, 'Bu ay neçə manat xərcləmişəm?' və ya 'Market xərclərim nə qədərdir?' kimi suallar verə bilərsiniz.",
        timestamp=datetime.utcnow() - timedelta(minutes=29)
    )
    
    db.add(welcome_msg_user)
    db.add(welcome_msg_ai)
    
    db.commit()
    
    total_amount = sum([exp["amount"] for exp in expense_data])
    print(f"✅ Seeded Azerbaijan market data:")
    print(f"   - {len(expense_data)} real expenses")
    print(f"   - Total spending: {total_amount:.2f} AZN")
    print(f"   - Categories: Market, Restoran, Nəqliyyat, Mobil Operator, Kommunal, və s.")
    db.close()


def reset_demo_data():
    """Clear all data and load curated demo expenses (Starbucks, Uber, Apple, və s.)"""
    db = SessionLocal()
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    demo_user = User(
        username="demo",
        password_hash=None,  # Demo user has no password hash
        monthly_budget=3000.0,
        currency="AZN",
        is_premium=True
    )
    db.add(demo_user)
    db.commit()
    db.refresh(demo_user)

    curated = [
        {"merchant": "Starbucks", "category": "Kafe", "amount": 18.50, "days_ago": 1, "logo": "☕"},
        {"merchant": "Uber", "category": "Nəqliyyat", "amount": 12.30, "days_ago": 1, "logo": "🚗"},
        {"merchant": "Apple Store", "category": "Online Alış-veriş", "amount": 249.00, "days_ago": 2, "logo": "🍎"},
        {"merchant": "Bravo", "category": "Market", "amount": 92.40, "days_ago": 2, "logo": "🛒"},
        {"merchant": "Azercell", "category": "Mobil Operator", "amount": 25.00, "days_ago": 3, "logo": "📱", "is_subscription": True},
        {"merchant": "Netflix", "category": "Əyləncə", "amount": 15.99, "days_ago": 3, "logo": "🎬", "is_subscription": True},
        {"merchant": "GymFit", "category": "İdman", "amount": 60.00, "days_ago": 4, "logo": "💪", "is_subscription": True},
        {"merchant": "Uber", "category": "Nəqliyyat", "amount": 9.70, "days_ago": 4, "logo": "🚗"},
        {"merchant": "Starbucks", "category": "Kafe", "amount": 14.20, "days_ago": 5, "logo": "☕"},
        {"merchant": "Apple Music", "category": "Əyləncə", "amount": 9.99, "days_ago": 5, "logo": "🎧", "is_subscription": True},
    ]

    for exp in curated:
        expense = Expense(
            user_id=demo_user.id,
            merchant=exp["merchant"],
            category=exp["category"],
            amount=exp["amount"],
            date=datetime.utcnow() - timedelta(days=exp["days_ago"]),
            is_subscription=exp.get("is_subscription", False),
            notes=exp.get("logo", "💰")
        )
        db.add(expense)

    db.commit()
    db.close()


if __name__ == "__main__":
    init_db()
    seed_demo_data()
