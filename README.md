# 🤖 AI File Assistant

An intelligent file assistant powered by Google Gemini AI that helps you analyze, summarize, and learn from your text files.

## ✨ Features

- **📝 Upload Text Files** - Support for TXT, MD, CSV, JSON, XML, HTML, and code files (up to 10MB)
- **📊 AI Summary** - Get concise summaries of your documents
- **🔹 Key Points** - Extract bullet points for quick understanding
- **💡 Insights** - Discover key insights and takeaways
- **❓ Quiz Generation** - Create quizzes to test your knowledge
- **🎴 Flashcards** - Generate study flashcards
- **📖 Glossary** - Extract important terms and definitions
- **🔗 Related Topics** - Discover related topics to explore
- **💬 Ask AI** - Ask questions about your uploaded files

## 🛠️ Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Motia Framework (TypeScript)
- **Database**: MongoDB Atlas
- **AI**: Google Gemini AI (`gemini-2.5-flash`)
- **Auth**: JWT-based authentication

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Google Gemini API key

### 1. Clone & Install

```bash
git clone https://github.com/potnuruyaswanth/AI-Learning.git
cd ai-file-assistant

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

Create `backend/.env`:

```env
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=ai_file_assistant
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_random_secret_string
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
```

### 3. Run Development Servers

```bash
# Terminal 1 - Backend
cd backend
npx motia dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4. Open in Browser

Visit `http://localhost:5173` 🎉

## 📁 Project Structure

```
ai-file-assistant/
├── backend/
│   ├── src/
│   │   ├── auth/          # Authentication endpoints
│   │   ├── files/         # File management endpoints
│   │   ├── ai/            # AI feature endpoints
│   │   ├── services/      # Shared services (MongoDB, Gemini)
│   │   ├── middlewares/   # Auth & CORS middleware
│   │   └── errors/        # Error handling
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   └── api.js         # API client
│   └── package.json
├── DEPLOYMENT.md          # Deployment guide
└── README.md
```

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

**Quick Deploy Options:**
- **Frontend**: Vercel (recommended)
- **Backend**: Railway (recommended)
- **Database**: MongoDB Atlas (free tier available)

## 📄 Supported File Types

| Category | Extensions |
|----------|------------|
| Text | `.txt`, `.md` |
| Data | `.csv`, `.json`, `.xml`, `.yaml`, `.yml` |
| Web | `.html`, `.css` |
| Code | `.js`, `.ts`, `.py`, `.java`, `.c`, `.cpp` |

> **Note**: Binary files (PDF, DOCX, PPTX) are not supported due to framework limitations.

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- MongoDB connection encryption
- Environment variable protection

## 📝 License

MIT License - feel free to use this project for learning and development!

---

**Built with ❤️ using Motia Framework and Google Gemini AI**
