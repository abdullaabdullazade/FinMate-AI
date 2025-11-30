"""Route handlers"""
from fastapi import Request, Depends, Form, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse, Response
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, date as date_type
from typing import Optional
import base64
import math
from database import get_db
from models import  Expense, Income
from config import app
from utils.auth import get_current_user
from utils.ai_notifications import generate_ai_notification

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
    
    # Check AI tokens (premium users have unlimited tokens)
    if not user.is_premium:
        # Get current tokens (default to 10 if None)
        current_tokens = user.ai_tokens if user.ai_tokens is not None else 10
        if current_tokens <= 0:
            return JSONResponse({
                "success": False,
                "error": "AI tokenlarınız bitib",
                "requires_premium": True,
                "message": "AI xüsusiyyətlərindən istifadə etmək üçün Premium alın"
            }, status_code=403)
    
    try:
        # Read file content
        audio_data = await file.read()
        mime_type = file.content_type
        
        # Process voice command (transcribe and parse)
        result = await voice_service.process_voice_command(audio_data, user, db, language, mime_type, save_to_db=False)
        
        if not result.get("success"):
            return JSONResponse({"success": False, "error": result.get("error")}, status_code=400)
        
        # Deduct token (only for non-premium users)
        if not user.is_premium:
            user.ai_tokens = max(0, (user.ai_tokens if user.ai_tokens is not None else 10) - 1)
            db.commit()
            db.refresh(user)
        
        # Return confirmation data as JSON for React frontend
        return JSONResponse({
            "success": True,
            "transcribed_text": result["transcribed_text"],
            "expense_data": result["expense_data"],
            "remaining_tokens": user.ai_tokens if not user.is_premium else None
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
        
        # Award FinMate Coins for voice expense
        # Base: 10 coins, plus bonus based on amount
        coins_to_award = 10
        if amount >= 50:
            # Bonus coins for larger expenses
            coins_to_award += int((amount - 50) / 50) * 5  # 5 coins per 50 AZN above 50
            coins_to_award = min(coins_to_award, 50)  # Max 50 coins
        
        if user.coins is None:
            user.coins = 0
        user.coins += coins_to_award
        db.commit()
        db.refresh(user)
        
        # Send real-time notification via WebSocket - AI bildirişi
        try:
            from routes.websocket import send_notification_to_user
            
            # AI bildirişi yarat
            ai_notification = await generate_ai_notification(
                db=db,
                user=user,
                action_type="voice_expense",
                action_data={
                    "merchant": merchant,
                    "amount": amount,
                    "category": category
                }
            )
            
            # AI bildirişini göndər
            await send_notification_to_user(user.id, {
                "type": "new_notification",
                "notification": ai_notification
            })
        except Exception as ws_error:
            print(f"WebSocket notification error: {ws_error}")
            import traceback
            traceback.print_exc()
        
        # Sanitize xp_result to handle inf values
        def sanitize_float(value):
            """Convert inf/nan to None, ensure value is float"""
            if value is None:
                return None
            try:
                val = float(value)
                if math.isinf(val) or math.isnan(val):
                    return None
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
                            # Replace inf with None
                            if isinstance(level_value, float) and math.isinf(level_value):
                                sanitized_level_info[level_key] = None
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
            "xp_result": sanitized_xp_result,
            "coins_awarded": coins_to_award,
            "total_coins": user.coins
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




# Import WebSocket notification function (circular import-u qarşısını almaq üçün lazy import)

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
        # Validate amount
        if amount <= 0:
            return JSONResponse({"success": False, "error": "Məbləğ 0-dan böyük olmalıdır"}, status_code=400)
        
        # Validate merchant
        if not merchant or not merchant.strip():
            return JSONResponse({"success": False, "error": "Obyekt/Mağaza adı daxil edilməyib"}, status_code=400)
        
        expense = Expense(
            user_id=user.id,
            amount=amount,
            merchant=merchant.strip(),
            category=category if category else "Digər",
            notes=notes.strip() if notes else None,
            date=datetime.utcnow()
        )
        db.add(expense)
        db.commit()
        db.refresh(expense)
        
        # Check daily budget limit
        daily_limit_alert = None
        try:
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
        except Exception as e:
            print(f"⚠️ Daily limit check error: {e}")
            # Don't fail the request if daily limit check fails
        
        # Award XP
        xp_result = None
        try:
            xp_result = gamification.award_xp(user, "manual_expense", db)
            db.refresh(user)
        except Exception as e:
            print(f"⚠️ XP award error: {e}")
            import traceback
            traceback.print_exc()
            # Don't fail the request if XP award fails
        
        # Sanitize xp_result to handle inf values
        def sanitize_float(value):
            """Convert inf/nan to None, ensure value is float"""
            if value is None:
                return None
            try:
                val = float(value)
                if math.isinf(val) or math.isnan(val):
                    return None
                return val
            except (ValueError, TypeError):
                return None
        
        # Sanitize xp_result
        sanitized_xp_result = None
        if xp_result:
            sanitized_xp_result = {}
            for key, value in xp_result.items():
                if key == "level_info" and isinstance(value, dict):
                    # Sanitize level_info dict
                    sanitized_level_info = {}
                    for level_key, level_value in value.items():
                        if level_key == "max_xp":
                            # Replace inf with None
                            if isinstance(level_value, float) and math.isinf(level_value):
                                sanitized_level_info[level_key] = None
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
        
        response_data = {
            "success": True,
            "expense_id": expense.id,
            "message": f"Xərc uğurla əlavə edildi: {amount:.2f} AZN - {merchant}",
            "expense": {
                "id": expense.id,
                "merchant": expense.merchant,
                "amount": expense.amount,
                "category": expense.category,
                "date": expense.date.isoformat() if expense.date else None
            }
        }
        
        if sanitized_xp_result:
            response_data["xp_result"] = sanitized_xp_result
            if sanitized_xp_result.get("xp_awarded"):
                response_data["xp_awarded"] = sanitized_xp_result["xp_awarded"]
        
        if daily_limit_alert:
            response_data["daily_limit_alert"] = daily_limit_alert
        
        # Send real-time notification via WebSocket - AI bildirişi
        try:
            from routes.websocket import send_notification_to_user
            
            # AI bildirişi yarat
            ai_notification = await generate_ai_notification(
                db=db,
                user=user,
                action_type="manual_expense",
                action_data={
                    "merchant": merchant.strip(),
                    "amount": amount,
                    "category": category if category else "Digər"
                }
            )
            
            # AI bildirişini göndər
            await send_notification_to_user(user.id, {
                "type": "new_notification",
                "notification": ai_notification
            })
        except Exception as ws_error:
            print(f"WebSocket notification error: {ws_error}")
            import traceback
            traceback.print_exc()
            # Don't fail the request if WebSocket fails
        
        return JSONResponse(response_data)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Add Expense Error: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse({
            "success": False, 
            "error": f"Xəta baş verdi: {str(e)}"
        }, status_code=500)


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
        
        # Send real-time notification via WebSocket
        try:
            from routes.websocket import send_notification_to_user, generate_notifications_for_user
            notifications = await generate_notifications_for_user(user, db)
            await send_notification_to_user(user.id, {
                "type": "notifications",
                "notifications": notifications,
                "count": len(notifications),
                "trigger": "expense_deleted"
            })
        except Exception as ws_error:
            print(f"WebSocket notification error: {ws_error}")
        
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
            # Clean the value - handle different locale formats
            # Handles: "50", "50.00", "50,00", "1,000.50", "1000,50" etc.
            cleaned = str(amount_str).replace(" ", "").strip()
            
            # Handle comma as decimal separator (e.g., "50,50")
            if "," in cleaned and "." not in cleaned:
                # Only comma - treat as decimal separator (European/Azerbaijani format)
                cleaned = cleaned.replace(",", ".")
            elif "," in cleaned and "." in cleaned:
                # Both comma and dot - comma is thousand separator (e.g., "1,000.50")
                cleaned = cleaned.replace(",", "")
            # If only dot, keep as is (e.g., "50.50" or "1000.50")
            
            amount = float(cleaned)
            print(f"   Parsed amount: '{amount_str}' -> '{cleaned}' -> {amount}")
        except (ValueError, TypeError) as e:
            print(f"❌ Amount parsing error: '{amount_str}' -> Error: {e}")
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
        
        # Verify the amount was saved correctly
        db.refresh(income)
        if abs(income.amount - amount) > 0.01:  # Allow small floating point differences
            print(f"⚠️ Warning: Amount mismatch! Expected: {amount}, Saved: {income.amount}")
        else:
            print(f"✅ Verified: Amount saved correctly in database: {income.amount}")
        
        # Send real-time notification via WebSocket - AI bildirişi
        try:
            from routes.websocket import send_notification_to_user
            
            # AI bildirişi yarat
            ai_notification = await generate_ai_notification(
                db=db,
                user=user,
                action_type="income",
                action_data={
                    "merchant": source,
                    "amount": amount,
                    "category": "Gəlir"
                }
            )
            
            # AI bildirişini göndər
            await send_notification_to_user(user.id, {
                "type": "new_notification",
                "notification": ai_notification
            })
        except Exception as ws_error:
            print(f"WebSocket notification error: {ws_error}")
            import traceback
            traceback.print_exc()
        
        # Trigger stats update
        return JSONResponse({
            "success": True, 
            "message": f"Gəlir əlavə edildi: {amount:.2f} {user.currency or 'AZN'}",
            "amount": amount,  # Include amount in response for verification
            "income_id": income.id
        }, headers={"HX-Trigger": "update-stats"})
    except Exception as e:
        print(f"❌ Add Income Error: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse({"success": False, "error": f"Xəta: {str(e)}"}, status_code=500)

