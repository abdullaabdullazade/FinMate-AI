"""Scan/Receipt routes"""
from fastapi import Request, Depends, Form, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, date as date_type, timezone
from database import get_db
from models import  Expense
from config import app
from utils.auth import get_current_user
from utils.ai_notifications import generate_ai_notification
from ai_service import ai_service
from gamification import gamification


@app.post("/api/scan-receipt")
async def scan_receipt(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Process uploaded receipt image"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Check AI tokens (premium users have unlimited tokens)
    if not user.is_premium:
        # Get current tokens (default to 10 if None)
        current_tokens = user.ai_tokens if user.ai_tokens is not None else 10
        if current_tokens <= 0:
            return JSONResponse({
                "success": False,
                "receipt_data": {
                    "error": "AI tokenlarınız bitib. Premium alın",
                    "requires_premium": True
                }
            }, status_code=403)
    
    # Always return JSON for React frontend
    
    try:
        # Save uploaded file
        file_path = f"static/uploads/{file.filename}"
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Analyze receipt with AI
        receipt_data = ai_service.analyze_receipt(file_path)

        # Normalize payload to avoid JSON serialization issues
        items = receipt_data.get("items", [])
        if not isinstance(items, list):
            try:
                items = list(items)
            except Exception:
                items = []
        receipt_data["items"] = items
        receipt_data["merchant"] = receipt_data.get("merchant") or "Unknown Merchant"
        receipt_data["suggested_category"] = receipt_data.get("suggested_category") or "Other"
        # Don't override date if AI extracted it, only set default if missing
        if not receipt_data.get("date") or receipt_data.get("date") == "null":
            # Will use current date/time from browser or UTC+4
            receipt_data["date"] = None
    
        # Check if this is actually a receipt
        if not receipt_data.get("is_receipt", True):
                return JSONResponse({
                    "success": False,
                    "receipt_data": {
                        "error": "Bu qəbz deyil. Xahiş edirik qəbz şəkli yükləyin.",
                        "is_not_receipt": True
                    }
            })
        
        # Only AZN supported - no currency conversion
        receipt_data["currency"] = "AZN"
        conversion_note = None

        # Surface non-blocking AI warnings (offline/fallback mode)
        if not conversion_note and isinstance(receipt_data, dict):
            conversion_note = receipt_data.get("note")
    
        # Check if error occurred
        if "error" in receipt_data:
                return JSONResponse({
                    "success": False,
                    "receipt_data": receipt_data
            })

        # Auto-save expense (skip manual confirmation)
        try:
            raw_date = receipt_data.get("date")
            # Get client date/time from request headers (browser's local time)
            client_date_str = request.headers.get("X-Client-Date", None)
            
            try:
                raw_time = receipt_data.get("time")
                if raw_date and raw_date != "null" and raw_date.lower() != "none":
                    # Use date from receipt if available (assume it's in Azerbaijan time UTC+4)
                    if raw_time and raw_time != "null" and raw_time.lower() != "none":
                        # Both date and time from receipt - treat as UTC+4
                        try:
                            time_parts = raw_time.split(":")
                            hour = int(time_parts[0]) if len(time_parts) > 0 else 0
                            minute = int(time_parts[1]) if len(time_parts) > 1 else 0
                            # Receipt time is already in Azerbaijan time (UTC+4), so use it directly
                            expense_date = datetime.strptime(raw_date, "%Y-%m-%d").replace(hour=hour, minute=minute)
                        except:
                            expense_date = datetime.strptime(raw_date, "%Y-%m-%d")
                    else:
                        # Only date from receipt, use current time in UTC+4
                        az_timezone = timezone(timedelta(hours=4))
                        now_az = datetime.now(az_timezone)
                        expense_date = datetime.strptime(raw_date, "%Y-%m-%d").replace(hour=now_az.hour, minute=now_az.minute)
                elif client_date_str:
                    # Use browser's local time, but convert to UTC+4 (Azerbaijan time)
                    from dateutil import parser
                    client_datetime = parser.isoparse(client_date_str)
                    # If browser sends UTC time, convert to UTC+4
                    # If browser sends local time, assume it's already in user's timezone
                    # For Azerbaijan, we want UTC+4
                    if client_datetime.tzinfo is None:
                        # No timezone info, assume it's UTC and convert to UTC+4
                        az_timezone = timezone(timedelta(hours=4))
                        expense_date = client_datetime.replace(tzinfo=timezone.utc).astimezone(az_timezone).replace(tzinfo=None)
                    else:
                        # Has timezone, convert to UTC+4
                        az_timezone = timezone(timedelta(hours=4))
                        expense_date = client_datetime.astimezone(az_timezone).replace(tzinfo=None)
                else:
                    # Fallback to UTC+4 (Azerbaijan time) - current date and time
                    az_timezone = timezone(timedelta(hours=4))
                    expense_date = datetime.now(az_timezone).replace(tzinfo=None)
            except Exception as date_err:
                # Fallback to UTC+4 - current date and time
                print(f"Date parsing error: {date_err}, using current time")
                az_timezone = timezone(timedelta(hours=4))
                expense_date = datetime.now(az_timezone).replace(tzinfo=None)

            items_list = receipt_data.get("items", [])
            if not isinstance(items_list, list):
                items_list = []

            expense = Expense(
                user_id=user.id,
                amount=float(receipt_data.get("total", 0.0) or 0.0),
                merchant=receipt_data.get("merchant") or "Unknown Merchant",
                category=receipt_data.get("suggested_category") or "Other",
                date=expense_date,
                items=items_list
            )
            db.add(expense)
            db.commit()
            db.refresh(expense)
            
            # Update receipt_data with formatted date/time for display
            receipt_data["date"] = expense_date.strftime("%d.%m.%Y")
            receipt_data["time"] = expense_date.strftime("%H:%M")
            receipt_data["date_time"] = expense_date.strftime("%d.%m.%Y, %H:%M")

            # Check daily budget limit - only for today's receipts
            daily_limit_alert = None
            if user.daily_budget_limit:
                # Use receipt date
                receipt_date = expense_date.date() if isinstance(expense_date, datetime) else expense_date
                today = date_type.today()
                
                # Only check limit if receipt is from today
                if receipt_date == today:
                    day_start = datetime.combine(today, datetime.min.time())
                    day_end = datetime.combine(today, datetime.max.time())
                    
                    today_expenses = db.query(Expense).filter(
                        Expense.user_id == user.id,
                        Expense.date >= day_start,
                        Expense.date <= day_end
                    ).all()
                    today_total = sum(exp.amount for exp in today_expenses)
                    
                    if today_total > user.daily_budget_limit:
                        daily_limit_alert = {
                            "type": "daily_limit_exceeded",
                            "message": f"⚠️ Gündəlik limit keçildi! Bu gün {today_total:.2f} AZN xərclədiniz (Limit: {user.daily_budget_limit:.2f} AZN)",
                            "today_spending": today_total,
                            "limit": user.daily_budget_limit
                        }
                    elif today_total > user.daily_budget_limit * 0.9:
                        daily_limit_alert = {
                            "type": "approaching",
                            "message": f"⚡ Gündəlik limitə yaxınlaşırsınız! Bu gün {today_total:.2f} AZN xərclədiniz (Limit: {user.daily_budget_limit:.2f} AZN)",
                            "today_spending": today_total,
                            "limit": user.daily_budget_limit
                        }

            # Deduct token (only for non-premium users)
            if not user.is_premium:
                user.ai_tokens = max(0, (user.ai_tokens if user.ai_tokens is not None else 10) - 1)
                db.commit()
                db.refresh(user)
            
            scan_xp = gamification.award_xp(user, "scan_receipt", db)
            
            # Award FinMate Coins based on receipt amount
            # Yeni coin sistemi:
            # 0-49 AZN: 1 coin
            # 50-99 AZN: 5 coin
            # 100-500 AZN: 10 coin
            # 500-999 AZN: 15 coin
            if user.coins is None:
                user.coins = 0
            
            # Calculate coins based on total amount
            total_amount = receipt_data.get("total", 0)
            try:
                total_amount = float(total_amount)
            except (ValueError, TypeError):
                total_amount = 0
            
            # Coin calculation based on amount ranges
            if total_amount < 50:
                coins_to_award = 1
            elif total_amount < 100:
                coins_to_award = 5
            elif total_amount < 500:
                coins_to_award = 10
            elif total_amount < 1000:
                coins_to_award = 15
            else:
                # 1000+ AZN üçün hər 500 AZN-ə 15 coin əlavə et
                coins_to_award = 15 + (int((total_amount - 1000) / 500) * 15)
            
            user.coins += coins_to_award
            milestone_reached = None
            
            # Check for milestones
            milestones = {
                100: {"name": "🥉 Bronz", "reward": "1 Coffee Kuponu"},
                200: {"name": "🥈 Gümüş", "reward": "3 Coffee Kuponu"},
                500: {"name": "🥇 Qızıl", "reward": "5 AZN pul mükafatı"},
                5000: {"name": "💎 Platin", "reward": "Premium 1 ay + 20 AZN"}
            }
            
            if user.coins in milestones:
                milestone_reached = {
                    "coins": user.coins,
                    "name": milestones[user.coins]["name"],
                    "reward": milestones[user.coins]["reward"]
                }
            
            db.commit()
            db.refresh(user)

            # Send real-time notification via WebSocket - Coin qazandı
            try:
                from routes.websocket import send_notification_to_user
                # Coin bildirişi göndər
                await send_notification_to_user(user.id, {
                    "type": "new_notification",
                    "notification": {
                        "icon": "🪙",
                        "color": "yellow-500",
                        "message": f"Təbriklər! Qəbz scan etdiyinizə görə {coins_to_award} coin qazandınız! 💰 Cari balans: {user.coins} coin"
                    }
                })
            except Exception as ws_error:
                print(f"WebSocket notification error: {ws_error}")
            
            # AI ilə xərcləmə analizi və bildiriş yarat
            scan_amount = float(receipt_data.get("total", 0.0) or 0.0)
            scan_merchant = receipt_data.get("merchant") or "Unknown"
            scan_category = receipt_data.get("suggested_category") or "Other"
            
            try:
                from routes.websocket import send_notification_to_user
                
                # AI bildirişi yarat
                ai_notification = await generate_ai_notification(
                    db=db,
                    user=user,
                    action_type="scan",
                    action_data={
                        "merchant": scan_merchant,
                        "amount": scan_amount,
                        "category": scan_category
                    }
                )
                
                # AI bildirişini göndər
                await send_notification_to_user(user.id, {
                    "type": "new_notification",
                    "notification": ai_notification
                })
            except Exception as ai_error:
                print(f"AI notification error: {ai_error}")
                import traceback
                traceback.print_exc()
                # Fallback bildiriş göndər
                try:
                    from routes.websocket import send_notification_to_user
                    await send_notification_to_user(user.id, {
                        "type": "new_notification",
                        "notification": {
                            "icon": "📊",
                            "color": "blue-500",
                            "message": f"Qəbz scan edildi: {scan_merchant} - {scan_amount:.2f} AZN"
                        }
                    })
                except Exception as fallback_error:
                    print(f"Fallback notification error: {fallback_error}")
                    import traceback
                    traceback.print_exc()

            # Return JSON for React frontend
            return JSONResponse({
                    "success": True,
                    "receipt_data": receipt_data,
                    "conversion_note": conversion_note,
                    "expense_id": expense.id,  # Include expense ID for delete functionality
                    "xp_result": {
                        "xp_awarded": scan_xp["xp_awarded"] if scan_xp else 0,
                        "new_total": user.xp_points,
                        "level_up": scan_xp.get("level_up", False) if scan_xp else False,
                        "new_level": scan_xp.get("new_level") if scan_xp else None,
                        "level_info": scan_xp.get("level_info") if scan_xp else None,
                        "coins_awarded": coins_to_award,
                    },
                    "coins": user.coins,
                    "milestone_reached": milestone_reached,
                    "daily_limit_alert": daily_limit_alert,
                    "remaining_tokens": user.ai_tokens if not user.is_premium else None
            })
        except Exception as save_err:
                return JSONResponse({
                    "success": False,
                    "receipt_data": {
                        "error": f"Yadda saxlama xətası: {save_err}"
                    }
            })
        
    except Exception as e:
            return JSONResponse({
                "success": False,
                "receipt_data": {
                    "error": f"Xəta baş verdi: {str(e)}",
                    "items": [],
                    "merchant": "Error",
                    "total": 0.0,
                    "date": datetime.now().strftime("%Y-%m-%d"),
                    "suggested_category": "Error"
                }
        })


@app.post("/api/confirm-receipt")
async def confirm_receipt(
    request: Request,
    total: float = Form(...),
    merchant: str = Form(...),
    category: str = Form(...),
    date: str = Form(...),
    items: str = Form("[]"),
    db: Session = Depends(get_db)
):
    """Save receipt after user confirmation/correction"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        # Parse date safely - use UTC+4 (Azerbaijan time) or browser time
        try:
            if not date:
                from datetime import timezone as tz
                az_timezone = tz(timedelta(hours=4))
                expense_date = datetime.now(az_timezone).replace(tzinfo=None)
            else:
                expense_date = datetime.strptime(date, "%Y-%m-%d")
        except ValueError:
            from datetime import timezone as tz
            az_timezone = tz(timedelta(hours=4))
            expense_date = datetime.now(az_timezone).replace(tzinfo=None)
        
        # Parse items JSON
        import json
        try:
            items_list = json.loads(items) if items else []
        except:
            items_list = []
        
        # Save to database with user-confirmed/corrected amount
        expense = Expense(
            user_id=user.id,
            amount=total,
            merchant=merchant,
            category=category,
            date=expense_date,
            items=items_list
        )
        db.add(expense)
        db.commit()
        
        # Check daily budget limit - only for today's receipts
        daily_limit_alert = None
        if user.daily_budget_limit:
            # Parse date from form
            try:
                if not date:
                    receipt_date = date_type.today()
                else:
                    receipt_date = datetime.strptime(date, "%Y-%m-%d").date()
            except:
                receipt_date = date_type.today()
            
            today = date_type.today()
            
            # Only check limit if receipt is from today
            if receipt_date == today:
                day_start = datetime.combine(today, datetime.min.time())
                day_end = datetime.combine(today, datetime.max.time())
                
                today_expenses = db.query(Expense).filter(
                    Expense.user_id == user.id,
                    Expense.date >= day_start,
                    Expense.date <= day_end
                ).all()
                today_total = sum(exp.amount for exp in today_expenses)
                
                if today_total > user.daily_budget_limit:
                    daily_limit_alert = {
                        "type": "daily_limit_exceeded",
                        "message": f"⚠️ Gündəlik limit keçildi! Bu gün {today_total:.2f} AZN xərclədiniz (Limit: {user.daily_budget_limit:.2f} AZN)",
                        "today_spending": today_total,
                        "limit": user.daily_budget_limit
                    }
                elif today_total > user.daily_budget_limit * 0.9:
                    daily_limit_alert = {
                        "type": "approaching",
                        "message": f"⚡ Gündəlik limitə yaxınlaşırsınız! Bu gün {today_total:.2f} AZN xərclədiniz (Limit: {user.daily_budget_limit:.2f} AZN)",
                        "today_spending": today_total,
                        "limit": user.daily_budget_limit
                    }
        
        # Award XP for scanning receipt
        scan_xp = gamification.award_xp(user, "scan_receipt", db)
        db.refresh(user)
        
        # Return success result - JSON for React
        return JSONResponse({
            "success": True,
            "receipt_data": {
                "items": items_list,
                "merchant": merchant,
                "total": total,
                "date": expense_date.strftime("%d.%m.%Y"),
                "suggested_category": category,
                "currency": "AZN"
            },
            "xp_result": {
                "xp_awarded": scan_xp["xp_awarded"] if scan_xp else 0,
                "new_total": user.xp_points,
                "level_up": scan_xp.get("level_up", False) if scan_xp else False,
                "new_level": scan_xp.get("new_level", "") if scan_xp else "",
                "level_info": scan_xp.get("level_info", {}) if scan_xp else {},
                "coins_awarded": scan_xp.get("coins_awarded", 0) if scan_xp else 0
            },
            "daily_limit_alert": daily_limit_alert
        })
        
    except Exception as e:
        return JSONResponse({
            "success": False,
            "receipt_data": {
                "error": f"Yadda saxlama xətası: {str(e)}"
            }
        })


