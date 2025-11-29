# React Migration Guide

Bu sənəd proyektin React.js-ə çevrilməsi haqqında məlumat verir.

## ✅ Tamamlanan İşlər

### 1. React App Strukturu
- ✅ Vite ilə React app yaradıldı
- ✅ Tailwind CSS konfiqurasiya edildi
- ✅ Routing quraşdırıldı (React Router)
- ✅ Project structure yaradıldı

### 2. Komponentlər
- ✅ **Layout Komponentləri:**
  - BaseLayout
  - Header
  - Navigation (Desktop sidebar)
  - HamburgerMenu (Mobile menu)
  - FloatingScanButton

- ✅ **Common Komponentlər:**
  - ThemeToggle
  - AlertBell
  - UserStats
  - ProfileDropdown

- ✅ **Page Komponentləri:**
  - Dashboard
  - Chat
  - Scan
  - Profile
  - Settings
  - DreamVault
  - Rewards
  - Heatmap
  - Login
  - Signup
  - NotFound

### 3. Context API
- ✅ AuthContext - Authentication state management
- ✅ ThemeContext - Dark/Light theme management

### 4. API Service Layer
- ✅ Mərkəzləşdirilmiş API service (`services/api.js`)
- ✅ Bütün backend endpoint-lər üçün funksiyalar
- ✅ Axios interceptor-lar (error handling, auth)

### 5. Styling
- ✅ Tailwind CSS inteqrasiyası
- ✅ Hamburger menu CSS
- ✅ Chat page CSS
- ✅ Glassmorphism effects

### 6. Backend Dəyişiklikləri
- ✅ CORS middleware əlavə edildi
- ✅ React frontend üçün API endpoints hazırdır

## 📁 Yeni Struktur

```
smartspeed/
├── frontend/                 # Yeni React frontend
│   ├── src/
│   │   ├── components/      # React komponentləri
│   │   ├── contexts/        # Context API
│   │   ├── pages/           # Səhifə komponentləri
│   │   ├── services/        # API services
│   │   ├── styles/           # CSS faylları
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
├── templates/               # Köhnə HTML templates (artıq istifadə olunmur)
├── static/                  # Static fayllar (hələ də istifadə olunur)
├── main.py                  # Backend (CORS əlavə edildi)
└── ...
```

## 🚀 İstifadə

### Frontend işə salmaq:

```bash
cd frontend
npm install
npm run dev
```

Frontend `http://localhost:3000` ünvanında işləyəcək.

### Backend işə salmaq:

```bash
# Backend hələ də köhnə kimi işləyir
python main.py
# və ya
uvicorn main:app --reload
```

Backend `http://localhost:8000` ünvanında işləyəcək.

## 🔄 Migration Status

| Komponent | Status | Qeydlər |
|-----------|--------|---------|
| Dashboard | ✅ Tamamlandı | Chart.js inteqrasiyası var |
| Chat | ✅ Tamamlandı | AI chat interface hazırdır |
| Scan | ✅ Tamamlandı | Receipt scanner hazırdır |
| Profile | ✅ Tamamlandı | User stats göstərilir |
| Settings | ✅ Tamamlandı | Budget və theme settings |
| DreamVault | ✅ Tamamlandı | Basic structure hazırdır |
| Rewards | ✅ Tamamlandı | Basic structure hazırdır |
| Heatmap | ✅ Tamamlandı | Basic structure hazırdır |
| Authentication | ✅ Tamamlandı | Login/Signup hazırdır |
| Navigation | ✅ Tamamlandı | Desktop və mobile nav hazırdır |
| Theme Toggle | ✅ Tamamlandı | Dark/Light mode işləyir |

## 📝 Qeydlər

1. **Backend API:** Backend API-lər dəyişdirilməyib, sadəcə CORS əlavə edildi. Bütün endpoint-lər React frontend ilə işləyir.

2. **Static Files:** Köhnə `static/` qovluğundakı fayllar (icons, uploads) hələ də istifadə olunur. Onlar backend-dən serve edilir.

3. **Templates:** Köhnə HTML template-lər (`templates/` qovluğu) artıq istifadə olunmur, lakin silinməyib (backup kimi).

4. **Database:** Database strukturunda dəyişiklik yoxdur.

## 🎯 Növbəti Addımlar (Optional)

1. **State Management:** Əgər lazım olsa, Redux və ya Zustand əlavə edilə bilər
2. **Testing:** Jest və React Testing Library ilə testlər yazıla bilər
3. **Performance:** React.memo, useMemo, useCallback optimizasiyaları
4. **PWA:** Service worker və offline support
5. **TypeScript:** TypeScript-ə migration (optional)

## 🐛 Məlum Problemlər

1. **CORS:** Backend-də CORS middleware əlavə edildi. Əgər problem olarsa, `main.py`-də `allow_origins` list-inə frontend URL-i əlavə edin.

2. **Session:** Session cookies `withCredentials: true` ilə işləyir. Backend-də session middleware aktivdir.

3. **API Base URL:** Frontend-də API base URL `vite.config.js`-də proxy ilə və ya `.env` faylında təyin edilə bilər.

## 📚 Əlavə Məlumat

Daha ətraflı məlumat üçün:
- Frontend README: `frontend/README.md`
- Backend README: `README.md`

