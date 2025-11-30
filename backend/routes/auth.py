"""Authentication routes"""
from fastapi import Request, Depends, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from database import get_db
from models import User
from config import app
from utils.auth import hash_password, verify_password


@app.post("/api/login")
async def login(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    """Handle login - JSON only for React frontend"""
    user = db.query(User).filter(User.username == username).first()
    
    # Check for demo user (password: "demo")
    if username == "demo" and password == "demo":
        user = db.query(User).filter(User.username == "demo").first()
        if not user:
            user = User(username="demo", monthly_budget=3000.0, password_hash=None)
            db.add(user)
            db.commit()
            db.refresh(user)
        request.session["user_id"] = user.id
        
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
    
    # Check for regular users
    if not user or not user.password_hash:
            return JSONResponse({
                "success": False,
                "error": "İstifadəçi adı və ya şifrə yanlışdır"
            }, status_code=401)
    
    if not verify_password(password, user.password_hash):
            return JSONResponse({
                "success": False,
                "error": "İstifadəçi adı və ya şifrə yanlışdır"
            }, status_code=401)
    
    request.session["user_id"] = user.id
    
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




@app.post("/api/signup")
async def signup(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    confirm_password: str = Form(...),
    db: Session = Depends(get_db)
):
    """Handle signup - JSON only for React frontend"""
    # Validation
    if password != confirm_password:
            return JSONResponse({
                "success": False,
                "error": "Şifrələr uyğun gəlmir"
            }, status_code=400)
    
    if len(password) < 4:
            return JSONResponse({
                "success": False,
                "error": "Şifrə ən azı 4 simvol olmalıdır"
            }, status_code=400)
    
    if len(username) < 3:
            return JSONResponse({
                "success": False,
                "error": "İstifadəçi adı ən azı 3 simvol olmalıdır"
            }, status_code=400)
    
    # Check if user exists
    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user:
            return JSONResponse({
                "success": False,
                "error": "Bu istifadəçi adı artıq mövcuddur"
            }, status_code=400)
    
    # Create new user
    password_hash = hash_password(password)
    new_user = User(
        username=username,
        password_hash=password_hash,
        monthly_budget=50.0
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return JSONResponse({
            "success": True,
            "message": "Qeydiyyat uğurla tamamlandı",
            "user": {
                "id": new_user.id,
                "username": new_user.username
            }
        })


@app.get("/logout")
async def logout(request: Request):
    """Logout user"""
    request.session.clear()
    return JSONResponse({
        "success": True,
        "message": "Logged out successfully"
    })

