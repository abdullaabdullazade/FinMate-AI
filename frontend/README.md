# 🎨 FinMate AI - Frontend

Bu proyekt FinMate AI aplikasiyasının React.js frontend hissəsidir. Bütün HTML template-lər və vanilla JavaScript React komponentlərinə çevrilmişdir.

## 📋 Tələblər

- Node.js 18+ və ya daha yeni versiya
- npm və ya yarn

## 🛠️ Quraşdırma

### 1. Dependencies quraşdırın

```bash
cd frontend
npm install
```

### 2. Environment Variables (Optional)

`.env` faylı yaradın (frontend qovluğunda):

```env
VITE_API_URL=http://localhost:8200
```

**Qeyd:** Əgər `.env` faylı yoxdursa, default olaraq `http://localhost:8200` istifadə olunur.

### 3. Development Server işə salın

```bash
npm run dev
```

Frontend `http://localhost:3000` ünvanında açılacaq.

## 🏗️ Build

### Production Build

```bash
npm run build
```

Build edilmiş fayllar `dist/` qovluğunda olacaq.

### Build Preview

Build edilmiş versiyanı local-də test etmək üçün:

```bash
npm run preview
```

## 📁 Struktur

```
frontend/
├── src/
│   ├── components/          # React komponentləri
│   │   ├── common/         # Ümumi komponentlər (ThemeToggle, AlertBell, CustomToast, və s.)
│   │   ├── layout/         # Layout komponentləri (Header, Navigation, BaseLayout)
│   │   ├── chat/           # Chat komponentləri
│   │   ├── dashboard/      # Dashboard komponentləri
│   │   ├── scan/           # Scan komponentləri
│   │   ├── profile/        # Profile komponentləri
│   │   ├── settings/       # Settings komponentləri
│   │   ├── dreams/         # Dream vault komponentləri
│   │   ├── rewards/        # Rewards komponentləri
│   │   └── heatmap/        # Heatmap komponentləri
│   ├── contexts/           # React Context-lər
│   │   ├── AuthContext.jsx # Authentication state management
│   │   ├── ThemeContext.jsx # Theme (dark/light) management
│   │   └── NotificationContext.jsx # Notification management
│   ├── pages/              # Səhifə komponentləri
│   │   ├── Dashboard.jsx   # Əsas dashboard səhifəsi
│   │   ├── Chat.jsx        # AI Chat interface
│   │   ├── Scan.jsx        # Receipt scanner
│   │   ├── Profile.jsx     # User profile
│   │   ├── Settings.jsx    # Settings səhifəsi
│   │   ├── DreamVault.jsx  # Dream goals
│   │   ├── Rewards.jsx     # Gamification rewards
│   │   ├── Heatmap.jsx     # Spending heatmap
│   │   ├── Login.jsx       # Login səhifəsi
│   │   ├── Signup.jsx      # Signup səhifəsi
│   │   └── NotFound.jsx    # 404 səhifəsi
│   ├── services/           # API service layer
│   │   ├── api/           # Modular API services
│   │   │   ├── index.js   # Axios instance və base config
│   │   │   ├── auth.js    # Authentication API
│   │   │   ├── chat.js    # Chat API
│   │   │   ├── dashboard.js # Dashboard API
│   │   │   ├── scan.js    # Scan API
│   │   │   ├── expenses.js # Expenses API
│   │   │   ├── profile.js # Profile API
│   │   │   └── ...        # Digər API modulları
│   │   └── api.js         # Backward compatibility export
│   ├── hooks/             # Custom React hooks
│   │   ├── useChat.js     # Chat functionality hook
│   │   └── useAuth.js     # Auth functionality hook
│   ├── styles/            # CSS faylları
│   │   ├── components/    # Komponent üçün CSS
│   │   └── pages/        # Səhifə üçün CSS
│   ├── utils/             # Utility functions
│   │   ├── formatters.js  # Data formatting utilities
│   │   └── validators.js  # Form validation utilities
│   ├── App.jsx            # Əsas App komponenti
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── public/                # Static fayllar
│   └── static/           # Static assets
├── package.json          # Dependencies və scripts
├── vite.config.js        # Vite konfiqurasiyası
├── tailwind.config.js    # Tailwind CSS konfiqurasiyası
└── postcss.config.js     # PostCSS konfiqurasiyası
```

