from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=True)  # Hashed password (nullable for demo user)
    monthly_income = Column(Float, nullable=True)  # Monthly salary/income
    monthly_budget = Column(Float, default=0.0)
    
    # Gamification fields
    xp_points = Column(Integer, default=0)
    level_title = Column(String, default="Rookie")
    last_rewarded_month = Column(String, nullable=True)  # Format: "YYYY-MM"
    
    # User preferences
    preferred_language = Column(String, default="az")  # az
    voice_enabled = Column(Boolean, default=True)
    voice_mode = Column(Boolean, default=False)  # TTS mode - text-to-speech enabled
    daily_budget_limit = Column(Float, nullable=True)
    currency = Column(String, default="AZN")  # Display/Base currency
    personality_mode = Column(String, default="normal")  # normal, mom, strict
    is_premium = Column(Boolean, default=False)  # Premium subscription status
    readability_mode = Column(Boolean, default=False)  # Accessibility mode for vision-impaired users
    coins = Column(Integer, default=0)  # FinMate Coins for reward system
    ai_tokens = Column(Integer, default=10)  # AI features tokens (voice command, receipt scan, etc.)
    
    # AI Persona fields (NEW)
    ai_name = Column(String, default="FinMate")  # Customizable AI name
    ai_attitude = Column(String, default="Professional")  # Strict, Funny, Sarcastic, Supportive
    ai_style = Column(String, default="Formal")  # Slang, Shakespearean, Dialect, Short
    ai_persona_mode = Column(String, default="Auto")  # Auto (behavioral profiling) or Manual
    
    # Tracking fields
    login_streak = Column(Integer, default=0)
    last_login_date = Column(Date, nullable=True)
    
    # Visual Preferences (Server-side persistence)
    theme = Column(String, default="default")  # gold, midnight, ocean, etc.
    incognito_mode = Column(Boolean, default=False)  # Hide amounts
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    expenses = relationship("Expense", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")
    xp_logs = relationship("XPLog", back_populates="user", cascade="all, delete-orphan")
    dreams = relationship("Dream", back_populates="user", cascade="all, delete-orphan")
    
    def calculate_current_month_spending(self):
        """Calculate total spending for current month"""
        from datetime import datetime
        now = datetime.utcnow()
        month_start = datetime(now.year, now.month, 1)
        
        total = 0
        for expense in self.expenses:
            if expense.date >= month_start:
                total += expense.amount
        return total
    
    def __repr__(self):
        return f"<User(username='{self.username}', budget={self.monthly_budget})>"


class Expense(Base):
    __tablename__ = "expenses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    merchant = Column(String, nullable=False)
    category = Column(String, nullable=False)  # Food, Transport, Shopping, Bills, etc.
    date = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_subscription = Column(Boolean, default=False)
    items = Column(JSON, nullable=True)  # For itemized receipts: [{"name": "Burger", "price": 5.99}, ...]
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="expenses")
    
    def __repr__(self):
        return f"<Expense(merchant='{self.merchant}', amount={self.amount}, category='{self.category}')>"


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String, nullable=False)  # 'user' or 'ai'
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="chat_messages")
    
    def __repr__(self):
        return f"<ChatMessage(role='{self.role}', content='{self.content[:30]}...')>"


class XPLog(Base):
    __tablename__ = "xp_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Integer, nullable=False)
    action_type = Column(String, nullable=False)  # 'manual_expense', 'scan_receipt', 'chat', 'login_streak'
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="xp_logs")
    
    def __repr__(self):
        return f"<XPLog(user_id={self.user_id}, action='{self.action_type}', xp={self.amount})>"


class UserReward(Base):
    __tablename__ = "user_rewards"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reward_type = Column(String, nullable=False)  # bronze, silver, gold, platinum
    reward_name = Column(String, nullable=False)  # e.g., "1 Coffee Kuponu"
    coins_spent = Column(Integer, nullable=False)  # How many coins spent
    claimed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationship
    user = relationship("User", backref="claimed_rewards")
    
    def __repr__(self):
        return f"<UserReward(user_id={self.user_id}, reward='{self.reward_name}', coins={self.coins_spent})>"


class Wish(Base):
    __tablename__ = "wishes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    url = Column(String, nullable=True)
    price = Column(Float, nullable=True)
    locked_until = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Dream(Base):
    __tablename__ = "dreams"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    target_amount = Column(Float, nullable=False)
    saved_amount = Column(Float, default=0.0)
    image_url = Column(String, nullable=True)  # URL to dream image
    category = Column(String, nullable=True)  # Travel, Gadget, Car, House, etc.
    target_date = Column(Date, nullable=True)  # Optional target date
    priority = Column(Integer, default=1)  # 1-5 priority level
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="dreams")
    
    def __repr__(self):
        return f"<Dream(title='{self.title}', saved={self.saved_amount}/{self.target_amount})>"


class Income(Base):
    __tablename__ = "incomes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    source = Column(String, nullable=False)  # "Salary", "Freelance", "Bonus", "Other", etc.
    description = Column(Text, nullable=True)  # Optional description
    date = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_recurring = Column(Boolean, default=False)  # Is this a recurring income (like salary)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", backref="incomes")
    
    def __repr__(self):
        return f"<Income(source='{self.source}', amount={self.amount}, date={self.date})>"
