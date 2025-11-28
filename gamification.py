"""
Gamification Service for FinMate AI
Handles XP points, level progression, and rewards
"""
from models import XPLog

class GamificationService:
    """Manages user XP and level progression"""
    
    # Level thresholds
    LEVELS = [
        {"min_xp": 0, "max_xp": 49, "title": "Rookie", "emoji": "🌱"},
        {"min_xp": 50, "max_xp": 149, "title": "Saver", "emoji": "💰"},
        {"min_xp": 150, "max_xp": 299, "title": "Analyst", "emoji": "📊"},
        {"min_xp": 300, "max_xp": 499, "title": "Manager", "emoji": "🎯"},
        {"min_xp": 500, "max_xp": 999, "title": "CFO", "emoji": "👑"},
        {"min_xp": 1000, "max_xp": float('inf'), "title": "Legend", "emoji": "⭐"}
    ]
    
    # XP rewards for different actions
    XP_REWARDS = {
        "manual_expense": 10,
        "scan_receipt": 15,
        "chat_message": 5,
        "stay_under_budget": 100,
        "daily_login": 20,
        "week_streak": 50,
        "month_complete": 200,
        "create_dream": 25,
        "complete_dream": 100,
        "add_savings": 5,
        "voice_command": 15
    }
    
    @staticmethod
    def get_level_info(xp_points: int) -> dict:
        """Get level information based on XP points"""
        for level in GamificationService.LEVELS:
            if level["min_xp"] <= xp_points <= level["max_xp"]:
                return {
                    "title": level["title"],
                    "emoji": level["emoji"],
                    "min_xp": level["min_xp"],
                    "max_xp": level["max_xp"],
                    "current_xp": xp_points,
                    "progress_percentage": GamificationService._calculate_progress(xp_points, level)
                }
        
        # Max level
        last_level = GamificationService.LEVELS[-1]
        return {
            "title": last_level["title"],
            "emoji": last_level["emoji"],
            "min_xp": last_level["min_xp"],
            "max_xp": last_level["max_xp"],
            "current_xp": xp_points,
            "progress_percentage": 100
        }
    
    @staticmethod
    def _calculate_progress(xp: int, level: dict) -> float:
        """Calculate progress percentage within current level"""
        if level["max_xp"] == float('inf'):
            return 100.0
        
        level_range = level["max_xp"] - level["min_xp"] + 1
        progress = xp - level["min_xp"]
        return (progress / level_range) * 100
    
    @staticmethod
    def award_xp(user, action: str, db_session) -> dict:
        """
        Award XP to user for an action
        Returns dict with xp_awarded, level_up (bool), new_level_info
        """
        xp_amount = GamificationService.XP_REWARDS.get(action, 0)
        
        # Get old level
        old_level_info = GamificationService.get_level_info(user.xp_points)
        old_level_title = old_level_info["title"]
        
        # Award XP
        user.xp_points += xp_amount
        
        # Get new level
        new_level_info = GamificationService.get_level_info(user.xp_points)
        new_level_title = new_level_info["title"]
        
        # Check if level up occurred
        level_up = old_level_title != new_level_title
        
        # Update user's level title
        user.level_title = new_level_title
        
        # Bonus coins for leveling up
        coins_awarded = 0
        if level_up:
            coins_awarded = 10  # 10 coins per level up
            user.coins = (user.coins or 0) + coins_awarded
        
        # Create XP Log
        xp_log = XPLog(
            user_id=user.id,
            amount=xp_amount,
            action_type=action
        )
        db_session.add(xp_log)
        
        db_session.commit()
        
        return {
            "xp_awarded": xp_amount,
            "coins_awarded": coins_awarded,
            "level_up": level_up,
            "old_level": old_level_title,
            "new_level": new_level_title,
            "level_info": new_level_info
        }
    
    @staticmethod
    def get_next_level_info(current_xp: int) -> dict:
        """Get information about the next level"""
        current_level = GamificationService.get_level_info(current_xp)
        
        # Find next level
        for level in GamificationService.LEVELS:
            if level["min_xp"] > current_xp:
                xp_needed = level["min_xp"] - current_xp
                return {
                    "next_level_title": level["title"],
                    "next_level_emoji": level["emoji"],
                    "xp_needed": xp_needed,
                    "next_level_min_xp": level["min_xp"]
                }
        
        # Already at max level
        return {
            "next_level_title": "Max Level",
            "next_level_emoji": "🏆",
            "xp_needed": 0,
            "next_level_min_xp": current_xp
        }


# Create singleton instance
gamification = GamificationService()
