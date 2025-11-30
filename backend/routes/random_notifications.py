"""Random notifications scheduler - Ayrı vaxtda random bildirişlər göndərir"""
import asyncio
from datetime import datetime
from sqlalchemy.orm import Session
from database import get_db
from models import User
from routes.websocket import send_notification_to_user, active_connections
import random

# Random təkliflər siyahısı
RANDOM_SUGGESTIONS = [
    {
        "icon": "🛒",
        "color": "blue-500",
        "message": "Bu məhsulu daha ucuza bu mağazada ala bilərsiniz: Bravo Market - 15% endirim var!"
    },
    {
        "icon": "💡",
        "color": "green-500",
        "message": "Qənaət məsləhəti: Bu kateqoriyada həftəlik alış-veriş edərək 20% qənaət edə bilərsiniz!"
    },
    {
        "icon": "🎁",
        "color": "purple-500",
        "message": "Xüsusi təklif: Bu ay 3 dəfə scan edəndə bonus coin qazanacaqsınız!"
    },
    {
        "icon": "📱",
        "color": "cyan-500",
        "message": "Yeni funksiya: AI məsləhəti ilə xərclərinizi optimallaşdırın və daha çox qənaət edin!"
    },
    {
        "icon": "⭐",
        "color": "yellow-500",
        "message": "Təbriklər! Bu ay 10+ qəbz scan etmisiniz. Davam edin və daha çox coin qazanın!"
    },
    {
        "icon": "🏆",
        "color": "orange-500",
        "message": "Siz bu ay ən yaxşı qənaət edən istifadəçilərdən birisiniz! Təbriklər!"
    },
    {
        "icon": "🔔",
        "color": "pink-500",
        "message": "Xatırlatma: Abunəliklərinizi yoxlayın - bəziləri istifadə olunmur və ləğv edilə bilər!"
    },
    {
        "icon": "💎",
        "color": "indigo-500",
        "message": "Premium üzvlük: Premium üzvlər üçün xüsusi təkliflər və cashback proqramı mövcuddur!"
    }
]

async def send_random_notifications():
    """Hər 10 dəqiqədə bir random bildiriş göndər (yalnız aktiv WebSocket connection-lar üçün)"""
    from database import SessionLocal
    
    while True:
        try:
            await asyncio.sleep(600)  # 10 dəqiqə gözlə
            
            # Aktiv connection-lar üçün random bildiriş göndər
            if active_connections:
                db = SessionLocal()
                try:
                    for user_id in list(active_connections.keys()):
                        # Yalnız 20% ehtimalla göndər (çox tez-tez gəlməsin)
                        if random.random() < 0.2:
                            user = db.query(User).filter(User.id == user_id).first()
                            if user:
                                # Random təklif seç
                                selected_suggestion = random.choice(RANDOM_SUGGESTIONS)
                                
                                # WebSocket vasitəsilə göndər
                                await send_notification_to_user(user_id, {
                                    "type": "new_notification",
                                    "notification": selected_suggestion
                                })
                finally:
                    db.close()
        except Exception as e:
            print(f"Random notification error: {e}")
            await asyncio.sleep(60)  # Xəta olduqda 1 dəqiqə gözlə

# Background task kimi başlat
def start_random_notifications():
    """Random bildirişlər task-ını başlat"""
    asyncio.create_task(send_random_notifications())

