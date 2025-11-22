# 💰 FinMate AI - Your Personal CFO

A futuristic Personal Finance PWA powered by Google Gemini AI, combining visual dashboards with a context-aware AI chatbot.

![FinMate AI](https://img.shields.io/badge/AI-Gemini%201.5%20Flash-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green)
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

## 🛠 Tech Stack

- **Backend**: FastAPI (Python)
- **Database**: SQLite + SQLAlchemy
- **Frontend**: Jinja2 + HTMX
- **Styling**: TailwindCSS + DaisyUI
- **AI**: Google Gemini 1.5 Flash
- **Charts**: Chart.js

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set Up Environment

Create a `.env` file with your Gemini API key:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your API key from: https://makersuite.google.com/app/apikey

### 3. Initialize Database

```bash
python database.py
```

This will create the database and populate it with demo data.

### 4. Run the Application

```bash
uvicorn main:app --reload
```

Or simply:

```bash
python main.py
```

### 5. Open in Browser

Navigate to: **http://localhost:8000**

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

## 🎯 Demo Data

The app comes pre-loaded with:
- **26 realistic expenses** across 7 categories
- **Multiple subscriptions** (Netflix, Spotify, etc.)
- **Itemized receipts** for some transactions
- **2 welcome chat messages** to get started

## 🧪 Testing the Chatbot

Try these questions:
- "How much did I spend on food this month?"
- "What are my subscriptions?"
- "Am I over budget?"
- "What was my largest expense?"
- "How much have I spent on transport?"

The AI will query your database and provide accurate, context-aware answers!

## 📂 Project Structure

```
smartspeed/
├── main.py                 # FastAPI application
├── models.py              # Database models
├── database.py            # DB setup and seed data
├── ai_service.py          # Gemini AI integration
├── requirements.txt       # Dependencies
├── .env                   # Environment variables
├── templates/             # Jinja2 templates
│   ├── base.html         # Base layout
│   ├── dashboard.html    # Dashboard page
│   ├── chat.html         # Chat interface
│   ├── scan.html         # Receipt scanner
│   ├── profile.html      # User profile
│   └── partials/         # HTMX partials
└── static/
    └── uploads/          # Receipt images
```

## 🎨 Design Features

- **Glassmorphism**: Semi-transparent cards with backdrop blur
- **Gradient Backgrounds**: Vibrant purple-to-pink gradients
- **Smooth Animations**: Slide-up effects and transitions
- **Custom Scrollbars**: Styled for premium feel
- **Responsive**: Works on all screen sizes

## 🔒 Security Notes

⚠️ **This is a demo application**. For production use:
- Add proper authentication
- Implement user sessions
- Secure API endpoints
- Add input validation
- Use environment variables for all secrets

## 📝 License

MIT License - feel free to use this for your hackathon or personal projects!

## 🤝 Contributing

Contributions welcome! This is a hackathon project meant to showcase AI integration.

## 🏆 Hackathon Ready

This project demonstrates:
- ✅ Real AI integration (not just APIs)
- ✅ Context-aware responses
- ✅ Premium UI/UX
- ✅ Full-stack implementation
- ✅ Modern tech stack
- ✅ Actually useful functionality

---

**Built with ❤️ for the FinTech AI Hackathon**
