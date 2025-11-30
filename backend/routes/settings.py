"""Settings routes"""
from fastapi import Request, Depends, Form, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from database import get_db, reset_demo_data
from models import User
from config import app
from utils.auth import get_current_user

@app.get("/settings")
async def settings_page(request: Request, db: Session = Depends(get_db)):
    """Settings page - Redirects to React frontend"""
    return JSONResponse({
        "message": "Please use the React frontend",
        "api_endpoint": "/api/settings"
    })


@app.get("/api/settings")
async def get_settings(request: Request, db: Session = Depends(get_db)):
    """Get user settings"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")

    return JSONResponse(
        {
            "user": {
                "monthly_budget": user.monthly_budget,
                "daily_budget_limit": user.daily_budget_limit,
                "preferred_language": user.preferred_language,
                "voice_enabled": user.voice_enabled,
                "voice_mode": user.voice_mode if hasattr(user, "voice_mode") else False,
                "readability_mode": user.readability_mode,
                "currency": user.currency,
                "login_streak": user.login_streak,
                "ai_name": user.ai_name,
                "ai_persona_mode": user.ai_persona_mode,
                "ai_attitude": user.ai_attitude,
                "ai_style": user.ai_style,
                "incognito_mode": (
                    user.incognito_mode if hasattr(user, "incognito_mode") else False
                ),
            }
        }
    )


@app.post("/api/settings")
async def update_settings(request: Request, db: Session = Depends(get_db)):
    """Update user settings"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")

    def parse_bool(val):
        if val is None:
            return None
        if isinstance(val, list) and val:
            val = val[-1]
        if isinstance(val, bool):
            return val
        return str(val).lower() in ["true", "1", "on", "yes", "y", "checked"]

    try:
        form = await request.form()

        def last_value(key):
            vals = form.getlist(key)
            return vals[-1] if vals else None

        monthly_budget = last_value("monthly_budget")
        monthly_income = last_value("monthly_income")
        daily_budget_limit = last_value("daily_budget_limit")
        preferred_language = last_value("preferred_language")
        voice_enabled = parse_bool(form.getlist("voice_enabled"))
        voice_mode = parse_bool(form.getlist("voice_mode"))  # TTS mode
        readability_mode = parse_bool(form.getlist("readability_mode"))
        # currency = last_value("currency")  # Removed: User requested only AZN
        ai_name = last_value("ai_name")
        ai_persona_mode = last_value("ai_persona_mode")
        ai_attitude = last_value("ai_attitude")
        ai_style = last_value("ai_style")

        # Visual Preferences
        theme = last_value("theme")
        incognito_mode = parse_bool(form.getlist("incognito_mode"))

        # Handle monthly_income (salary) - first time setup
        if monthly_income not in (None, ""):
            try:
                income_str = (
                    str(monthly_income).replace(",", "").replace(" ", "").strip()
                )
                income_val = float(income_str)

                if income_val <= 0:
                    return JSONResponse(
                        {"success": False, "error": "Maaş müsbət olmalıdır"},
                        status_code=400,
                    )

                user.monthly_income = income_val
                
                # Maaş təyin edildikdə büdcə də avtomatik olaraq maaşa bərabər edilir
                # (yalnız büdcə hələ təyin edilməyibsə və ya maaşdan azdırsa)
                if user.monthly_budget is None or user.monthly_budget < income_val:
                    user.monthly_budget = income_val
                    print(f"✅ Monthly budget automatically set to income: {income_val} AZN")
                
                print(f"✅ Monthly income updated: {income_val} AZN for user {user.id} (username: {user.username})")
                
                # Commit immediately to ensure it's saved
                db.commit()
                db.refresh(user)
                
                # Verify it was saved
                if user.monthly_income != income_val:
                    print(f"⚠️ Warning: monthly_income mismatch after commit. Expected: {income_val}, Got: {user.monthly_income}")
                else:
                    print(f"✅ Verified: monthly_income saved correctly: {user.monthly_income} AZN")
                    print(f"✅ Verified: monthly_budget updated to: {user.monthly_budget} AZN")
                    
            except (ValueError, TypeError) as e:
                print(f"❌ Invalid monthly_income: {monthly_income}, error: {e}")
                import traceback

                traceback.print_exc()
                return JSONResponse(
                    {"success": False, "error": f"Yanlış maaş dəyəri: {str(e)}"},
                    status_code=400,
                )

        if monthly_budget not in (None, ""):
            try:
                # Clean the value - remove commas and spaces
                budget_str = (
                    str(monthly_budget).replace(",", "").replace(" ", "").strip()
                )
                budget_val = float(budget_str)

                if budget_val < 50:
                    return JSONResponse(
                        {"success": False, "error": "Büdcə minimum 50 AZN olmalıdır"},
                        status_code=400,
                    )

                # Enforce AZN currency
                user.monthly_budget = budget_val
                # Ensure user currency is AZN
                if user.currency != "AZN":
                    user.currency = "AZN"

                print(f"✅ Monthly budget updated: {budget_val} AZN for user {user.id}")
            except (ValueError, TypeError) as e:
                print(f"❌ Invalid monthly_budget: {monthly_budget}, error: {e}")
                import traceback

                traceback.print_exc()
                return JSONResponse(
                    {"success": False, "error": f"Yanlış büdcə dəyəri: {str(e)}"},
                    status_code=400,
                )

        # Handle daily_budget_limit - allow empty string to clear it
        # No maximum limit - user can set any positive value
        if daily_budget_limit is not None and daily_budget_limit != "":
            try:
                daily_val = float(daily_budget_limit)
                if daily_val < 0:
                    raise ValueError("Daily limit cannot be negative")

                # Enforce AZN currency
                user.daily_budget_limit = daily_val
                # Ensure user currency is AZN
                if user.currency != "AZN":
                    user.currency = "AZN"
            except (ValueError, TypeError) as e:
                print(
                    f"❌ Invalid daily_budget_limit: {daily_budget_limit}, error: {e}"
                )
                return JSONResponse(
                    {
                        "success": False,
                        "error": "Gündəlik limit mənfi ola bilməz. İstənilən müsbət məbləğ daxil edə bilərsiniz.",
                    },
                    status_code=400,
                )
        else:
            # Empty string or None means clear the limit
            user.daily_budget_limit = None

        if preferred_language is not None:
            user.preferred_language = preferred_language
        if voice_enabled is not None:
            user.voice_enabled = voice_enabled
        if voice_mode is not None:
            user.voice_mode = voice_mode
        if readability_mode is not None:
            user.readability_mode = readability_mode

        # Enforce AZN currency
        user.currency = "AZN"

        # AI Persona Settings
        if ai_name and ai_name.strip():
            user.ai_name = ai_name.strip()
        if ai_persona_mode is not None:
            user.ai_persona_mode = ai_persona_mode
        if ai_attitude is not None:
            user.ai_attitude = ai_attitude
        if ai_style is not None:
            user.ai_style = ai_style

        # Save Visual Preferences
        if theme is not None:
            user.theme = theme
        if incognito_mode is not None:
            user.incognito_mode = incognito_mode

        # Final commit (if monthly_income wasn't already committed)
        db.commit()
        db.refresh(user)

        print(f"✅ Settings updated successfully for user {user.id} (username: {user.username})")
        if user.monthly_income:
            print(f"✅ Monthly income in database: {user.monthly_income} AZN")

        return JSONResponse(
            {
                "success": True,
                "message": "Tənzimləmələr yadda saxlanıldı",
                "user": {
                    "monthly_income": user.monthly_income,  # Include monthly_income in response
                    "monthly_budget": user.monthly_budget,  # Include monthly_budget in response
                    "voice_mode": (
                        user.voice_mode if hasattr(user, "voice_mode") else False
                    ),
                    "voice_enabled": user.voice_enabled,
                    "readability_mode": user.readability_mode,
                },
            },
            headers={"HX-Trigger": "update-stats,settingsUpdated"},
        )
    except Exception as e:
        print(f"❌ Settings Update Error: {e}")
        import traceback

        traceback.print_exc()
        return JSONResponse(
            {"success": False, "error": f"Xəta: {str(e)}"}, status_code=500
        )


