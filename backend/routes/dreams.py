"""Dream vault routes"""

from fastapi import Request, Depends, Form, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from models import Expense, Dream, Income
from config import app
from utils.auth import get_current_user
from gamification import gamification


@app.get("/api/dreams")
async def get_dreams_api(request: Request, db: Session = Depends(get_db)):
    """Get all dreams for current user - JSON for React frontend"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")

    try:
        # Get all active dreams
        active_dreams = (
            db.query(Dream)
            .filter(Dream.user_id == user.id, Dream.is_completed == False)
            .order_by(Dream.priority.desc(), Dream.created_at.desc())
            .all()
        )

        # Get completed dreams
        completed_dreams = (
            db.query(Dream)
            .filter(Dream.user_id == user.id, Dream.is_completed == True)
            .order_by(Dream.updated_at.desc())
            .limit(5)
            .all()
        )

        # Serialize dreams
        def serialize_dream(dream):
            return {
                "id": dream.id,
                "title": dream.title,
                "description": dream.description,
                "target_amount": float(dream.target_amount),
                "saved_amount": float(dream.saved_amount),
                "image_url": dream.image_url,
                "category": dream.category,
                "target_date": (
                    dream.target_date.isoformat() if dream.target_date else None
                ),
                "priority": dream.priority,
                "created_at": (
                    dream.created_at.isoformat() if dream.created_at else None
                ),
                "updated_at": (
                    dream.updated_at.isoformat() if dream.updated_at else None
                ),
                "is_completed": dream.is_completed,
            }

        return JSONResponse(
            {
                "success": True,
                "dreams": [serialize_dream(d) for d in active_dreams]
                + [serialize_dream(d) for d in completed_dreams],
            }
        )
    except Exception as e:
        print(f"❌ Get Dreams API Error: {e}")
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)


@app.get("/dream-vault")
async def dream_vault_page(request: Request, db: Session = Depends(get_db)):
    """Dream Vault page - Redirects to React frontend"""
    # React frontend handles routing, so just return a simple response
    return JSONResponse(
        {"message": "Please use the React frontend", "api_endpoint": "/api/dreams"}
    )


@app.post("/api/dreams")
async def create_dream(
    request: Request,
    title: str = Form(...),
    description: Optional[str] = Form(None),
    target_amount: float = Form(...),
    image_url: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    target_date: Optional[str] = Form(None),
    priority: int = Form(1),
    db: Session = Depends(get_db),
):
    """Create a new dream"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")

    # Check active dreams limit
    active_dreams_count = (
        db.query(Dream)
        .filter(Dream.user_id == user.id, Dream.saved_amount < Dream.target_amount)
        .count()
    )

    if active_dreams_count >= 5:
        return JSONResponse(
            {"success": False, "error": "Maksimum 5 aktiv arzu yarada bilərsiniz"},
            status_code=400,
        )

    try:
        # Parse target_date if provided
        parsed_date = None
        if target_date:
            try:
                parsed_date = datetime.strptime(target_date, "%Y-%m-%d").date()
            except ValueError:
                pass

        dream = Dream(
            user_id=user.id,
            title=title,
            description=description,
            target_amount=target_amount,
            saved_amount=0.0,
            image_url=image_url,
            category=category or "Digər",
            target_date=parsed_date,
            priority=min(max(priority, 1), 5),  # Clamp between 1-5
        )
        db.add(dream)
        db.commit()
        db.refresh(dream)

        # Serialize dream and return JSON
        dream_data = {
            "id": dream.id,
            "title": dream.title,
            "description": dream.description,
            "target_amount": float(dream.target_amount),
            "saved_amount": float(dream.saved_amount),
            "image_url": dream.image_url,
            "category": dream.category,
            "target_date": dream.target_date.isoformat() if dream.target_date else None,
            "priority": dream.priority,
            "created_at": dream.created_at.isoformat() if dream.created_at else None,
            "updated_at": dream.updated_at.isoformat() if dream.updated_at else None,
            "is_completed": dream.is_completed,
        }
        return JSONResponse(
            {"success": True, "dream": dream_data, "message": "Arzu uğurla yaradıldı"}
        )
    except Exception as e:
        print(f"❌ Create Dream Error: {e}")
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)


