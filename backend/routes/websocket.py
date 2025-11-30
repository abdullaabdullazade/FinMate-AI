"""WebSocket routes for real-time notifications"""
from fastapi import WebSocket, WebSocketDisconnect, Depends
from starlette.websockets import WebSocketDisconnect as StarletteWebSocketDisconnect
from sqlalchemy.orm import Session
from database import get_db
from models import User, Expense
from utils.auth import get_current_user
from datetime import datetime, timedelta, date as date_type
from typing import Dict, List
import json

# Active WebSocket connections
active_connections: Dict[int, List[WebSocket]] = {}

async def get_user_from_websocket(websocket: WebSocket, db: Session):
    """Get user from WebSocket query params or cookies"""
    # Try to get user_id from query params
    user_id = websocket.query_params.get("user_id")
    if user_id:
        user = db.query(User).filter(User.id == int(user_id)).first()
        if user:
            return user
    
    # Fallback: try to get from session/cookies
    # For now, we'll use a simple approach - get from query params
    return None

async def connect_websocket(websocket: WebSocket, user_id: int):
    """Add WebSocket connection for user"""
    if user_id not in active_connections:
        active_connections[user_id] = []
    active_connections[user_id].append(websocket)

async def disconnect_websocket(websocket: WebSocket, user_id: int):
    """Remove WebSocket connection for user"""
    if user_id in active_connections:
        if websocket in active_connections[user_id]:
            active_connections[user_id].remove(websocket)
        if not active_connections[user_id]:
            del active_connections[user_id]

async def send_notification_to_user(user_id: int, notification: dict):
    """Send notification to all WebSocket connections of a user"""
    if user_id in active_connections:
        disconnected = []
        for websocket in active_connections[user_id]:
            try:
                # Check if connection is still open
                if websocket.client_state.name == "CONNECTED":
                    await websocket.send_json(notification)
            except (WebSocketDisconnect, StarletteWebSocketDisconnect, Exception) as e:
                # Connection closed or other error - silently handle it
                # This is normal when client disconnects
                disconnected.append(websocket)
        
        # Remove disconnected connections
        for ws in disconnected:
            try:
                await disconnect_websocket(ws, user_id)
            except:
                pass

async def send_single_notification_to_user(user_id: int, notification: dict, db: Session):
    """Send single notification and refresh all notifications"""
    # Send single notification
    await send_notification_to_user(user_id, {
        "type": "new_notification",
        "notification": notification
    })
    
    # Also refresh all notifications
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        all_notifications = await generate_notifications_for_user(user, db)
        await send_notification_to_user(user_id, {
            "type": "notifications",
            "notifications": all_notifications,
            "count": len(all_notifications)
        })

async def generate_notifications_for_user(user: User, db: Session) -> List[dict]:
    """Generate notifications for user (same logic as notifications.py)"""
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
    
    # Maaşın yarısını ayın ilk 10 günündə xərcləmə xəbərdarlığı
    if user.monthly_income and user.monthly_income > 0:
        current_day = now.day
        salary_half = user.monthly_income / 2
        
        if current_day <= 10 and total_spending >= salary_half:
            remaining_days = 30 - current_day
            daily_allowance = (user.monthly_income - total_spending) / remaining_days if remaining_days > 0 else 0
            notifications.append({
                "icon": "🚨",
                "color": "red-500",
                "message": f"Diqqət! Ayın ilk 10 günündə maaşının yarısını ({total_spending:.0f} AZN) xərcləmisən. Qənaət etməsən ac qalacaqsan! Gündəlik limit: {daily_allowance:.0f} AZN"
            })
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
        weekly_budget = user.monthly_income / 4
        if week_total > weekly_budget * 1.2:
            notifications.append({
                "icon": "📊",
                "color": "amber-500",
                "message": f"Bu həftə həftəlik büdcənizi ({weekly_budget:.0f} AZN) 20% artıq keçmisiniz. Cari: {week_total:.0f} AZN"
            })
    
    # Kategoriya əsaslı xəbərdarlıqlar
    if expenses:
        category_totals = {}
        for exp in expenses:
            category = exp.category or exp.category_name or "Digər"
            category_totals[category] = category_totals.get(category, 0) + exp.amount
        
        if category_totals:
            top_category = max(category_totals.items(), key=lambda x: x[1])
            top_category_name, top_category_amount = top_category
            top_category_percentage = (top_category_amount / total_spending * 100) if total_spending > 0 else 0
            
            if top_category_percentage > 50:
                notifications.append({
                    "icon": "🎯",
                    "color": "blue-500",
                    "message": f"'{top_category_name}' kateqoriyasına xərclərinizin {top_category_percentage:.0f}%-ni ({top_category_amount:.0f} AZN) xərcləmisiniz. Diversifikasiya edin!"
                })
    
    # Qənaət təklifləri
    if user.monthly_income and user.monthly_income > 0:
        savings_potential = user.monthly_income - total_spending
        if savings_potential > user.monthly_income * 0.2 and now.day >= 20:
            notifications.append({
                "icon": "💰",
                "color": "green-500",
                "message": f"Əla! Bu ay {savings_potential:.0f} AZN qənaət edə bilərsən. Arzu qutusuna əlavə et!"
            })
    
    # Günün sonu xəbərdarlığı
    today = date_type.today()
    today_expenses = db.query(Expense).filter(
        Expense.user_id == user.id,
        Expense.date >= today,
        Expense.date < today + timedelta(days=1)
    ).all()
    today_total = sum(exp.amount for exp in today_expenses)
    
    if user.monthly_income and user.monthly_income > 0:
        daily_budget = user.monthly_income / 30
        if today_total > daily_budget * 1.5:
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
    
    return notifications

from config import app

@app.websocket("/ws/notifications")
async def websocket_notifications(websocket: WebSocket, db: Session = Depends(get_db)):
    """WebSocket endpoint for real-time notifications"""
    await websocket.accept()
    
    # Get user_id from query params
    user_id = websocket.query_params.get("user_id")
    if not user_id:
        await websocket.close(code=1008, reason="User ID required")
        return
    
    try:
        user_id = int(user_id)
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            await websocket.close(code=1008, reason="User not found")
            return
        
        # Connect WebSocket
        await connect_websocket(websocket, user_id)
        
        # Send initial notifications
        try:
            notifications = await generate_notifications_for_user(user, db)
            if websocket.client_state.name == "CONNECTED":
                await websocket.send_json({
                    "type": "notifications",
                    "notifications": notifications,
                    "count": len(notifications)
                })
        except (WebSocketDisconnect, StarletteWebSocketDisconnect, Exception) as e:
            # Client disconnected before we could send - this is normal
            raise WebSocketDisconnect
        
        # Keep connection alive and listen for updates
        while True:
            try:
                # Check if connection is still open
                if websocket.client_state.name != "CONNECTED":
                    break
                
                # Wait for ping or close (with timeout to prevent hanging)
                import asyncio
                try:
                    data = await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
                    if data == "ping":
                        if websocket.client_state.name == "CONNECTED":
                            await websocket.send_text("pong")
                except asyncio.TimeoutError:
                    # Send ping to keep connection alive
                    try:
                        if websocket.client_state.name == "CONNECTED":
                            await websocket.send_text("ping")
                    except:
                        break
            except WebSocketDisconnect:
                break
            except Exception as e:
                # Client disconnected - this is normal
                break
                
    except Exception as e:
        print(f"WebSocket error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        try:
            await disconnect_websocket(websocket, user_id)
        except:
            pass

