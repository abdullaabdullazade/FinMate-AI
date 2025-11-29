"""Route handlers"""
from fastapi import Request, Depends, Form, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse, Response
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, date as date_type
from typing import Optional
import base64
from database import get_db
from models import User, Expense, Wish, Dream, Income
from config import app
from utils.auth import get_current_user

from gamification import gamification
from forecast_service import forecast_service
from voice_service import voice_service

@app.put("/api/expenses/{expense_id}")
async def update_expense(
    request: Request,
    expense_id: int,
    merchant: str = Form(...),
    amount: float = Form(...),
    category: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """Update an existing expense"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == user.id).first()
    
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    try:
        expense.merchant = merchant
        expense.amount = amount
        expense.category = category if category else (expense.category or "Digər")  # Keep existing or default to "Digər"
        
        db.commit()
        db.refresh(expense)
        
        # Return JSON for React frontend
        return JSONResponse({
            "success": True,
            "message": "Əməliyyat uğurla yeniləndi",
            "expense": {
                "id": expense.id,
                "merchant": expense.merchant,
                "amount": expense.amount,
                "category": expense.category,
                "date": expense.date.isoformat() if expense.date else None
            }
        })
    except Exception as e:
        print(f"❌ Update Expense Error: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)


@app.post("/api/voice-command")
async def voice_command_endpoint(
    request: Request,
    file: UploadFile = File(...),
    language: str = Form("az"),
    db: Session = Depends(get_db)
):
    """Process voice command and create expense"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    if not user.voice_enabled:
        return JSONResponse({"success": False, "error": "Səsli əmrlər deaktiv edilib"}, status_code=403)
    
    try:
        # Read file content
        audio_data = await file.read()
        mime_type = file.content_type
        
        # Process voice command (transcribe and parse)
        result = await voice_service.process_voice_command(audio_data, user, db, language, mime_type, save_to_db=False)
        
        if not result.get("success"):
            return JSONResponse({"success": False, "error": result.get("error")}, status_code=400)
        
        # Return confirmation data as JSON for React frontend
        return JSONResponse({
            "success": True,
            "transcribed_text": result["transcribed_text"],
            "expense_data": result["expense_data"]
        })
        
    except Exception as e:
        print(f"❌ Voice Command Error: {e}")
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)


@app.post("/api/confirm-voice")
async def confirm_voice_expense(
    request: Request,
    amount: float = Form(...),
    merchant: str = Form(...),
    category: str = Form(...),
    db: Session = Depends(get_db)
):
    """Save voice expense after user confirmation"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        # Create expense
        expense = Expense(
            user_id=user.id,
            amount=amount,
            merchant=merchant,
            category=category,
            date=datetime.utcnow()
        )
        db.add(expense)
        db.commit()
        
        # Award XP - Fixed to 15 XP for voice commands
        xp_result = gamification.award_xp(user, "voice_command", db)
        db.refresh(user)
        
        # Always award 15 XP for voice commands
        xp_awarded = 15
        
        # Return success response - JSON for React
        return JSONResponse({
            "success": True,
            "message": f"Uğurla əlavə olundu! {amount} AZN - {merchant} (+{xp_awarded} XP)",
            "expense": {
                "id": expense.id,
                "merchant": merchant,
                "amount": amount,
                "category": category,
                "date": expense.date.isoformat() if expense.date else None
            },
            "xp_result": xp_result
        })
        
    except Exception as e:
        print(f"❌ Voice confirmation error: {e}")
        return JSONResponse({
            "success": False,
            "error": f"Xəta baş verdi: {str(e)}"
        }, status_code=500)



@app.get("/api/forecast")
async def get_forecast_endpoint(request: Request, db: Session = Depends(get_db)):
    """Get spending forecast for current month"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        forecast = forecast_service.get_forecast(user.id, db)
        return JSONResponse(forecast)
    except Exception as e:
        print(f"❌ Forecast Error: {e}")
        return JSONResponse({"error": str(e)}, status_code=500)