@app.put("/api/dreams/{dream_id}")
async def update_dream(
    request: Request,
    dream_id: int,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    target_amount: Optional[float] = Form(None),
    image_url: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    target_date: Optional[str] = Form(None),
    priority: Optional[int] = Form(None),
    db: Session = Depends(get_db),
):
    """Update a dream"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    dream = (
        db.query(Dream).filter(Dream.id == dream_id, Dream.user_id == user.id).first()
    )

    if not dream:
        raise HTTPException(status_code=404, detail="Dream not found")

    try:
        if title is not None:
            dream.title = title
        if description is not None:
            dream.description = description
        if target_amount is not None:
            dream.target_amount = target_amount
        if image_url is not None:
            dream.image_url = image_url
        if category is not None:
            dream.category = category
        if target_date is not None:
            try:
                dream.target_date = datetime.strptime(target_date, "%Y-%m-%d").date()
            except ValueError:
                pass
        if priority is not None:
            dream.priority = min(max(priority, 1), 5)

        dream.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(dream)

        # Serialize dream and return JSON
        dream_data = {
            "id": dream.id,
            "title": dream.title,
            "description": dream.description,
            "target_amount": float(dream.target_amount),
            "saved_amount": float(dream.saved_amount),
            "image_url": dream.image_url,
            "category": dream.category,
            "target_date": dream.target_date.isoformat() if dream.target_date else None,
            "priority": dream.priority,
            "created_at": dream.created_at.isoformat() if dream.created_at else None,
            "updated_at": dream.updated_at.isoformat() if dream.updated_at else None,
            "is_completed": dream.is_completed,
        }
        return JSONResponse(
            {"success": True, "dream": dream_data, "message": "Arzu uğurla yeniləndi"}
        )
    except Exception as e:
        print(f"❌ Update Dream Error: {e}")
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)


@app.post("/api/dreams/{dream_id}/add-savings")
async def add_dream_savings(
    request: Request,
    dream_id: int,
    amount: float = Form(...),
    db: Session = Depends(get_db),
):
    """Add savings to a dream"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    dream = (
        db.query(Dream).filter(Dream.id == dream_id, Dream.user_id == user.id).first()
    )

    if not dream:
        raise HTTPException(status_code=404, detail="Dream not found")

    try:
        # Check if user has enough balance
        now = datetime.utcnow()
        month_start = datetime(now.year, now.month, 1)

        # Calculate current balance (all in AZN)
        expenses = (
            db.query(Expense)
            .filter(Expense.user_id == user.id, Expense.date >= month_start)
            .all()
        )
        incomes = (
            db.query(Income)
            .filter(Income.user_id == user.id, Income.date >= month_start)
            .all()
        )

        total_spending_azn = sum(exp.amount for exp in expenses)
        total_income_azn = sum(inc.amount for inc in incomes)
        current_balance_azn = (
            user.monthly_budget + total_income_azn - total_spending_azn
        )

        # Amount is already in AZN (only AZN supported)
        amount_azn = amount

        # Calculate remaining amount needed to complete the dream
        remaining_needed = dream.target_amount - dream.saved_amount

        # Only deduct the amount needed if user entered more than remaining
        # If dream needs 500 but user entered 700, only deduct 500
        actual_amount_to_deduct = (
            min(amount_azn, remaining_needed) if remaining_needed > 0 else 0
        )

        if actual_amount_to_deduct <= 0:
            return JSONResponse(
                {"success": False, "error": "Bu arzu artıq tamamlanıb!"},
                status_code=400,
            )

        if current_balance_azn < actual_amount_to_deduct:
            return JSONResponse(
                {
                    "success": False,
                    "error": f"Kifayət qədər balansınız yoxdur. Cari balans: {current_balance_azn:.2f} AZN",
                },
                status_code=400,
            )

        # Create expense record for the savings (this will reduce the balance)
        # Store amount in AZN (as all expenses are stored in AZN)
        expense = Expense(
            user_id=user.id,
            amount=actual_amount_to_deduct,  # Only deduct what's needed
            merchant=f"Arzu: {dream.title}",
            category="Qənaət",
            date=datetime.utcnow(),
            notes=f"Arzuya qənaət: {dream.title}",
        )
        db.add(expense)

        dream.saved_amount += actual_amount_to_deduct

        # Award XP for funding a dream
        gamification.award_xp(user, "add_savings", db)

        # Check if dream is completed
        dream_was_completed = False
        if dream.saved_amount >= dream.target_amount:
            dream.saved_amount = dream.target_amount
            dream.is_completed = True
            dream.updated_at = datetime.utcnow()
            dream_was_completed = True
            # Award bonus XP for completing a dream
            gamification.award_xp(user, "complete_dream", db)

        db.commit()
        db.refresh(dream)

        # Serialize dream and return JSON
        dream_data = {
            "id": dream.id,
            "title": dream.title,
            "description": dream.description,
            "target_amount": float(dream.target_amount),
            "saved_amount": float(dream.saved_amount),
            "image_url": dream.image_url,
            "category": dream.category,
            "target_date": dream.target_date.isoformat() if dream.target_date else None,
            "priority": dream.priority,
            "created_at": dream.created_at.isoformat() if dream.created_at else None,
            "updated_at": dream.updated_at.isoformat() if dream.updated_at else None,
            "is_completed": dream.is_completed,
        }
        return JSONResponse(
            {
                "success": True,
                "dream": dream_data,
                "message": f"Qənaət uğurla əlavə edildi! {dream.saved_amount:.2f} / {dream.target_amount:.2f} AZN",
                "was_completed": dream_was_completed,
            }
        )
    except Exception as e:
        print(f"❌ Add Savings Error: {e}")
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)