## 📦 Əsas Paketlər

### Core Dependencies

- **React 18** - UI library
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **Vite** - Build tool və dev server

### UI & Styling

- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **React Toastify** - Toast notifications
- **Sonner** - Modern toast notifications

### Charts & Visualization

- **Chart.js** - Chart library
- **react-chartjs-2** - React wrapper for Chart.js
- **React CountUp** - Number animation

### Maps

- **Leaflet** - Interactive maps
- **react-leaflet** - React wrapper for Leaflet

### Other

- **canvas-confetti** - Confetti effects
- **react-qr-code** - QR code generation

Tam siyahı üçün `package.json` faylına baxın.

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
- `NotificationContext` - Notification state management

### Services

- `api/index.js` - Axios instance və base configuration
- `api/auth.js` - Authentication API calls
- `api/chat.js` - Chat API calls
- `api/dashboard.js` - Dashboard API calls
- `api/scan.js` - Receipt scanning API calls
- və s.

## 🔌 Backend API

Frontend backend API ilə əlaqə qurur. Backend `http://localhost:8200` ünvanında işləməlidir.

### API Base URL

API base URL `src/services/api/index.js` faylında təyin olunur:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8200'
```

### Vite Proxy

Development zamanı Vite proxy istifadə olunur (`vite.config.js`):

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8200',
    changeOrigin: true,
  }
}
```

Bu CORS problemlərini həll edir.

### API Endpoints

Əsas API endpoints:

- `/api/login` - Login
- `/api/signup` - Signup
- `/api/logout` - Logout
- `/api/dashboard-data` - Dashboard data
- `/api/chat` - Chat messages
- `/api/scan-receipt` - Receipt scanning
- `/api/expenses` - Expense management
- `/api/profile` - User profile
- və s.

## 🎨 Styling

### Tailwind CSS

Proyekt Tailwind CSS istifadə edir. Konfiqurasiya `tailwind.config.js` faylındadır.

### Custom CSS

Komponent və səhifə üçün custom CSS faylları `src/styles/` qovluğundadır.

### Theme Support

Dark və light theme dəstəyi var. Theme `ThemeContext` ilə idarə olunur.

## 🚀 Development

### Hot Reload

Vite development server avtomatik olaraq dəyişiklikləri yeniləyir (Hot Module Replacement).

### Code Structure

- Komponentlər modul şəklində təşkil olunub
- API çağırışları service layer-də mərkəzləşdirilib
- State management Context API ilə həyata keçirilib
- Custom hooks istifadə olunur

## 🐛 Problem Həlləri

### Port 3000 artıq istifadə olunur

Vite avtomatik olaraq başqa port seçəcək və ya `vite.config.js`-də port dəyişdirin:

```javascript
server: {
  port: 3001,
}
```

### Backend ilə əlaqə qurulmur

1. Backend-in işlədiyinə əmin olun (`http://localhost:8200`)
2. CORS ayarlarını yoxlayın (backend `config.py`)
3. `.env` faylında `VITE_API_URL` düzgün təyin olunubmu yoxlayın

### Dependencies quraşdırma xətası

Node.js versiyasını yoxlayın (18+ tələb olunur):

```bash
node --version
```

Əgər problem davam edərsə:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Build xətası

Build zamanı xəta alırsınızsa:

```bash
npm run build -- --debug
```

## 📝 Qeydlər

- Bütün komponentlər comment-lərlə sənədləşdirilmişdir
- Kod strukturlaşdırılmış və təmizdir
- React best practices istifadə edilmişdir
- TypeScript-ə keçid edilə bilər (gələcək plan)

## 🔄 Backend ilə Əlaqə

Backend FastAPI ilə yazılmışdır və `backend/main.py` faylında yerləşir. Frontend backend API-yə HTTP request-lər göndərir.

CORS ayarları backend-də düzgün konfiqurasiya edilməlidir (`backend/config.py`):

```python
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