@app.get("/api/forecast-chart")
async def get_forecast_chart_endpoint(request: Request, db: Session = Depends(get_db)):
    """Get forecast data points for chart"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        forecast_points = forecast_service.get_chart_forecast_data(user.id, db)
        return JSONResponse({"forecast_points": forecast_points})
    except Exception as e:
        print(f"❌ Forecast Chart Error: {e}")
        return JSONResponse({"error": str(e)}, status_code=500)


@app.post("/api/tts")
async def text_to_speech(
    text: str = Form(...),
    language: str = Form("az"),
    rate: str = Form("+0%"),      # Speech rate: -50% to +100%
    pitch: str = Form("+0Hz"),    # Pitch: -50Hz to +50Hz
    volume: str = Form("+0%"),    # Volume: -50% to +100%
    quality: str = Form("high")   # Quality flag (for future use)
):
    """Convert text to speech using edge-tts with enhanced quality parameters"""
    try:
        # Enhanced parameters for high-quality TTS
        # Adjust rate slightly for more natural speech (slightly slower = clearer)
        if quality == "high":
            rate = "+0%"  # Natural speed
            pitch = "+0Hz"  # Natural pitch
            volume = "+0%"  # Full volume
        
        audio_bytes = await voice_service.generate_voice_response(
            text, 
            language, 
            rate=rate,
            pitch=pitch,
            volume=volume
        )
        if not audio_bytes:
            return JSONResponse({"success": False, "error": "TTS failed"}, status_code=500)
        return JSONResponse({
            "success": True,
            "audio_response": base64.b64encode(audio_bytes).decode()
        })
    except Exception as e:
        print(f"❌ TTS API Error: {e}")
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)




@app.post("/api/expense")
async def add_manual_expense(
    request: Request,
    amount: float = Form(...),
    merchant: str = Form(...),
    category: str = Form(...),
    notes: str = Form(""),
    db: Session = Depends(get_db)
):
    """Add manual expense"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        expense = Expense(
            user_id=user.id,
            amount=amount,
            merchant=merchant,
            category=category,
            notes=notes,
            date=datetime.utcnow()
        )
        db.add(expense)
        db.commit()
        
        # Check daily budget limit
        daily_limit_alert = None
        if user.daily_budget_limit:
            today = date_type.today()
            today_expenses = db.query(Expense).filter(
                Expense.user_id == user.id,
                Expense.date >= today,
                Expense.date < today + timedelta(days=1)
            ).all()
            today_total = sum(exp.amount for exp in today_expenses)
            
            if today_total > user.daily_budget_limit:
                daily_limit_alert = {
                    "type": "daily_limit_exceeded",
                    "message": f"⚠️ Gündəlik limit keçildi! Bu gün {today_total:.2f} AZN xərclədiniz (Limit: {user.daily_budget_limit:.2f} AZN)",
                    "today_spending": today_total,
                    "limit": user.daily_budget_limit
                }
        
        # Award XP
        xp_result = gamification.award_xp(user, "manual_expense", db)
        
        response_data = {
            "success": True,
            "expense_id": expense.id,
            "xp_result": xp_result
        }
        
        if daily_limit_alert:
            response_data["daily_limit_alert"] = daily_limit_alert
        
        return JSONResponse(response_data)
        
    except Exception as e:
        print(f"❌ Add Expense Error: {e}")
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)


@app.delete("/api/expenses/{expense_id}")
async def delete_expense(request: Request, expense_id: int, db: Session = Depends(get_db)):
    """Delete an expense (with ownership verification)"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    try:
        expense = db.query(Expense).filter(
            Expense.id == expense_id,
            Expense.user_id == user.id  # Ensure ownership
        ).first()
        
        if not expense:
            return JSONResponse(
                {"success": False, "error": "Expense not found or unauthorized"},
                status_code=404
            )
        
        if user.coins and user.coins > 0:
            user.coins -= 1
            
        db.delete(expense)
        db.commit()
        
        # Return response with HX-Refresh header to reload page and recalculate totals
        return Response(
            status_code=200,
            headers={"HX-Refresh": "true", "HX-Trigger": "update-stats"}
        )
    except Exception as e:
        print(f"❌ Delete Error: {e}")
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)


@app.post("/api/add-income")
async def add_income(
    request: Request,
    db: Session = Depends(get_db)
):
    """Add income (salary or extra income)"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        # Get form data
        form = await request.form()
        amount_str = form.get("amount")
        source = form.get("source")
        date_str = form.get("date")
        description = form.get("description")
        is_recurring_str = form.get("is_recurring", "false")
        
        print(f"📥 Add Income Request - User: {user.id}")
        print(f"   Amount: {amount_str}, Source: {source}, Date: {date_str}")
        
        # Validate and parse amount
        if not amount_str:
            return JSONResponse({"success": False, "error": "Məbləğ daxil edilməyib"}, status_code=400)
        
        try:
            amount = float(amount_str)
        except (ValueError, TypeError):
            return JSONResponse({"success": False, "error": "Yanlış məbləğ formatı"}, status_code=400)
        
        if amount <= 0:
            return JSONResponse({"success": False, "error": "Məbləğ 0-dan böyük olmalıdır"}, status_code=400)
        
        # Validate source
        if not source:
            return JSONResponse({"success": False, "error": "Mənbə seçilməyib"}, status_code=400)
        
        # Parse date
        if date_str:
            try:
                income_date = datetime.strptime(date_str, "%Y-%m-%d")
            except ValueError:
                income_date = datetime.utcnow()
        else:
            income_date = datetime.utcnow()
        
        # Parse is_recurring
        is_recurring = is_recurring_str.lower() in ["true", "1", "on", "yes"]
        
        # If source is "Maaş" or "Salary", update monthly_income
        if source.lower() in ["maaş", "salary", "maas"]:
            user.monthly_income = amount
            is_recurring = True
            print(f"   Updating monthly_income to {amount}")
        
        # Create Income record
        income = Income(
            user_id=user.id,
            amount=amount,
            source=source,
            description=description if description else None,
            date=income_date,
            is_recurring=is_recurring
        )
        
        print(f"   Creating Income record: {amount} {source} on {income_date}")
        
        db.add(income)
        db.commit()
        db.refresh(income)
        db.refresh(user)
        
        print(f"✅ Income added successfully: ID={income.id}, Amount={amount}, Source={source}, User={user.id}")
        print(f"   Date: {income_date}")
        print(f"   Is recurring: {is_recurring}")
        print(f"   User's monthly_income updated to: {user.monthly_income}")
        
        # Trigger stats update
        return JSONResponse({
            "success": True, 
            "message": f"Gəlir əlavə edildi: {amount:.2f} {user.currency or 'AZN'}"
        }, headers={"HX-Trigger": "update-stats"})
    except Exception as e:
        print(f"❌ Add Income Error: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse({"success": False, "error": f"Xəta: {str(e)}"}, status_code=500)

