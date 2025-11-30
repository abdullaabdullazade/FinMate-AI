"""AI Notification Generator - Hər hərəkətdə AI bildirişi yaradır"""
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, date as date_type
from models import Expense, Income, User
from utils.calculations import build_db_context
from ai_service import ai_service
import re


async def generate_ai_notification(
    db: Session,
    user: User,
    action_type: str,  # "scan", "manual_expense", "voice_expense", "income"
    action_data: dict  # {"merchant": "...", "amount": 0.0, "category": "..."}
) -> dict:
    """
    Hər hərəkətdə AI bildirişi yaradır
    
    Args:
        db: Database session
        user: User object
        action_type: Hərəkət növü ("scan", "manual_expense", "voice_expense", "income")
        action_data: Hərəkət məlumatları (merchant, amount, category, etc.)
    
    Returns:
        dict: {"icon": "...", "color": "...", "message": "..."}
    """
    try:
        # İstifadəçinin maliyyə vəziyyətini analiz et
        db_context = build_db_context(db, user.id)
        
        # Qalan pulu hesabla
        total_spending = db_context.get('total_spending', 0)
        monthly_budget = db_context.get('budget', 0)
        monthly_income = user.monthly_income or 0
        
        # Qalan pul hesabla
        if monthly_income > 0:
            remaining_money = monthly_income - total_spending
        elif monthly_budget > 0:
            remaining_money = monthly_budget - total_spending
        else:
            remaining_money = 0
        
        # Büdcə istifadəsi
        budget_percentage = (total_spending / monthly_budget * 100) if monthly_budget > 0 else 0
        income_percentage = (total_spending / monthly_income * 100) if monthly_income > 0 else 0
        
        # Bu ayın günü
        current_day = datetime.utcnow().day
        days_in_month = 30  # Təxmini
        
        # Gündəlik orta xərcləmə
        daily_avg_spending = total_spending / current_day if current_day > 0 else 0
        daily_budget = monthly_income / days_in_month if monthly_income > 0 else (monthly_budget / days_in_month if monthly_budget > 0 else 0)
        
        # Son 7 günün xərcləri
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_expenses = db.query(Expense).filter(
            Expense.user_id == user.id,
            Expense.date >= week_ago
        ).all()
        week_spending = sum(exp.amount for exp in recent_expenses)
        
        # Kategoriya analizi
        category_breakdown = db_context.get('category_breakdown', {})
        top_category = max(category_breakdown.items(), key=lambda x: x[1])[0] if category_breakdown else "Digər"
        top_category_amount = category_breakdown.get(top_category, 0) if category_breakdown else 0
        
        # Hərəkət məlumatları
        action_amount = action_data.get('amount', 0)
        action_merchant = action_data.get('merchant', 'Unknown')
        action_category = action_data.get('category', 'Digər')
        
        # AI prompt yarat
        if action_type == "income":
            ai_prompt = f"""Sən FinMate AI-sən. İstifadəçi yeni gəlir əlavə etdi:
- Mənbə: {action_merchant}
- Məbləğ: {action_amount:.2f} AZN

İstifadəçinin cari maliyyə vəziyyəti:
- Bu ay ümumi xərcləmə: {total_spending:.2f} AZN
- Aylıq gəlir: {monthly_income:.2f} AZN
- Qalan pul: {remaining_money:.2f} AZN
- Gəlir istifadəsi: {income_percentage:.1f}%
- Bu ayın {current_day}-ci günü

Əgər istifadəçi yaxşı vəziyyətdədirsə (qalan pul çoxdur, məntiqli xərcləyir) - müsbət həvəsləndirici bildiriş yaz.
Əgər pis vəziyyətdədirsə (qalan pul azdır, çox xərcləyir) - mənfi xəbərdarlıq bildirişi yaz.
Əgər normal vəziyyətdədirsə - normal məsləhət bildirişi yaz.

Cavabı yalnız Azərbaycan dilində yaz, qısa və effektiv olsun (maksimum 2 cümlə). Emoji istifadə et.
Cavabı yalnız bildiriş mətnini yaz, başqa heç nə yazma."""
        else:
            ai_prompt = f"""Sən FinMate AI-sən. İstifadəçi yeni xərc əlavə etdi:
- Mağaza: {action_merchant}
- Məbləğ: {action_amount:.2f} AZN
- Kateqoriya: {action_category}

İstifadəçinin cari maliyyə vəziyyəti:
- Bu ay ümumi xərcləmə: {total_spending:.2f} AZN
- Aylıq büdcə/gəlir: {max(monthly_budget, monthly_income):.2f} AZN
- Qalan pul: {remaining_money:.2f} AZN
- Büdcə istifadəsi: {budget_percentage:.1f}%
- Bu ayın {current_day}-ci günü
- Gündəlik orta xərcləmə: {daily_avg_spending:.2f} AZN (normal: {daily_budget:.2f} AZN)
- Son 7 günün xərcləri: {week_spending:.2f} AZN
- Ən çox xərclənən kateqoriya: {top_category} ({top_category_amount:.2f} AZN)

Əgər istifadəçi yaxşı xərcləyirsə (qalan pul çoxdur, məntiqli xərcləyir, büdcəni aşmır) - müsbət həvəsləndirici bildiriş yaz.
Əgər pis xərcləyirsə (qalan pul azdır, çox xərcləyir, büdcəni aşıb, mənasız yerlərə xərcləyir) - mənfi xəbərdarlıq bildirişi yaz.
Əgər normal xərcləyirsə - normal məsləhət bildirişi yaz.

Cavabı yalnız Azərbaycan dilində yaz, qısa və effektiv olsun (maksimum 2 cümlə). Emoji istifadə et.
Cavabı yalnız bildiriş mətnini yaz, başqa heç nə yazma."""
        
        # AI ilə bildiriş yarat
        ai_notification = ai_service.chat_with_cfo(
            ai_prompt,
            db_context,
            None,  # Chat history yoxdur
            "az",
            user
        )
        
        # AI cavabını təmizlə (HTML tag-ləri və markdown-u sil)
        ai_notification = re.sub(r'<[^>]+>', '', ai_notification)  # HTML tag-ləri sil
        ai_notification = re.sub(r'\*\*([^*]+)\*\*', r'\1', ai_notification)  # Bold markdown sil
        ai_notification = re.sub(r'\*([^*]+)\*', r'\1', ai_notification)  # Italic markdown sil
        ai_notification = ai_notification.strip()
        
        # İkon və rəng seç (xərcləmə vəziyyətinə görə)
        if action_type == "income":
            # Gəlir əlavə edildikdə - həmişə müsbət
            notification_icon = "💰"
            notification_color = "green-500"
        else:
            # Xərc əlavə edildikdə - vəziyyətə görə
            if remaining_money < 0 or budget_percentage > 100:
                # Qalan pul yoxdur və ya büdcə aşılıb - qırmızı xəbərdarlıq
                notification_icon = "🚨"
                notification_color = "red-500"
            elif remaining_money < (monthly_income * 0.2) or budget_percentage > 80:
                # Qalan pul azdır və ya büdcəyə yaxınlaşır - sarı xəbərdarlıq
                notification_icon = "⚡"
                notification_color = "amber-500"
            elif remaining_money > (monthly_income * 0.5) or budget_percentage < 50:
                # Qalan pul çoxdur və ya büdcə yarıdan az istifadə olunub - yaşıl həvəsləndirmə
                notification_icon = "✅"
                notification_color = "green-500"
            else:
                # Normal vəziyyət - mavi məsləhət
                notification_icon = "💡"
                notification_color = "blue-500"
        
        return {
            "icon": notification_icon,
            "color": notification_color,
            "message": ai_notification
        }
        
    except Exception as e:
        print(f"AI notification generation error: {e}")
        import traceback
        traceback.print_exc()
        
        # Fallback bildiriş
        if action_type == "income":
            return {
                "icon": "💰",
                "color": "green-500",
                "message": f"Gəlir əlavə edildi: {action_data.get('merchant', 'Unknown')} - {action_data.get('amount', 0):.2f} AZN"
            }
        else:
            return {
                "icon": "📊",
                "color": "blue-500",
                "message": f"Xərc əlavə edildi: {action_data.get('merchant', 'Unknown')} - {action_data.get('amount', 0):.2f} AZN"
            }

