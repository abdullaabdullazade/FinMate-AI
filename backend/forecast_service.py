"""
AI Financial Forecasting Service for FinMate AI
Predicts if user will exceed budget before month ends
"""

from sqlalchemy.orm import Session
from sqlalchemy import extract, func
from models import Expense, User
from datetime import datetime
import calendar


class ForecastService:
    """Handles spending prediction and budget forecasting"""
    
    @staticmethod
    def calculate_daily_average(user_id: int, db_session: Session) -> float:
        """Calculate average daily spending for current month"""
        now = datetime.utcnow()
        month_start = datetime(now.year, now.month, 1)
        
        # Get current month's expenses
        total = db_session.query(func.sum(Expense.amount)).filter(
            Expense.user_id == user_id,
            Expense.date >= month_start,
            Expense.date <= now
        ).scalar() or 0.0
        
        # Days elapsed in current month
        days_elapsed = now.day
        
        if days_elapsed == 0:
            return 0.0
        
        return total / days_elapsed
    
    @staticmethod
    def get_forecast(user_id: int, db_session: Session) -> dict:
        """
        Generate comprehensive forecast for user's spending
        
        Returns:
            dict with keys:
                - current_spending: float
                - projected_total: float
                - daily_average: float
                - days_remaining: int
                - danger_level: str (safe/warning/danger)
                - budget: float
                - overspend_amount: float (if projected > budget)
                - suggested_daily_limit: float
                - sufficient_data: bool
        """
        now = datetime.utcnow()
        month_start = datetime(now.year, now.month, 1)
        days_in_month = calendar.monthrange(now.year, now.month)[1]
        days_elapsed = now.day
        days_remaining = days_in_month - days_elapsed
        
        # Get user budget
        user = db_session.query(User).filter(User.id == user_id).first()
        if not user:
            return {"error": "User not found"}
        
        budget = user.monthly_budget
        
        # Get current month's expenses
        expenses = db_session.query(Expense).filter(
            Expense.user_id == user_id,
            Expense.date >= month_start
        ).all()
        
        current_spending = sum(exp.amount for exp in expenses)
        
        # Need at least 3 days of data for meaningful forecast
        if days_elapsed < 3:
            return {
                "current_spending": current_spending,
                "budget": budget,
                "sufficient_data": False,
                "days_elapsed": days_elapsed,
                "message": "Need at least 3 days of spending data for forecast"
            }
        
        # Calculate daily average
        daily_average = current_spending / days_elapsed
        
        # Project end of month total
        projected_total = current_spending + (daily_average * days_remaining)
        
        # Determine danger level
        if projected_total > budget:
            danger_level = "danger"
        elif projected_total > budget * 0.9:
            danger_level = "warning"
        else:
            danger_level = "safe"
        
        # Calculate suggested daily limit for rest of month
        remaining_budget = budget - current_spending
        suggested_daily_limit = remaining_budget / days_remaining if days_remaining > 0 else 0
        
        # Overspend amount (if projected to go over)
        overspend_amount = max(0, projected_total - budget)
        
        # Budget percentage used
        budget_used_percentage = (current_spending / budget * 100) if budget > 0 else 0
        
        return {
            "current_spending": round(current_spending, 2),
            "projected_total": round(projected_total, 2),
            "daily_average": round(daily_average, 2),
            "days_elapsed": days_elapsed,
            "days_remaining": days_remaining,
            "danger_level": danger_level,
            "budget": budget,
            "overspend_amount": round(overspend_amount, 2),
            "suggested_daily_limit": round(suggested_daily_limit, 2),
            "sufficient_data": True,
            "budget_used_percentage": round(budget_used_percentage, 2),
            "days_in_month": days_in_month
        }
    
    @staticmethod
    def get_chart_forecast_data(user_id: int, db_session: Session) -> list:
        """
        Generate forecast data points for chart visualization
        Returns list of {date, projected_amount} for remaining days
        """
        now = datetime.utcnow()
        days_in_month = calendar.monthrange(now.year, now.month)[1]
        
        forecast = ForecastService.get_forecast(user_id, db_session)
        
        if not forecast.get("sufficient_data"):
            return []
        
        daily_avg = forecast["daily_average"]
        current_spending = forecast["current_spending"]
        
        # Generate projection points
        forecast_points = []
        for day in range(now.day + 1, days_in_month + 1):
            days_from_now = day - now.day
            projected_amount = current_spending + (daily_avg * days_from_now)
            forecast_points.append({
                "day": day,
                "projected_amount": round(projected_amount, 2)
            })
        
        return forecast_points


# Singleton instance
forecast_service = ForecastService()
