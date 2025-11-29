"""Chat routes"""
from fastapi import Request, Depends, Form, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import datetime
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
    
    # Return JSON for React frontend - return raw AI response (frontend will handle markdown rendering)
    return JSONResponse({
        "success": True,
        "response": ai_response,  # Raw markdown - frontend will convert to HTML
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


