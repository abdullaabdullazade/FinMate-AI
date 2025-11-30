# 🚀 FinMate AI - Backend

Bu proyekt FinMate AI aplikasiyasının FastAPI backend hissəsidir.

## 📋 Tələblər

- Python 3.12 və ya daha yeni versiya
- pip (Python package manager)
- SQLite (default olaraq Python ilə gəlir)

## 🛠️ Quraşdırma

### 1. Virtual Environment yaradın (tövsiyə olunur)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Linux/Mac üçün
# və ya
venv\Scripts\activate  # Windows üçün
```

### 2. Dependencies quraşdırın

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 3. Environment Variables təyin edin

`.env` faylı yaradın (backend qovluğunda):

```env
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here  # Optional
```

**Qeyd:** Gemini API key əldə etmək üçün: https://makersuite.google.com/app/apikey

### 4. Database-i initialize edin

Database avtomatik olaraq ilk işə salınanda yaradılacaq. Əgər manual olaraq yaratmaq istəyirsinizsə:

```bash
python database.py
```

Bu komanda:
- Database faylını yaradır (`finmate.db`)
- Bütün cədvəlləri yaradır
- Demo data əlavə edir (optional)

## 🏃 İşə Salma

### Development Mode

```bash
python main.py
```

Və ya:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8200
```

Backend `http://localhost:8200` ünvanında işləyəcək.

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8200
```

## 🐳 Docker ilə İşə Salma

### Docker Image yaratmaq

```bash
docker build -t finmate-backend .
```

### Docker Container işə salmaq

```bash
docker run -d \
  -p 8200:8200 \
  -v $(pwd)/finmate.db:/app/finmate.db \
  -v $(pwd)/static/uploads:/app/static/uploads \
  --env-file .env \
  --name finmate-backend \
  finmate-backend
```

## 📁 Struktur

```
backend/
├── main.py                 # FastAPI application entry point
├── config.py              # Application configuration (CORS, middleware)
├── database.py            # Database setup və seed data
├── models.py              # SQLAlchemy database models
├── requirements.txt       # Python dependencies
├── Dockerfile             # Docker image konfiqurasiyası
├── routes/                # API route handlers
│   ├── auth.py           # Authentication endpoints
│   ├── dashboard.py      # Dashboard data endpoints
│   ├── chat.py           # AI chat endpoints
│   ├── scan.py           # Receipt scanning endpoints
│   ├── expenses.py       # Expense management endpoints
│   ├── profile.py        # User profile endpoints
│   ├── rewards.py        # Gamification endpoints
│   ├── dreams.py         # Dream vault endpoints
│   ├── notifications.py # Notification endpoints
│   ├── settings.py       # Settings endpoints
│   ├── stats.py          # Statistics endpoints
│   ├── heatmap.py        # Heatmap data endpoints
│   ├── websocket.py      # WebSocket endpoints
│   └── export.py         # Export functionality
├── utils/                 # Utility functions
│   ├── auth.py           # Authentication utilities
│   ├── calculations.py   # Financial calculations
│   └── ai_notifications.py # AI notification utilities
├── static/                # Static files
│   └── uploads/          # Uploaded receipt images
└── finmate.db            # SQLite database (auto-generated)
```

## 🔌 API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/signup` - User registration
- `POST /api/logout` - User logout
- `GET /api/check-auth` - Check authentication status

### Dashboard
- `GET /api/dashboard-data` - Get dashboard statistics
- `GET /api/recent-expenses` - Get recent expenses

### Chat
- `POST /api/chat` - Send chat message to AI
- `GET /api/chat-history` - Get chat history

### Receipt Scanning
- `POST /api/scan-receipt` - Upload and scan receipt image

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/{id}` - Update expense
- `DELETE /api/expenses/{id}` - Delete expense

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Rewards & Gamification
- `GET /api/rewards` - Get user rewards
- `GET /api/leaderboard` - Get leaderboard

### Dreams
- `GET /api/dreams` - Get user dreams
- `POST /api/dreams` - Create new dream
- `PUT /api/dreams/{id}` - Update dream
- `DELETE /api/dreams/{id}` - Delete dream

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings

### Statistics
- `GET /api/stats` - Get various statistics

### Heatmap
- `GET /api/heatmap` - Get spending heatmap data

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/{id}/read` - Mark notification as read

### Export
- `GET /api/export/pdf` - Export data as PDF

## 🔧 Konfiqurasiya

### CORS Settings

Backend `config.py` faylında CORS ayarları var. Frontend üçün aşağıdakı origin-lər icazə verilir:

- `http://localhost:3000` (React dev server)
- `http://localhost:5173` (Vite dev server)
- `http://localhost:8200` (Backend port)

Yeni origin əlavə etmək üçün `config.py` faylını redaktə edin.

### Database

Default olaraq SQLite istifadə olunur. Database faylı `finmate.db` adı ilə backend qovluğunda yaradılır.

PostgreSQL və ya MySQL istifadə etmək istəyirsinizsə, `database.py` faylında `DATABASE_URL`-i dəyişdirin.

## 📦 Dependencies

Əsas dependencies:

- **FastAPI** - Web framework
- **Uvicorn** - ASGI server
- **SQLAlchemy** - ORM
- **python-jose** - JWT authentication
- **passlib** - Password hashing
- **google-generativeai** - Google Gemini AI
- **openai** - OpenAI API (optional)
- **WeasyPrint** - PDF generation
- **Pillow** - Image processing
- **python-multipart** - File uploads
- **python-dotenv** - Environment variables

Tam siyahı üçün `requirements.txt` faylına baxın.

## 🧪 Testing

API endpoint-lərini test etmək üçün:

1. Backend-i işə salın
2. Browser-də `http://localhost:8200/docs` ünvanına daxil olun (Swagger UI)
3. Və ya `http://localhost:8200/redoc` (ReDoc)

## 🔒 Təhlükəsizlik

Production üçün:

1. `.env` faylında secret key-ləri dəyişdirin
2. CORS origin-lərini məhdudlaşdırın
3. Rate limiting əlavə edin
4. HTTPS istifadə edin
5. Input validation əlavə edin
6. SQL injection qarşısını alın (SQLAlchemy bunu avtomatik edir)

## 📝 Qeydlər

- Database avtomatik olaraq ilk işə salınanda yaradılır
- Demo data `seed_demo_data()` funksiyası ilə əlavə edilir
- Static fayllar `static/` qovluğunda saxlanılır
- Upload edilmiş şəkillər `static/uploads/` qovluğunda saxlanılır

## 🐛 Problem Həlləri

### Port 8200 artıq istifadə olunur

Başqa port istifadə edin:

```bash
uvicorn main:app --host 0.0.0.0 --port 8201
```

### Database xətası

Database faylını silin və yenidən yaradın:

```bash
rm finmate.db
python database.py
```

### Dependencies quraşdırma xətası

Virtual environment istifadə etdiyinizə əmin olun və pip-i yeniləyin:

```bash
pip install --upgrade pip
pip install -r requirements.txt --no-cache-dir
```

## 📚 Əlavə Məlumat

Daha ətraflı məlumat üçün əsas README.md faylına baxın.

