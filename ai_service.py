import google.generativeai as genai
import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()
# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
print(GEMINI_API_KEY)
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("⚠️  WARNING: GEMINI_API_KEY not found in environment variables")


class FinMateAI:
    """AI Service for FinMate - handles both chatbot and receipt analysis"""
    
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-2.0-flash')
    
    def determine_persona(self, user) -> tuple:
        """
        Determine AI persona based on user settings
        Priority: Manual selection > Auto-detection
        
        Returns: (persona_name, system_prompt)
        """
        ai_name = user.ai_name or "FinMate"
        
        # CRITICAL: If user manually selected a mode, ALWAYS use it
        # Do NOT override with auto-detection
        if user.ai_persona_mode == "Manual" and user.ai_attitude and user.ai_style:
            return self._build_manual_persona(ai_name, user.ai_attitude, user.ai_style)
        
        # Only use auto-detection if user hasn't made manual selection
        if user.ai_persona_mode == "Auto":
            # Calculate budget remaining
            remaining = max(0, user.monthly_budget - user.calculate_current_month_spending())
            remaining_percentage = remaining / user.monthly_budget if user.monthly_budget > 0 else 0
            
            # Auto-detect based on budget
            if remaining_percentage < 0.2:
                return self._build_auto_persona(ai_name, "strict", remaining_percentage)
            elif remaining_percentage > 0.5:
                return self._build_auto_persona(ai_name, "professional", remaining_percentage)
            else:
                return self._build_auto_persona(ai_name, "friendly", remaining_percentage)
        
        # Fallback: friendly mode
        return self._build_auto_persona(ai_name, "friendly", 0.5)
    
    def _build_manual_persona(self, ai_name: str, attitude: str, style: str) -> tuple:
        """Build persona from manual user settings"""
        
        # Attitude mapping - DAHA SPESIFIK
        attitude_prompts = {
            "Professional": f"""Sənin adın {ai_name}-dir. Sən peşəkar maliyyə müşavirisən.
Rəsmi, bilikli və hörmətli danış. Terminologiya işlət.
Emojilər: 💼📊📈""",
            
            "Strict": f"""Sənin adın {ai_name}-dir. Sən sərt və tələbkardırsan!
İsrafa qarşı sərt tənqid et. "Bunu almağa dəyməz!", "Çox xərcləyirsən!" kimi ifadələr işlət.
Emojilər: 😠⚠️❌""",
            
            "Funny": f"""Sənin adın {ai_name}-dir. Sən zarafatcıl və gülməlisən!
Maliyyə məsləhətlərini zarafat və yumor ilə ver. İnsanları güldür.
"Ay bu nə xərcdi, cibini boşaltdın!" kimi zarafatlar et.
Emojilər: 😂🤣💸😅""",
            
            "Sarcastic": f"""Sənin adın {ai_name}-dir. Sən kinayəli və sarkastiksən.
İroni ilə danış: "Vay, yenə alış-veriş? Təəccüblü!", "Büdcən o qədər də vacib deyilmiş ha?"
Emojilər: 😏🙄""",
            
            "Supportive": f"""Sənin adın {ai_name}-dir. Sən dəstəkləyici və mehribansən.
Həmişə təşviq et: "Afərin, yaxşı gedir!", "Narahat olma, düzələcək!"
Emojilər: 🤗💪✨"""
        }
        
        # Style mapping
        style_additions = {
            "Formal": " Ədəbli və rəsmi ifadələr işlət.",
            "Slang": " Jarqon işlət: 'brat', 'kanka', 'ay dayı', 'nə var nə yox'.",
            "Shakespearean": " Poeziya və şair dili ilə danış, lirik ifadələr işlət.",
            "Dialect": " Azərbaycan ləhcəsi: 'bala', 'oğul', 'ay görəsən', 'neyləyək'.",
            "Short": " Qısa cavablar - MAX 2 cümlə!"
        }
        
        base_prompt = attitude_prompts.get(attitude, attitude_prompts["Professional"])
        style_addition = style_additions.get(style, "")
        
        full_prompt = base_prompt + style_addition + "\n\nBu rola TAM uyğun danış. Roldan çıxma!"
        
        return (f"{attitude} - {style}", full_prompt)
    
    def _build_auto_persona(self, ai_name: str, persona_type: str, remaining_percentage: float) -> tuple:
        """Build persona based on auto-detection logic."""
        if persona_type == "strict":
            return ("Sərt Ana / Boss", f"""Sənin adın {ai_name}-dir.
Sən istifadəçinin sərt, tələbkar maliyyə nəzarətçisisən - Azərbaycanlı Ana kimi.
İstifadəçi büdcəsini bitirmək üzrədir! {remaining_percentage *100:.1f}% qalıb!

Onu danla, israfçılığını üzünə vur. Sərt ol:
- "Pulu su kimi xərcləyirsən!"
- "Maaşa qədər daş yeyəcəksən?"
- "Ay bala, atan bankdamı işləyir?"
- "Məni qəbirdən çıxaracaqsan bu xərclərlə!"

Vicdan əzabı ver, amma sevgi ilə. Ana kimi qayğıkeşsən.
Emojilər işlət: 😤💔😢👵""")
        
        elif remaining_percentage > 0.5:  # Safe Zone
            return ("Professional CFO", f"""Sənin adın {ai_name}-dir.
Sən peşəkar, hörmətli maliyyə müşavirisən (CFO).
İstifadəçi ƏLA qənaət edir - büdcənin {remaining_percentage*100:.1f}%-i qalıb!

Ona "Cənab/Xanım" deyə müraciət et. Rəsmi və hörmətli ol:
- İnvestisiya təklifləri ver
- Uzunmüddətli planlar təklif et
- Peşəkar terminologiya işlət
- "Maliyyə strategiyanız əla görünür"
- "Portfelinizi şaxələndirməyi düşünün"

Hvetləndirici və rəsmi danış. Emojilər: 💼📊📈✨""")
        
        else:  # Neutral: Friendly Buddy
            return ("Dost / Kanka", f"""Sənin adın {ai_name}-dir.
Sən istifadəçinin yaxın dostusan (Kanka, Brat).
Büdcə normalda - {remaining_percentage*100:.1f}% qalıb, pis deyil!

Səmimi, jarqonla danış:
- "Brat, vəziyyət pis deyil"
- "Gəl bir az da sıxaq, kefi yüksək!"
- "Ay kanka, bu xərci düşün bir az"
- "Yaxşısan brat, davam!"

Dostcasına məsləhət ver, rahat ol. Emojilər: 😎🤙💪🔥""")
    
    def _build_manual_persona(self, ai_name: str, attitude: str, style: str) -> tuple:
        """Build persona from manual user settings"""
        
        # Attitude mapping
        attitude_prompts = {
            "Professional": "Sən peşəkar, bilikli maliyyə müşavirisən. Rəsmi və hörmətli danış.",
            "Strict": "Sən sərt və tələbkardırsan. İsrafçılığa qarşı sərt tənqid et.",
            "Funny": "Sən zarafatcıl və gülməlisən. Maliyyə məsləhətlərini zarafatla ver.",
            "Sarcastic": "Sən sarkastik və kinayəlisən. İroni ilə həqiqətləri de.",
            "Supportive": "Sən dəstəkləyici və mülayimsən. Həmişə təşviq edici ol."
        }
        
        # Style mapping
        style_prompts = {
            "Formal": "Rəsmi dillə danış, ifadələr ədəb-ərkan daxilində olsun.",
            "Slang": "Jarqon işlət: 'brat', 'kanka', 'ay dayı' kimi sözlər.",
            "Shakespearean": "Poeziya və şair dili ilə danış, lirik ifadələr işlət.",
            "Dialect": "Azərbaycan ləhcəsi ilə: 'bala', 'oğul', 'ay görəsən' kimi.",
            "Short": "Qısa və dəqiq cavablar ver. Maksimum 2-3 cümlə."
        }
        
        attitude_text = attitude_prompts.get(attitude, attitude_prompts["Professional"])
        style_text = style_prompts.get(style, style_prompts["Formal"])
        
        prompt = f"""Sənin adın {ai_name}-dir.
Sən istifadəçinin maliyyə köməkçisisən.

XARAKTER: {attitude_text}
DANIŞIQ TƏRZİ: {style_text}

Bu rola TAM uyğun şəkildə danış. Heç vaxt roldan çıxma.
İstifadəçinin maliyyə məlumatlarına əsasən dəqiq məsləhət ver."""
        
        return (f"{attitude} - {style}", prompt)
    
    def chat_with_cfo(
        self, 
        user_message: str, 
        db_context: Dict[str, Any],
        chat_history: List[Dict[str, str]] = None,
        language: str = "az",
        user = None  # NEW: User model object for persona
    ) -> str:
        """
        Context-aware financial advisor chatbot with dynamic persona
        
        Args:
            user_message: The user's question
            db_context: Financial data from database (spending, budget, etc.)
            chat_history: Previous chat messages for context
            language: Preferred language
            user: User model object for AI persona settings
            
        Returns:
            AI response as string
        """
        
        # Build context string from database
        context_parts = []
        
        total_spending = db_context.get("total_spending", 0)
        budget = db_context.get("budget", 1000)
        
        if "total_spending" in db_context:
            context_parts.append(f"Total spending this month: {db_context['total_spending']:.2f} AZN")
        
        if "budget" in db_context:
            context_parts.append(f"Monthly budget: {db_context['budget']:.2f} AZN")
            if "total_spending" in db_context:
                budget_used = (db_context['total_spending'] / db_context['budget']) * 100
                remaining = budget - total_spending
                context_parts.append(f"Budget utilization: {budget_used:.1f}%")
                context_parts.append(f"Remaining budget: {remaining:.2f} AZN")
        
        if "category_breakdown" in db_context and db_context["category_breakdown"]:
            breakdown = ", ".join([f"{cat}: {amt:.2f} AZN" for cat, amt in db_context["category_breakdown"].items()])
            context_parts.append(f"Spending by category: {breakdown}")
        
        if "subscription_count" in db_context:
            context_parts.append(f"Active subscriptions: {db_context['subscription_count']}")
        
        if "recent_expenses" in db_context and db_context["recent_expenses"]:
            recent = ", ".join([f"{exp['merchant']} ({exp['amount']:.2f} AZN)" 
                               for exp in db_context["recent_expenses"][:3]])
            context_parts.append(f"Recent expenses: {recent}")
        
        if "largest_expense" in db_context and db_context["largest_expense"]:
            exp = db_context["largest_expense"]
            context_parts.append(f"Largest expense: {exp['merchant']} - {exp['amount']:.2f} AZN ({exp['category']})")
        
        context_str = "\n".join(context_parts)
        
        # Build conversation history
        history_str = ""
        if chat_history:
            history_messages = []
            for msg in chat_history[-6:]:  # Last 6 messages for context
                role = "User" if msg["role"] == "user" else "Assistant"
                history_messages.append(f"{role}: {msg['content']}")
            history_str = "\n".join(history_messages)
        
        # Language guard
        language = (language or "az").lower()
        language_instruction = {
            "az": "Cavabı yalnız Azərbaycan dilində yaz. İngilis dilinə keçmə.",
            "en": "Answer strictly in English.",
            "ru": "Отвечай строго на русском языке."
        }.get(language, "Cavabı yalnız Azərbaycan dilində yaz.")
        
        # Get dynamic persona
        if user:
            persona_name, base_personality = self.determine_persona(user)
        else:
            # Fallback if no user object
            base_personality = "Sən FinMate AI, dostcasına maliyyə köməkçisisən."
        
        # System prompt
        system_prompt = f"""{base_personality}

**User's Financial Data:**
{context_str}

**Previous Conversation:**
{history_str if history_str else "No previous conversation"}

**Instructions:**
- Answer the user's question based ONLY on the data provided above
- Be concise, friendly, and conversational
- Use emojis occasionally to make responses engaging 😊
- Provide actionable insights when relevant
- If the data doesn't contain the answer, politely say you need more information
- Use "AZN" as the currency
- Keep responses under 100 words unless detailed analysis is needed
- Respond in the user's preferred language: {language}
- {language_instruction}

**User Question:** {user_message}

**Your Response:**"""

        try:
            response = self.model.generate_content(system_prompt)
            return response.text.strip()
        except Exception as e:
            print(f"❌ Gemini API Error: {e}")
            return f"AI-də problem var 🤔 Gemini API açarını yoxla. Xəta: {str(e)}"
    
    def analyze_receipt(self, image_path: str) -> Dict[str, Any]:
        """
        Analyze receipt image and extract itemized data
        
        Args:
            image_path: Path to receipt image file
            
        Returns:
            Dictionary with merchant, date, items, total
        """

        # If API key missing, avoid remote call and return graceful fallback
        if not GEMINI_API_KEY:
            return self._fallback_receipt(
                image_path,
                "Gemini API açarı tapılmadı, sadə offline nəticə göstərildi."
            )
        
        prompt = """Analyze this image. First, determine if this is a valid receipt, bill, or invoice.
If it is NOT a receipt/bill/invoice, return ONLY: {"is_receipt": false}

If it IS a receipt, extract the following information in JSON format:

{
    "is_receipt": true,
    "merchant": "name of the store/restaurant",
    "date": "date in YYYY-MM-DD format",
    "currency": "AZN or currency code (USD, EUR, TRY, RUB, GBP)",
    "items": [
        {"name": "item name", "price": 0.00},
        ...
    ],
    "total": 0.00,
    "suggested_category": "one of: Food, Transport, Shopping, Bills, Entertainment, Health, Other"
}

Be accurate with numbers. If you can't read something clearly, use your best judgment.
If the currency appears to be foreign, set the correct currency code.
Return ONLY the JSON, no additional text."""

        try:
            # Upload image to Gemini
            uploaded_file = genai.upload_file(image_path)
            
            # Generate content with image
            response = self.model.generate_content([prompt, uploaded_file])
            
            # Parse JSON response
            response_text = response.text.strip()
            # Remove markdown code blocks if present
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            
            receipt_data = json.loads(response_text.strip())
            
            # Ensure items key exists
            if "items" not in receipt_data:
                receipt_data["items"] = []
            
            return receipt_data
            
        except Exception as e:
            print(f"❌ Receipt Analysis Error: {e}")
            return self._fallback_receipt(
                image_path,
                f"AI xidməti çatmadı ({str(e)}) - əl ilə təsdiq üçün sadə nəticə."
            )

    def _fallback_receipt(self, image_path: str, reason: str) -> Dict[str, Any]:
        """Offline/failed AI fallback so UX doesn't break."""
        merchant_guess = os.path.splitext(os.path.basename(image_path))[0] or "Unknown Merchant"
        merchant_guess = merchant_guess.replace("_", " ").replace("-", " ").title()[:30]
        return {
            "is_receipt": True,
            "merchant": merchant_guess or "Qəbz",
            "date": datetime.now().strftime("%Y-%m-%d"),
            "currency": "AZN",
            "items": [],
            "total": 0.0,
            "suggested_category": "Other",
            "note": reason
        }


# Singleton instance
ai_service = FinMateAI()
