"""Rewards routes"""
from fastapi import Request, Depends, Form, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from database import get_db
from models import UserReward
from config import app
from utils.auth import get_current_user

@app.get("/rewards")
def rewards_page(request: Request, db: Session = Depends(get_db)):
    """Rewards page - Redirects to React frontend"""
    return JSONResponse({
        "message": "Please use the React frontend",
        "api_endpoint": "/api/rewards-data"
    })


@app.get("/api/rewards-data")
async def get_rewards_data(request: Request, db: Session = Depends(get_db)):
    """Get rewards data for React frontend"""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Get user's claimed rewards
    claimed_rewards = db.query(UserReward).filter(UserReward.user_id == user.id).order_by(UserReward.claimed_at.desc()).all()
    
    # Count by type
    reward_counts = {}
    for reward in claimed_rewards:
        reward_counts[reward.reward_type] = reward_counts.get(reward.reward_type, 0) + 1
    
    # Format claimed rewards
    formatted_rewards = [
        {
            "id": reward.id,
            "reward_type": reward.reward_type,
            "reward_name": reward.reward_name,
            "coins_spent": reward.coins_spent,
            "claimed_at": reward.claimed_at.isoformat() if reward.claimed_at else None
        }
        for reward in claimed_rewards
    ]
    
    return JSONResponse({
        "success": True,
        "user": {
            "coins": user.coins if hasattr(user, 'coins') and user.coins is not None else 0,
        },
        "claimed_rewards": formatted_rewards,
        "reward_counts": reward_counts
    })


@app.post("/api/claim-reward")
async def claim_reward(
    request: Request,
    reward_type: str = Form(...),
    db: Session = Depends(get_db)
):
    """Claim a reward and deduct coins"""
    user = get_current_user(request, db)
    if not user:
        return JSONResponse({"success": False, "error": "Authentication required"}, status_code=401)
    
    # Define rewards - Coffee hədiyyələri saxlanıldı, qiymətlər artırıldı, yeni hədiyyələr əlavə edildi
    rewards = {
        "bronze": {"name": "Coffee Kuponu", "cost": 150},
        "silver": {"name": "Coffee Paket", "cost": 300},
        "gold": {"name": "Pul Mükafatı - 10 AZN", "cost": 500},
        "platinum": {"name": "Premium Paket", "cost": 2000}
    }
    
    if reward_type not in rewards:
        return JSONResponse({"success": False, "error": "Invalid reward type"}, status_code=400)
    
    reward_info = rewards[reward_type]
    cost = reward_info["cost"]
    
    # Check if user has enough coins
    if user.coins < cost:
        return JSONResponse({
            "success": False,
            "error": f"Kifayət qədər coin yoxdur. Lazım: {cost}, Sizin: {user.coins}"
        }, status_code=400)
    
    # Deduct coins
    user.coins -= cost
    
    # Create reward record
    from models import UserReward
    claimed_reward = UserReward(
        user_id=user.id,
        reward_type=reward_type,
        reward_name=reward_info["name"],
        coins_spent=cost
    )
    db.add(claimed_reward)
    db.commit()
    db.refresh(user)
    
    return JSONResponse({
        "success": True,
        "message": f"🎉 {reward_info['name']} alındı!",
        "remaining_coins": user.coins,
        "new_balance": user.coins,  # For frontend update
        "reward_name": reward_info["name"],
        "show_coupon": "Coffee" in reward_info["name"]
    }, headers={"HX-Trigger": "update-stats"})