@app.delete("/api/dreams/{dream_id}")
async def delete_dream(request: Request, dream_id: int, db: Session = Depends(get_db)):
    """Delete a dream"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    dream = (
        db.query(Dream).filter(Dream.id == dream_id, Dream.user_id == user.id).first()
    )

    if not dream:
        return JSONResponse(
            {"success": False, "error": "Dream not found"}, status_code=404
        )

    try:
        db.delete(dream)
        db.commit()

        # Return JSON response
        return JSONResponse({"success": True, "message": "Arzu uğurla silindi"})
    except Exception as e:
        print(f"❌ Delete Dream Error: {e}")
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)


@app.get("/api/dream-stats")
async def get_dream_stats(request: Request, db: Session = Depends(get_db)):
    """Get dynamic dream statistics - JSON for React frontend"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")

    # Get all active dreams
    dreams = (
        db.query(Dream)
        .filter(Dream.user_id == user.id, Dream.is_completed == False)
        .all()
    )

    # Calculate totals
    total_saved = sum(dream.saved_amount for dream in dreams)
    total_target = sum(dream.target_amount for dream in dreams)
    total_progress = (total_saved / total_target * 100) if total_target > 0 else 0

    # Return JSON for React frontend
    return JSONResponse(
        {
            "total_saved": float(total_saved),
            "total_target": float(total_target),
            "total_progress": float(total_progress),
        }
    )


@app.get("/api/dreams/{dream_id}/data")
async def get_dream_data(
    request: Request, dream_id: int, db: Session = Depends(get_db)
):
    """Get dream data for editing"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    dream = (
        db.query(Dream).filter(Dream.id == dream_id, Dream.user_id == user.id).first()
    )

    if not dream:
        return JSONResponse(
            {"success": False, "error": "Dream not found"}, status_code=404
        )

    return JSONResponse(
        {
            "success": True,
            "dream": {
                "id": dream.id,
                "title": dream.title,
                "description": dream.description,
                "target_amount": dream.target_amount,
                "saved_amount": dream.saved_amount,
                "image_url": dream.image_url,
                "category": dream.category,
                "target_date": (
                    dream.target_date.strftime("%Y-%m-%d")
                    if dream.target_date
                    else None
                ),
                "priority": dream.priority,
            },
        }
    )
