"""Authentication helper functions"""
from fastapi import Request, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
import hashlib
from models import User


def hash_password(password: str) -> str:
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, password_hash: str) -> bool:
    """Verify password against hash"""
    return hash_password(password) == password_hash


def get_current_user(request: Request, db: Session) -> Optional[User]:
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


def require_auth(request: Request, db: Session) -> User:
    """Require authentication, raise exception if not authenticated"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user

