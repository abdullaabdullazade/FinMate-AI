# 💰 FinMate AI - Your Personal CFO

A futuristic Personal Finance PWA powered by Google Gemini AI, combining visual dashboards with a context-aware AI chatbot.

🌐 **Live Demo**: [https://finmate.abdulladev.site/](https://finmate.abdulladev.site/)

![FinMate AI](https://img.shields.io/badge/AI-Gemini%201.5%20Flash-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green)
![React](https://img.shields.io/badge/React-18-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🌟 Key Features

### 🤖 Context-Aware AI Chatbot
- **Your Personal CFO**: Ask questions about your spending and get intelligent, data-driven answers
- **Real-time Analysis**: AI reads your actual database to provide accurate insights
- **Natural Conversation**: Powered by Google Gemini 1.5 Flash for human-like interactions

### 📸 AI Receipt Scanner
- **Automatic OCR**: Upload receipt photos and AI extracts all items
- **Smart Categorization**: Automatically categorizes expenses
- **Itemized Tracking**: See exactly what you bought, not just totals

### 📊 Beautiful Dashboard
- **Glassmorphism UI**: Premium, modern design with stunning visual effects
- **Real-time Charts**: Interactive spending visualizations with Chart.js
- **Budget Tracking**: Monitor your spending against your monthly budget

### 🎨 Premium UI/UX
- **Mobile-First**: Designed for smartphones with responsive layout
- **Smooth Animations**: Delightful micro-interactions throughout
- **Floating Navigation**: Instagram-style bottom nav with prominent scan button

### 🎮 Gamification
- **XP Points & Levels**: Earn experience points for tracking expenses
- **Coins & Rewards**: Collect coins and unlock achievements
- **Dream Vault**: Set financial goals and track progress

## 🛠 Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLite** - Lightweight database
- **SQLAlchemy** - ORM for database operations
- **Google Gemini AI** - AI chatbot and receipt scanning
- **WeasyPrint** - PDF export functionality

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js** - Data visualization
- **Axios** - HTTP client

## 📂 Project Structure

```
smartspeed/
├── backend/                 # FastAPI backend
│   ├── main.py             # Application entry point
│   ├── config.py           # Configuration (CORS, middleware)
│   ├── database.py         # Database setup
│   ├── models.py           # SQLAlchemy models
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile          # Docker configuration
│   ├── routes/             # API route handlers
│   ├── utils/              # Utility functions
│   ├── static/             # Static files (uploads)
│   └── README.md           # Backend documentation
├── frontend/                # React frontend
│   ├── src/                # Source code
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   └── styles/         # CSS files
│   ├── package.json        # Node dependencies
│   ├── vite.config.js      # Vite configuration
│   └── README.md           # Frontend documentation
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.12+** (for backend)
- **Node.js 18+** (for frontend)
- **npm** or **yarn** (for frontend)
- **Google Gemini API Key** (get from https://makersuite.google.com/app/apikey)

### 1. Clone the Repository

```bash
git clone https://github.com/abdullaabdullazade/FinMate-AI
cd FinMate-AI
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate  # Windows

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file
echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env
echo "GROQ_API_KEY=your_gemini_api_key_here" > .env

# Database will be auto-created on first run
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Optional: Create .env file for custom API URL
echo "VITE_API_URL=http://localhost:8200" > .env
```

### 4. Run the Application

#### Terminal 1 - Backend

```bash
cd backend
python main.py
```

Backend will run on `http://localhost:8200`

#### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:3000`

### 5. Open in Browser

**Local Development:**
Navigate to: **http://localhost:3000**

**Live Production:**
🌐 **[http://185.207.251.177:3000/](http://185.207.251.177:3000/)**

## 📱 How to Use

### Dashboard
- View your monthly spending overview
- See spending breakdown by category
- Track budget utilization
- Review recent transactions

### AI Chat
- Ask: *"How much did I spend on food?"*
- Ask: *"What are my biggest expenses?"*
- Ask: *"Am I over budget?"*
- The AI knows your actual data and responds accordingly!

### Receipt Scanner
- Click the floating **+** button
- Upload a receipt photo
- AI extracts merchant, items, prices
- Automatically saves to your expenses

### Profile
- View account statistics
- Manage subscriptions
- See total spending history
- Update personal information

### Dream Vault
- Set financial goals
- Track progress towards goals
- Visualize your dreams

### Rewards
- View earned XP points
- Check your level and title
- See collected coins
- Unlock achievements

## 🐳 Docker Deployment

### Backend

```bash
cd backend
docker build -t finmate-backend .
docker run -d -p 8200:8200 --env-file .env finmate-backend
```

### Frontend

```bash
cd frontend
npm run build
# Serve dist/ folder with nginx or similar
```

## 🚀 Production Deployment

### Production Server

**Live Application**: [http://185.207.251.177:3000/](http://185.207.251.177:3000/)

**Backend API**: `http://185.207.251.177:8200` (or configured port)

### Production Setup

1. **Backend Configuration**:
   - Ensure `.env` file has production API keys
   - Update CORS settings in `backend/config.py` to include production frontend URL
   - Run backend on port 8200 (or configured port)

2. **Frontend Configuration**:
   - Build frontend: `cd frontend && npm run build`
   - Set production API URL in `frontend/.env`:
     ```env
     VITE_API_URL=http://185.207.251.177:8200
     ```
   - Serve `dist/` folder (e.g., with nginx, serve, or similar)

3. **Environment Files**:
   - Copy `backend/.env.example` to `backend/.env` and fill in your API keys
   - Copy `frontend/.env.example` to `frontend/.env` and set production API URL

## 🔧 Configuration

### Backend Environment Variables

Create `backend/.env` by copying the example file:

```bash
cd backend
cp .env.example .env
# Edit .env and add your API keys
```

Required variables (see `backend/.env.example`):
```env
GEMINI_API_KEY=your_gemini_api_key_here  # Required
OPENAI_API_KEY=your_openai_api_key_here  # Optional
GROQ_API_KEY=your_groq_api_key_here      # Optional
```

### Frontend Environment Variables

Create `frontend/.env` (optional) by copying the example file:

```bash
cd frontend
cp .env.example .env
# Edit .env if your backend runs on different URL
```

Default configuration (see `frontend/.env.example`):
```env
VITE_API_URL=http://localhost:8200  # Optional, default is localhost:8200
```

For production deployment, set:
```env
VITE_API_URL=http://185.207.251.177:8200
```

### CORS Settings

Backend CORS is configured in `backend/config.py`. Default allowed origins:
- `http://localhost:3000` (React dev server)
- `http://localhost:5173` (Vite dev server)
- `http://localhost:8200` (Backend port)
- `http://185.207.251.177:3000` (Production frontend)

To add new origins, edit `backend/config.py`.

## 🧪 Testing

### Backend API Documentation

Once backend is running, visit:
- **Swagger UI**: http://localhost:8200/docs
- **ReDoc**: http://localhost:8200/redoc

### Test Chatbot

Try these questions:
- "How much did I spend on food this month?"
- "What are my subscriptions?"
- "Am I over budget?"
- "What was my largest expense?"
- "How much have I spent on transport?"

## 📚 Documentation

- **Backend Documentation**: See [backend/README.md](backend/README.md)
- **Frontend Documentation**: See [frontend/README.md](frontend/README.md)

## 🔒 Security Notes

⚠️ **This is a demo application**. For production use:

- Add proper authentication
- Implement user sessions
- Secure API endpoints
- Add input validation
- Use environment variables for all secrets
- Enable HTTPS
- Add rate limiting
- Implement proper error handling

## 🐛 Troubleshooting

### Backend Issues

**Port 8200 already in use:**
```bash
# Use different port
uvicorn main:app --host 0.0.0.0 --port 8201
```

**Database errors:**
```bash
# Delete and recreate database
rm finmate.db
python database.py
```

**Dependencies installation errors:**
```bash
pip install --upgrade pip
pip install -r requirements.txt --no-cache-dir
```

### Frontend Issues

**Port 3000 already in use:**
Vite will automatically use the next available port, or edit `vite.config.js`.

**Backend connection errors:**
1. Ensure backend is running on `http://localhost:8200`
2. Check CORS settings in `backend/config.py`
3. Verify `.env` file has correct `VITE_API_URL`

**Build errors:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## 🎯 Demo Data

The app comes pre-loaded with:
- **26 realistic expenses** across 7 categories
- **Multiple subscriptions** (Netflix, Spotify, etc.)
- **Itemized receipts** for some transactions
- **2 welcome chat messages** to get started

## 📝 Development

### Backend Development

```bash
cd backend
python main.py  # Auto-reload enabled
```

### Frontend Development

```bash
cd frontend
npm run dev  # Hot Module Replacement enabled
```

### Building for Production

**Backend:**
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8200
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve dist/ folder
```

## 🤝 Contributing

Contributions welcome! This is a hackathon project meant to showcase AI integration.

## 📝 License & Copyright

**© 2025 FinMate AI. All Rights Reserved.**

This project is proprietary software developed for the **National FinTech Hackathon**. 
Unauthorized copying, modification, distribution, or use of this source code, via any medium, is strictly prohibited without the express written permission of the copyright holders.

This software is currently under **Patent Application Review** by the Intellectual Property Agency of the Republic of Azerbaijan.

## 🏆 Hackathon Ready

This project demonstrates:
- ✅ Real AI integration (not just APIs)
- ✅ Context-aware responses
- ✅ Premium UI/UX
- ✅ Full-stack implementation
- ✅ Modern tech stack
- ✅ Actually useful functionality
- ✅ Gamification features
- ✅ Receipt scanning with AI

---

**Built with ❤️ for the FinTech AI Hackathon**