@app.post("/api/reset-demo")
async def reset_demo_endpoint():
    """Reset database to curated demo data (manual action)"""
    try:
        reset_demo_data()
        return JSONResponse({"success": True, "message": "Demo məlumatları yeniləndi"})
    except Exception as e:
        print(f"❌ Reset Demo Error: {e}")
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)


@app.post("/api/activate-trial")
async def activate_trial_endpoint(request: Request, db: Session = Depends(get_db)):
    """Activate premium trial for current user"""
    try:
        user = get_current_user(request, db)
        if not user:
            return JSONResponse(
                {"success": False, "error": "İstifadəçi tapılmadı"}, status_code=401
            )

        user.is_premium = True
        db.commit()
        return JSONResponse(
            {
                "success": True,
                "message": "Premium aktivləşdirildi! 14 gün pulsuz sınaq başladı.",
            }
        )
    except Exception as e:
        print(f"❌ Trial Activation Error: {e}")
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)


@app.post("/api/set-budget")
async def set_budget(
    request: Request, monthly_budget: float = Form(...), db: Session = Depends(get_db)
):
    """Set monthly budget"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")

    try:
        # Validate amount
        if monthly_budget < 50:
            return JSONResponse(
                {"success": False, "error": "Büdcə minimum 50 AZN olmalıdır"},
                status_code=400,
            )

        # Update monthly budget
        user.monthly_budget = monthly_budget
        # Ensure user currency is AZN
        if user.currency != "AZN":
            user.currency = "AZN"

        db.commit()
        db.refresh(user)

        print(f"✅ Budget set: {monthly_budget} AZN for user {user.id}")

        # Return success response
        return JSONResponse(
            {
                "success": True,
                "message": f"Aylıq büdcə təyin edildi: {monthly_budget:.2f} AZN",
            },
            headers={"HX-Trigger": "update-stats"},
        )
    except Exception as e:
        print(f"❌ Set Budget Error: {e}")
        import traceback

        traceback.print_exc()
        return JSONResponse(
            {"success": False, "error": f"Xəta: {str(e)}"}, status_code=500
        )
