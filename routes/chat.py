"""Chat routes"""
from fastapi import Request, Depends, Form, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import datetime
import math
from database import get_db
from models import User, ChatMessage
from config import app
from utils.auth import get_current_user
from utils.calculations import build_db_context
from ai_service import ai_service
from gamification import gamification


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
    
    # Premium olmayan istifadəçilər üçün gündəlik 30 mesaj limiti
    if not user.is_premium:
        from datetime import date, time
        today = date.today()
        
        # Bu gün göndərilən mesajları say (cari mesaj daxil olmadan)
        today_start = datetime.combine(today, time.min)
        today_messages = db.query(ChatMessage).filter(
            ChatMessage.user_id == user.id,
            ChatMessage.role == "user",
            ChatMessage.timestamp >= today_start
        ).count()
        
        # Limit: 30 mesaj (30 mesaj göndərə bilər)
        DAILY_MESSAGE_LIMIT = 30
        # Əgər 30 mesaj varsa, 31-ci mesajı blokla
        if today_messages >= DAILY_MESSAGE_LIMIT:
            return JSONResponse({
                "success": False,
                "error": f"Gündəlik mesaj limitinə çatdınız ({DAILY_MESSAGE_LIMIT} mesaj). Premium üzvlük alaraq limitsiz mesaj göndərə bilərsiniz.",
                "daily_messages": today_messages,
                "daily_limit": DAILY_MESSAGE_LIMIT,
                "is_premium": False
            }, status_code=429)
    
    # Save user message (limit yoxlamasından sonra)
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
    
    # Coin sistemi silindi - yalnız gündəlik mesaj limiti var
    # Premium olmayan istifadəçilər üçün gündəlik 30 mesaj limiti kifayətdir
    
    db.commit()
    db.refresh(user)  # Refresh to get updated XP
    
    # Sanitize xp_result to handle inf values
    def sanitize_float(value):
        """Convert inf/nan to None or 0, ensure value is float"""
        if value is None:
            return None
        try:
            val = float(value)
            if math.isinf(val) or math.isnan(val):
                return None  # Return None for inf/nan instead of 0
            return val
        except (ValueError, TypeError):
            return None
    
    # Sanitize xp_result
    sanitized_xp_result = {}
    if xp_result:
        for key, value in xp_result.items():
            if key == "level_info" and isinstance(value, dict):
                # Sanitize level_info dict
                sanitized_level_info = {}
                for level_key, level_value in value.items():
                    if level_key == "max_xp":
                        # Replace inf with None or a large number
                        if isinstance(level_value, float) and math.isinf(level_value):
                            sanitized_level_info[level_key] = None  # or 999999
                        else:
                            sanitized_level_info[level_key] = sanitize_float(level_value) if isinstance(level_value, (int, float)) else level_value
                    elif level_key == "progress_percentage":
                        sanitized_level_info[level_key] = sanitize_float(level_value) if isinstance(level_value, (int, float)) else level_value
                    else:
                        sanitized_level_info[level_key] = level_value
                sanitized_xp_result[key] = sanitized_level_info
            elif isinstance(value, (int, float)):
                sanitized_xp_result[key] = sanitize_float(value)
            else:
                sanitized_xp_result[key] = value
    
    # Premium olmayan istifadəçilər üçün gündəlik mesaj sayını qaytar
    # Hər mesaj yazıldıqca limit azalır və gündəlik yenilənir
    daily_messages = None
    daily_limit = None
    if not user.is_premium:
        from datetime import date, time
        today = date.today()
        today_start = datetime.combine(today, time.min)
        # Bu gün göndərilən mesajları say (cari mesaj daxil olmaqla)
        daily_messages = db.query(ChatMessage).filter(
            ChatMessage.user_id == user.id,
            ChatMessage.role == "user",
            ChatMessage.timestamp >= today_start
        ).count()
        daily_limit = 30
    
    # Return JSON for React frontend - return raw AI response (frontend will handle markdown rendering)
    return JSONResponse({
        "success": True,
        "response": ai_response,  # Raw markdown - frontend will convert to HTML
        "user_message": message,
        "xp_awarded": sanitized_xp_result.get("xp_awarded", 0) if sanitized_xp_result else 0,
        "xp_result": sanitized_xp_result,
        "is_premium": user.is_premium,
        "daily_messages": daily_messages,  # Gündəlik mesaj sayı (hər mesaj yazıldıqca artır)
        "daily_limit": daily_limit  # Gündəlik limit (30 mesaj)
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


