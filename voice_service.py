"""
Voice Command Service for FinMate AI
Handles voice-to-text, NLP parsing, and text-to-speech
"""

import os
import base64
import tempfile
import asyncio
from typing import Dict, Any, Optional
from openai import OpenAI
import edge_tts
from ai_service import ai_service
from models import Expense
from datetime import datetime

# API clients (prefer Groq Whisper, fallback to OpenAI)
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
groq_client = OpenAI(api_key=GROQ_API_KEY, base_url="https://api.groq.com/openai/v1") if GROQ_API_KEY else None
openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None


class VoiceService:
    """Manages voice command processing"""
    
    # Voice names for different languages (Female voices)
    VOICE_MAP = {
        "az": "az-AZ-BanuNeural",      # Azerbaijani female voice
        "en": "en-US-JennyNeural",     # English female voice
        "ru": "ru-RU-SvetlanaNeural"   # Russian female voice
    }
    
    @staticmethod
    async def transcribe_audio(audio_file_path: str, language: str = "az") -> Dict[str, Any]:
        """
        Convert audio to text using Groq Whisper (preferred) or OpenAI Whisper
        """
        if not groq_client and not openai_client:
            return {"success": False, "error": "Groq/OpenAI API key not configured", "text": ""}

        try:
            with open(audio_file_path, "rb") as audio_file:
                # Map language codes to Whisper format
                lang_map = {"az": "az", "en": "en", "ru": "ru"}
                whisper_lang = lang_map.get(language, "az")

                if groq_client:
                    transcript = groq_client.audio.transcriptions.create(
                        model="whisper-large-v3",
                        file=audio_file,
                        language=whisper_lang
                    )
                else:
                    transcript = openai_client.audio.transcriptions.create(
                        model="whisper-1",
                        file=audio_file,
                        language=whisper_lang
                    )

                return {"success": True, "text": transcript.text}
        except Exception as e:
            print(f"❌ Whisper Transcription Error: {e}")
            return {"success": False, "error": str(e), "text": ""}
    
    @staticmethod
    def parse_expense_from_text(text: str, user_language: str = "az") -> Dict[str, Any]:
        """
        Use Gemini to extract expense data from natural language
        
        Args:
            text: Transcribed text from user
            user_language: User's preferred language
            
        Returns:
            dict with amount, merchant, category, or error
        """
        
        # Multilingual prompts
        prompts = {
            "az": """Azərbaycan dilində bu cümlədən xərc məlumatını çıxart:
"{text}"

JSON formatında cavab ver:
{{
    "amount": 0.0,
    "merchant": "mağaza və ya xidmət adı",
    "category": "Market/Nəqliyyat/Kafe/Restoran/Geyim/Əyləncə/Kommunal/Aptек/Bank Xidməti/Digər"
}}

Yalnız JSON cavab ver, başqa mətn yox.""",
            
            "en": """Extract expense information from this English sentence:
"{text}"

Return JSON format:
{{
    "amount": 0.0,
    "merchant": "store or service name",
    "category": "Market/Transport/Cafe/Restaurant/Shopping/Entertainment/Bills/Health/Bank/Other"
}}

Only return JSON, no other text.""",
            
            "ru": """Извлеки информацию о расходе из этого русского предложения:
"{text}"

Верни в JSON формате:
{{
    "amount": 0.0,
    "merchant": "название магазина или услуги",
    "category": "Market/Transport/Cafe/Restaurant/Shopping/Entertainment/Bills/Health/Bank/Other"
}}

Только JSON, без другого текста."""
        }
        
        prompt = prompts.get(user_language, prompts["az"]).format(text=text)
        
        try:
            response = ai_service.model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Clean JSON response
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            
            import json
            expense_data = json.loads(response_text.strip())
            # If model returned a list, pick the first dict
            if isinstance(expense_data, list):
                expense_data = expense_data[0] if expense_data else {}
            if not isinstance(expense_data, dict):
                return {"error": "Invalid response format"}

            # Validate amount; fallback to regex if AI didn't return a valid number
            amount = expense_data.get("amount")
            if not amount or amount <= 0:
                import re
                m = re.search(r"([0-9]+(?:[\\.,][0-9]+)?)", text.replace("AZN", "").replace("manat", ""))
                if m:
                    try:
                        amount = float(m.group(1).replace(",", "."))
                        expense_data["amount"] = amount
                    except ValueError:
                        amount = None

            # Try to capture item name as merchant/category if missing
            merchant = (expense_data.get("merchant") or "").strip()
            category = (expense_data.get("category") or "").strip()
            # If user said what they bought, keep that as item name; otherwise just merchant
            item_name = merchant
            if not merchant:
                tokens = text.split()
                if tokens:
                    merchant = tokens[0].strip(",.")
                    item_name = merchant
            if not category:
                category = "Digər"

            # Build item payload if we have amount
            items = []
            if amount and amount > 0:
                items.append({
                    "name": item_name or "Məhsul",
                    "price": float(amount)
                })

            if not amount or amount <= 0:
                return {"error": "Invalid amount extracted"}

            return {
                "success": True,
                "amount": float(amount),
                "merchant": merchant or "Səslə Əlavə",  # Ensure never NULL
                "category": category,
                "items": items
            }
            
        except Exception as e:
            print(f"❌ NLP Parsing Error: {e}")
            return {
                "success": False,
                "error": f"Could not parse expense: {str(e)}"
            }
    
    @staticmethod
    async def generate_voice_response(text: str, language: str = "az") -> Optional[bytes]:
        """
        Convert text to speech using edge-tts with female voices
        """
        if not text or not text.strip():
            print("❌ TTS Error: Empty text")
            return None
        
        try:
            voice = VoiceService.VOICE_MAP.get(language, VoiceService.VOICE_MAP["az"])
            print(f"🔊 TTS: Generating with voice {voice}, text: {text[:50]}...")
            
            # Create temp file
            with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp_file:
                tmp_path = tmp_file.name
            
            # Load proxies if available
            proxy = None
            proxies_file = "proxies.txt"
            if os.path.exists(proxies_file):
                try:
                    with open(proxies_file, "r") as f:
                        proxies = [line.strip() for line in f if line.strip() and not line.startswith("#")]
                    if proxies:
                        import random
                        raw_proxy = random.choice(proxies)
                        
                        # Handle IP:PORT:USER:PASS format
                        parts = raw_proxy.split(':')
                        if len(parts) == 4:
                            # Convert to http://user:pass@ip:port
                            proxy = f"http://{parts[2]}:{parts[3]}@{parts[0]}:{parts[1]}"
                        else:
                            # Assume it's already in correct format or just IP:PORT
                            if not raw_proxy.startswith("http"):
                                proxy = f"http://{raw_proxy}"
                            else:
                                proxy = raw_proxy
                                
                        print(f"🔄 TTS: Using proxy: {proxy}")
                except Exception as e:
                    print(f"⚠️ Proxy Error: {e}")

            try:
                # Generate audio using edge-tts
                communicate = edge_tts.Communicate(text, voice, proxy=proxy)
                await communicate.save(tmp_path)
                
                # Wait a bit to ensure file is written
                await asyncio.sleep(0.2)
                
                # Check file exists and has content
                if not os.path.exists(tmp_path):
                    raise Exception("Audio file not created")
                
                file_size = os.path.getsize(tmp_path)
                if file_size == 0:
                    raise Exception("Audio file is empty")
                
                print(f"✅ TTS: Generated {file_size} bytes")
                
                # Read and return audio
                with open(tmp_path, "rb") as f:
                    audio_data = f.read()
                
                if not audio_data or len(audio_data) == 0:
                    raise Exception("No audio data read from file")
                
                return audio_data
                
            finally:
                # Clean up temp file
                if os.path.exists(tmp_path):
                    try:
                        os.unlink(tmp_path)
                    except:
                        pass
            
        except Exception as e:
            print(f"❌ TTS Error: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    @staticmethod
    async def process_voice_command(
        audio_data: bytes, 
        user, 
        db_session,
        language: str = "az",
        mime_type: Optional[str] = None,
        save_to_db: bool = True
    ) -> Dict[str, Any]:
        """
        End-to-end voice command processing
        
        Args:
            audio_data: Raw audio bytes from client
            user: User model instance
            db_session: Database session
            language: User's preferred language
            save_to_db: If False, only transcribe and parse without saving
            
        Returns:
            dict with expense_data, ai_response_audio, success
        """
        
        # Pick file suffix based on mime
        suffix_map = {
            "audio/webm": ".webm",
            "audio/mp4": ".mp4",
            "audio/mpeg": ".mp3",
            "audio/ogg": ".ogg",
            "audio/wav": ".wav"
        }
        suffix = suffix_map.get(mime_type or "", ".webm")
        
        # Save audio temporarily
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp_audio:
            tmp_audio.write(audio_data)
            audio_path = tmp_audio.name
        
        try:
            # Step 1: Transcribe audio
            transcription = await VoiceService.transcribe_audio(audio_path, language)
            
            if not transcription["success"]:
                return {
                    "success": False,
                    "error": transcription.get("error", "Could not transcribe audio")
                }
            
            transcribed_text = transcription["text"]
            
            # Step 2: Parse expense from text
            expense_info = VoiceService.parse_expense_from_text(transcribed_text, language)
            
            if not expense_info.get("success"):
                return {
                    "success": False,
                    "error": expense_info.get("error", "Could not parse expense")
                }
            
            # If not saving to DB, return parsed data for confirmation
            if not save_to_db:
                return {
                    "success": True,
                    "transcribed_text": transcribed_text,
                    "expense_data": expense_info
                }
            
            # Step 3: Save expense to database (use local time now)
            expense = Expense(
                user_id=user.id,
                amount=expense_info["amount"],
                merchant=expense_info["merchant"],
                category=expense_info["category"],
                date=datetime.now()
            )
            db_session.add(expense)
            db_session.commit()
            
            # Step 4: Generate AI response
            response_texts = {
                "az": f"{expense_info['amount']:.2f} manat {expense_info['category']} kateqoriyasında saxlandı.",
                "en": f"{expense_info['amount']:.2f} AZN saved in {expense_info['category']} category.",
                "ru": f"{expense_info['amount']:.2f} манат сохранено в категории {expense_info['category']}."
            }
            
            response_text = response_texts.get(language, response_texts["az"])
            
            # Step 5: Generate voice response
            audio_response = await VoiceService.generate_voice_response(response_text, language)
            
            return {
                "success": True,
                "transcribed_text": transcribed_text,
                "expense_data": expense_info,
                "response_text": response_text,
                "audio_response": base64.b64encode(audio_response).decode() if audio_response else None,
                "expense_id": expense.id
            }
            
        except Exception as e:
            print(f"❌ Voice Command Error: {e}")
            return {
                "success": False,
                "error": str(e)
            }
        finally:
            # Clean up temp file
            if os.path.exists(audio_path):
                os.unlink(audio_path)


# Singleton instance
voice_service = VoiceService()
