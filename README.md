# SkillSync - AI-Powered Learning Platform

A modern, professional learning management system with admin panel and AI-ready architecture.

## 🚀 Features

### Current Implementation (Phase 1)
- ✅ **Professional Admin Panel** with modern UI/UX
- ✅ **Secure Authentication** using JWT tokens
- ✅ **Database Models** designed for scalability
- ✅ **RESTful API** with FastAPI
- ✅ **React Frontend** with routing and protected routes
- ✅ **Smart Logo** with SVG components
- ✅ **Dashboard Statistics** with real-time data
- ✅ **Clean Architecture** following best practices

### Ready for Phase 2 (AI Integration)
- 🤖 AI-powered course recommendations
- 🎯 Personalized learning paths
- 📊 Skill gap analysis
- 🧠 Adaptive learning based on user behavior

## 🚀 Quick Start

### 1. Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 3. Start Services with Docker
```bash
# From project root
docker compose up -d
```

### 4. Initialize Admin User
```bash
# Create initial admin account
curl -X POST http://localhost:8000/api/admin/init
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### 6. Admin Login
Default credentials:
- **Email**: `admin@skillsync.com`
- **Password**: `admin123` (⚠️ Change immediately!)

## 📊 Admin Panel Features

- Dashboard with statistics
- User management
- Course management
- Skill management
- AI recommendations (Phase 2 ready)
- Activity logs

## 🛠️ Development

### Run Backend (without Docker)
```bash
cd backend
uvicorn main:app --reload
```

### Run Frontend
```bash
cd frontend
npm start
```

## 🎨 Design

Professional UI with:
- Modern gradient backgrounds
- Smooth animations
- Responsive design
- Professional typography
- Smart SkillSync logo

---

**Built for hackathon - Phase 2 AI integration ready**
