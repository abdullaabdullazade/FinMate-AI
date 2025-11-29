# Backend Integration Guide - React Frontend

Bu sənəd backend-də React frontend üçün edilən dəyişiklikləri izah edir.

## ✅ Tamamlanan Dəyişikliklər

### 1. CORS Middleware
Backend-ə CORS middleware əlavə edildi ki, React frontend API-yə müraciət edə bilsin:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
        "http://localhost:5173",   # Vite dev server
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2. API Endpoint-ləri JSON-a çevrildi

#### `/api/dashboard-data` ✅
- **Əvvəl:** Yalnız category_data və daily_spending qaytarırdı
- **İndi:** Tam dashboard məlumatı qaytarır:
  - `context` - büdcə, xərclər, currency
  - `recents` - son əməliyyatlar
  - `chart_labels` və `chart_values` - chart üçün
  - `top_category` - ən çox xərc olunan kateqoriya

#### `/api/stats` ✅
- **Əvvəl:** HTML template qaytarırdı
- **İndi:** JSON qaytarır:
  ```json
  {
    "user": {
      "id": 1,
      "username": "demo",
      "xp": 100,
      "total_spent": 1500.0,
      "total_transactions": 25,
      "currency": "AZN"
    }
  }
  ```

#### `/api/chat` ✅
- **Əvvəl:** HTML template qaytarırdı (HTMX üçün)
- **İndi:** JSON qaytarır:
  ```json
  {
    "success": true,
    "response": "<strong>AI cavabı</strong>",
    "message": "<strong>AI cavabı</strong>",
    "user_message": "Sual",
    "xp_awarded": 5,
    "xp_result": {...}
  }
  ```

#### `/api/dashboard-stats` ✅
- **Əvvəl:** HTML template qaytarırdı
- **İndi:** JSON qaytarır:
  ```json
  {
    "total_spending": 1500.0,
    "total_income": 2000.0,
    "monthly_budget_display": 3000.0,
    "remaining_budget": 1500.0,
    "budget_percentage": 50.0,
    "eco_score": 75,
    "currency": "AZN"
  }
  ```

## 🔄 Uyğunluq

### Köhnə HTML Template-lər
Köhnə HTML template-lər (`templates/` qovluğu) hələ də mövcuddur, lakin React frontend istifadə etmir. Onlar backup kimi saxlanılıb.

### Session Management
Backend session-based authentication istifadə edir. React frontend `withCredentials: true` ilə cookies göndərir.

## 📝 API Endpoint-ləri

### Authentication
- `POST /api/login` - Login (FormData)
- `POST /api/signup` - Signup (FormData)
- `GET /logout` - Logout

### Dashboard
- `GET /api/dashboard-data` - Tam dashboard məlumatı (JSON)
- `GET /api/dashboard-stats` - Dashboard statistikaları (JSON)
- `GET /api/dashboard-updates` - Real-time updates (JSON)

### Chat
- `POST /api/chat` - Chat mesajı göndər (FormData) → JSON response

### Scan
- `POST /api/scan-receipt` - Receipt skan et (multipart/form-data)
- `POST /api/confirm-receipt` - Receipt təsdiqlə (JSON)

### Profile & Settings
- `GET /api/stats` - User stats (JSON)
- `GET /api/settings` - Settings məlumatı (JSON)
- `POST /api/settings` - Settings update (JSON)
- `POST /api/set-budget` - Budget set et (FormData)

### Expenses
- `POST /api/expense` - Yeni expense əlavə et (FormData)
- `PUT /api/expenses/{id}` - Expense update et (JSON)
- `DELETE /api/expenses/{id}` - Expense sil

### Dream Vault
- `GET /dream-vault` - Dream list (HTML - React üçün JSON-a çevrilməlidir)
- `POST /api/dreams` - Yeni dream əlavə et
- `PUT /api/dreams/{id}` - Dream update
- `DELETE /api/dreams/{id}` - Dream sil

## 🐛 Məlum Problemlər

1. **Dream Vault endpoint-ləri:** Bəzi endpoint-lər hələ də HTML qaytarır. React frontend üçün JSON-a çevrilməlidir.

2. **Profile endpoint:** `/profile` hələ də HTML qaytarır. React frontend üçün `/api/profile` JSON endpoint-i lazımdır.

## 🎯 Növbəti Addımlar

1. Qalan HTML endpoint-ləri JSON-a çevirmək
2. Error handling-i yaxşılaşdırmaq
3. API documentation (Swagger/OpenAPI) əlavə etmək

## 📚 Əlavə Məlumat

- Frontend API service: `frontend/src/services/api.js`
- Backend main file: `main.py`
- CORS konfiqurasiyası: `main.py` (line 53-63)

