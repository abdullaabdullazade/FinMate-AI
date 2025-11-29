# FinMate AI - React Frontend

Bu proyekt FinMate AI aplikasiyasının React.js frontend hissəsidir. Bütün HTML template-lər və vanilla JavaScript React komponentlərinə çevrilmişdir.

## 📁 Struktur

```
frontend/
├── src/
│   ├── components/          # React komponentləri
│   │   ├── common/         # Ümumi komponentlər (ThemeToggle, AlertBell, və s.)
│   │   └── layout/         # Layout komponentləri (Header, Navigation, BaseLayout)
│   ├── contexts/           # React Context-lər (AuthContext, ThemeContext)
│   ├── pages/              # Səhifə komponentləri (Dashboard, Chat, Scan, və s.)
│   ├── services/           # API service layer
│   ├── styles/             # CSS faylları
│   ├── App.jsx             # Əsas App komponenti
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── package.json
├── vite.config.js          # Vite konfiqurasiyası
└── tailwind.config.js       # Tailwind CSS konfiqurasiyası
```

## 🚀 Quraşdırma

### 1. Dependencies quraşdır

```bash
cd frontend
npm install
```

### 2. Environment variables

`.env` faylı yaradın (optional):

```env
VITE_API_URL=http://localhost:8000
```

### 3. Development server işə sal

```bash
npm run dev
```

Aplikasiya `http://localhost:3000` ünvanında açılacaq.

## 🏗️ Build

Production build üçün:

```bash
npm run build
```

Build edilmiş fayllar `dist/` qovluğunda olacaq.

## 📦 Əsas Paketlər

- **React 18** - UI library
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **Chart.js + react-chartjs-2** - Charts
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## 🎨 Komponent Strukturu

### Layout Komponentləri

- `BaseLayout` - Əsas layout wrapper
- `Header` - Top navigation bar
- `Navigation` - Sidebar navigation
- `FloatingScanButton` - Mobile scan button
- `HamburgerMenu` - Mobile menu

### Page Komponentləri

- `Dashboard` - Əsas dashboard səhifəsi
- `Chat` - AI Chat interface
- `Scan` - Receipt scanner
- `Profile` - User profile
- `Settings` - Settings səhifəsi
- `DreamVault` - Dream goals
- `Rewards` - Gamification rewards
- `Heatmap` - Spending heatmap
- `Login` - Login səhifəsi
- `Signup` - Signup səhifəsi
- `NotFound` - 404 səhifəsi

### Context-lər

- `AuthContext` - Authentication state management
- `ThemeContext` - Theme (dark/light) management

### Services

- `api.js` - Bütün API çağırışları üçün mərkəzləşdirilmiş service layer

## 🔌 Backend API

Frontend backend API ilə əlaqə qurur. Backend `http://localhost:8000` ünvanında işləməlidir.

API endpoints:
- `/api/login` - Login
- `/api/signup` - Signup
- `/api/dashboard-data` - Dashboard data
- `/api/chat` - Chat messages
- `/api/scan-receipt` - Receipt scanning
- və s.

## 📝 Qeydlər

- Bütün komponentlər comment-lərlə sənədləşdirilmişdir
- Kod strukturlaşdırılmış və təmizdir
- Spaghetti kod yoxdur
- React best practices istifadə edilmişdir

## 🔄 Backend ilə Əlaqə

Backend FastAPI ilə yazılmışdır və `main.py` faylında yerləşir. Frontend backend API-yə HTTP request-lər göndərir.

CORS ayarları backend-də düzgün konfiqurasiya edilməlidir:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📚 Əlavə Məlumat

Daha ətraflı məlumat üçün əsas README.md faylına baxın.

