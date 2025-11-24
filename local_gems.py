"""
Local Gem Discovery - Ucuz və Keyfiyyətli Alternativlər
Bakı şəhəri üçün hardcoded məsləhətlər bazası
"""

# Bakı üçün ucuz alternativlər bazası
BAKU_LOCAL_GEMS = {
    "Starbucks": {
        "alternatives": [
            {
                "name": "Entree",
                "price": 4.0,
                "savings": 3.0,
                "description": "Kofe 4 manatdır, keyfiyyətli və ucuzdur",
                "category": "Kafe"
            },
            {
                "name": "Coffeeshop Company",
                "price": 3.5,
                "savings": 3.5,
                "description": "Kofe 3.5 manatdır, çox yaxşı keyfiyyət",
                "category": "Kafe"
            },
            {
                "name": "Coffeemania",
                "price": 4.5,
                "savings": 2.5,
                "description": "Kofe 4.5 manatdır, rahat mühit",
                "category": "Kafe"
            }
        ],
        "original_price": 7.0,
        "category": "Kafe"
    },
    "Kino": {
        "alternatives": [
            {
                "name": "CinemaPlus",
                "price": None,
                "savings": None,
                "description": "Çərşənbə axşamı endirimi var! 50% endirim",
                "category": "Əyləncə",
                "special_offer": "Çərşənbə axşamı endirimi"
            },
            {
                "name": "Park Cinema",
                "price": None,
                "savings": None,
                "description": "Həftə içi gündüz seansları daha ucuzdur",
                "category": "Əyləncə"
            }
        ],
        "category": "Əyləncə"
    },
    "McDonald's": {
        "alternatives": [
            {
                "name": "Burger House",
                "price": None,
                "savings": None,
                "description": "Yerli burger, daha ucuz və dadlı",
                "category": "Restoran"
            },
            {
                "name": "Burger King",
                "price": None,
                "savings": None,
                "description": "Bəzən daha ucuz kampaniyalar var",
                "category": "Restoran"
            }
        ],
        "category": "Restoran"
    },
    "Papa John's": {
        "alternatives": [
            {
                "name": "Pizza Mizza",
                "price": None,
                "savings": None,
                "description": "Yerli pizza, daha ucuz və keyfiyyətli",
                "category": "Restoran"
            },
            {
                "name": "Pizza Hut",
                "price": None,
                "savings": None,
                "description": "Həftə sonu kampaniyaları yoxla",
                "category": "Restoran"
            }
        ],
        "category": "Restoran"
    },
    "KFC": {
        "alternatives": [
            {
                "name": "Chicken House",
                "price": None,
                "savings": None,
                "description": "Yerli toyuq, daha ucuz",
                "category": "Restoran"
            }
        ],
        "category": "Restoran"
    },
    "Market": {
        "alternatives": [
            {
                "name": "Bravo",
                "price": None,
                "savings": None,
                "description": "Bəzən daha ucuz kampaniyalar var",
                "category": "Market"
            },
            {
                "name": "Araz",
                "price": None,
                "savings": None,
                "description": "Yerli market, ucuz qiymətlər",
                "category": "Market"
            }
        ],
        "category": "Market"
    }
}

# Kategoriya üzrə ümumi məsləhətlər
CATEGORY_TIPS = {
    "Kafe": [
        "Entree və Coffeeshop Company kofe üçün daha ucuz alternativlərdir",
        "Starbucks-dan əvəzinə yerli kafeləri yoxla",
        "Çox kafelərdə gündüz saatlarında endirimlər var"
    ],
    "Restoran": [
        "Yerli restoranlar çox vaxt daha ucuz və keyfiyyətlidir",
        "Həftə içi gündüz menyuları daha ucuzdur",
        "Online sifariş bəzən daha ucuzdur"
    ],
    "Əyləncə": [
        "CinemaPlus-da Çərşənbə axşamı endirimi var",
        "Həftə içi gündüz seansları daha ucuzdur",
        "Online biletlər bəzən daha ucuzdur"
    ],
    "Market": [
        "Bravo və Araz-da bəzən daha ucuz kampaniyalar var",
        "Həftə sonu endirimləri yoxla",
        "Böyük paketlər daha ucuzdur"
    ]
}


def find_local_gems(merchant: str, amount: float = None, category: str = None) -> list:
    """
    İstifadəçinin xərc etdiyi yer üçün ucuz alternativlər tap
    
    Args:
        merchant: Mağaza/restoran adı
        amount: Xərc edilən məbləğ
        category: Xərc kateqoriyası
        
    Returns:
        Alternativlər siyahısı
    """
    alternatives = []
    
    # Dəqiq uyğunluq yoxla
    merchant_lower = merchant.lower().strip()
    for key, value in BAKU_LOCAL_GEMS.items():
        if key.lower() in merchant_lower or merchant_lower in key.lower():
            alternatives = value.get("alternatives", [])
            break
    
    # Kategoriya üzrə məsləhətlər əlavə et
    if category and category in CATEGORY_TIPS:
        for tip in CATEGORY_TIPS[category]:
            alternatives.append({
                "name": "Ümumi Məsləhət",
                "price": None,
                "savings": None,
                "description": tip,
                "category": category,
                "is_tip": True
            })
    
    return alternatives


def format_gem_suggestion(merchant: str, amount: float, alternatives: list) -> str:
    """
    Alternativləri formatlaşdırılmış mətnə çevir
    
    Args:
        merchant: Orijinal mağaza
        amount: Orijinal məbləğ
        alternatives: Alternativlər siyahısı
        
    Returns:
        Formatlaşdırılmış mətn
    """
    if not alternatives:
        return ""
    
    suggestions = []
    for alt in alternatives[:3]:  # Maksimum 3 alternativ
        if alt.get("is_tip"):
            suggestions.append(f"💡 {alt['description']}")
        elif alt.get("price") and alt.get("savings"):
            savings_percent = (alt["savings"] / amount * 100) if amount > 0 else 0
            suggestions.append(
                f"📍 {alt['name']} - {alt['price']:.2f} AZN "
                f"({alt['savings']:.2f} AZN qənaət, {savings_percent:.0f}%)"
            )
        elif alt.get("special_offer"):
            suggestions.append(
                f"🎯 {alt['name']} - {alt['special_offer']}: {alt['description']}"
            )
        else:
            suggestions.append(f"📍 {alt['name']} - {alt['description']}")
    
    if suggestions:
        return "\n\n💎 Ucuz Alternativlər:\n" + "\n".join(suggestions) + "\n\nBu alternativləri yoxla, pul qənaət edəcəksən!"
    return ""

