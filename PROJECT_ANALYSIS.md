# SkillSync Platform - Comprehensive Project Analysis

## 📋 Executive Summary

**SkillSync** (also referenced as NutriMap in the codebase) is an AI-powered career development and learning platform designed to help students and professionals build skills, find job opportunities, and receive personalized career guidance. The platform integrates Google's Gemini AI for intelligent recommendations, career coaching, and CV analysis.

**Project Status**: Production-ready Phase 1 complete, with advanced AI features implemented

---

## 🏗️ Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Network                            │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │   Frontend   │    │    Backend   │    │  PostgreSQL  │ │
│  │   React 19   │◄───┤   FastAPI │───►│   Database    │ │
│  │   :3000      │    │   :8000      │    │   :5432      │ │
│  └──────────────┘    └──────────────┘    └──────────────┘ │
│         │                    │                             │
│         │                    │                             │
│         └────────────────────┴─────────────────────────────┘
│                            │
│                    ┌───────▼────────┐
│                    │  Gemini AI API  │
│                    │  (External)     │
│                    └────────────────┘
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Backend

- **Framework**: FastAPI 0.115.0 (Python 3.11)
- **ORM**: SQLAlchemy 2.0.35
- **Database**: PostgreSQL 16
- **Authentication**: JWT (HS256) + bcrypt
- **Validation**: Pydantic v2.9.2
- **AI Integration**: Google Generative AI (Gemini 2.5-flash / 2.0-flash)
- **Migration Tool**: Alembic 1.13.3
- **Server**: Uvicorn (ASGI)

#### Frontend

- **Framework**: React 19.2.0
- **Routing**: React Router v6.22.0
- **HTTP Client**: Axios 1.13.2
- **State Management**: React Context API + Hooks
- **Styling**: CSS3 (Component-scoped)
- **Charts**: Recharts 3.4.1
- **Build Tool**: Webpack 5 (via react-scripts)

#### Infrastructure

- **Containerization**: Docker & Docker Compose v2
- **Base Images**:
  - Frontend: `node:22-alpine`
  - Backend: `python:3.11-slim`
  - Database: `postgres:16`
- **Volumes**: Persistent storage for database and uploaded files

---

## 🗄️ Database Schema

### Core Tables

#### 1. **users** (Primary User Table)

```sql
- id (PK, Integer)
- email (Unique, String 255)
- username (Unique, String 100)
- hashed_password (String 255)
- full_name (String 255)
- role (Enum: ADMIN, INSTRUCTOR, STUDENT)
- bio (Text)
- avatar_url (String 500)
- phone_number (String 20)
- linkedin_url (String 500)
- github_url (String 500)
- website_url (String 500)
- experience_description (Text)
- career_interests (Text - JSON array)
- cv_text (Text)
- is_active (Boolean, default: True)
- is_verified (Boolean, default: False)
- created_at (DateTime)
- updated_at (DateTime)
- last_login (DateTime)
```

#### 2. **skills** (Skills Catalog)

```sql
- id (PK, Integer)
- name (Unique, String 255)
- slug (Unique, String 255)
- description (Text)
- category (String 100) - e.g., "Programming", "Design"
- difficulty_level (Enum: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT)
- estimated_learning_hours (Integer)
- prerequisites (Text - JSON array)
- related_skills (Text - JSON array)
- market_demand_score (Float)
- is_active (Boolean, default: True)
- created_at (DateTime)
- updated_at (DateTime)
```

#### 3. **user_skills** (Junction Table - Many-to-Many)

```sql
- user_id (FK → users.id, CASCADE DELETE)
- skill_id (FK → skills.id, CASCADE DELETE)
- proficiency_level (String 50)
- acquired_date (DateTime, default: now())
```

#### 4. **courses** (Learning Resources)

```sql
- id (PK, Integer)
- title (String 255)
- platform (String 100) - YouTube, Coursera, Udemy, etc.
- url (String 1000)
- cost_type (String 20) - "free" or "paid"
- description (Text)
- thumbnail_url (String 500)
- related_skills (Text - JSON array of skill IDs)
- enrollment_count (Integer, default: 0)
- views_count (Integer, default: 0)
- is_active (Boolean, default: True)
- instructor_id (FK → users.id, nullable)
- created_at (DateTime)
- updated_at (DateTime)
```

#### 5. **jobs** (Job Postings)

```sql
- id (PK, Integer)
- title (String 255)
- company_name (String 255)
- company_logo (String 500)
- description (Text)
- requirements (Text)
- responsibilities (Text)
- job_type (String 50) - full-time, part-time, contract, internship
- location (String 255)
- salary_range (String 100)
- experience_level (String 50) - entry, mid, senior
- required_skills (Text - JSON array of skill IDs)
- application_url (String 500)
- application_email (String 255)
- application_deadline (DateTime)
- is_active (Boolean, default: True)
- posted_by (FK → users.id)
- views_count (Integer, default: 0)
- applications_count (Integer, default: 0)
- created_at (DateTime)
- updated_at (DateTime)
```

#### 6. **user_resumes** (CV/Resume Storage)

```sql
- id (PK, Integer)
- user_id (FK → users.id, Unique, CASCADE DELETE)
- personal_summary (Text)
- experiences (Text - JSON array)
- education (Text - JSON array)
- skills (Text - JSON array of skill IDs)
- tools (Text - JSON array)
- projects (Text - JSON array)
- raw_cv_text (Text)
- cv_pdf_filename (String 500)
- cv_pdf_path (String 1000)
- created_at (DateTime)
- updated_at (DateTime)
```

#### 7. **careerbot_sessions** (Chat Sessions)

```sql
- id (PK, Integer)
- user_id (FK → users.id, CASCADE DELETE)
- title (String 255, default: "New Chat")
- created_at (DateTime)
- updated_at (DateTime)
- last_message_at (DateTime)
```

#### 8. **careerbot_conversations** (Chat Messages)

```sql
- id (PK, Integer)
- user_id (FK → users.id, CASCADE DELETE)
- session_id (FK → careerbot_sessions.id, CASCADE DELETE)
- role (String 10) - "user" or "bot"
- message (Text)
- language (String 10, default: "en") - "en", "bn", or "mix"
- created_at (DateTime)
- updated_at (DateTime)
```

#### 9. **career_roadmaps** (AI-Generated Roadmaps)

```sql
- id (PK, Integer)
- user_id (FK → users.id, CASCADE DELETE)
- target_role (String 255)
- timeframe (String 100) - e.g., "3 months", "6 months"
- weekly_hours (Integer, nullable)
- input_context (Text - JSON snapshot)
- roadmap_visual (Text - ASCII/console-style visual)
- roadmap_description (Text - Detailed explanation)
- created_at (DateTime)
- updated_at (DateTime)
```

#### 10. **admin_logs** (Audit Trail)

```sql
- id (PK, Integer)
- admin_id (FK → users.id)
- action (String 255)
- target_type (String 100) - user, course, skill, etc.
- target_id (Integer)
- details (Text - JSON)
- ip_address (String 45)
- user_agent (String 500)
- created_at (DateTime)
```

#### 11. **learning_progress** (Course Progress Tracking)

```sql
- id (PK, Integer)
- user_id (FK → users.id, CASCADE DELETE)
- course_id (FK → courses.id, CASCADE DELETE)
- current_module (Integer, default: 0)
- current_lesson (Integer, default: 0)
- completion_percentage (Float, default: 0.0)
- time_spent_minutes (Integer, default: 0)
- learning_pace (String 50) - fast, normal, slow
- struggle_points (Text - JSON array)
- strengths (Text - JSON array)
- quiz_scores (Text - JSON array)
- last_activity (DateTime)
- started_at (DateTime)
- completed_at (DateTime, nullable)
```

#### 12. **ai_recommendations** (ML Recommendations - Future)

```sql
- id (PK, Integer)
- user_id (FK → users.id, CASCADE DELETE)
- recommendation_type (String 50) - course, skill, learning_path, career
- target_id (Integer)
- confidence_score (Float)
- reasoning (Text)
- user_feedback (String 50) - accepted, rejected, completed
- was_helpful (Boolean)
- created_at (DateTime)
- expires_at (DateTime)
```

### Relationship Diagram

```
users
├── user_skills (M:M) ──── skills
├── user_resumes (1:1)
├── careerbot_sessions (1:M)
│   └── careerbot_conversations (1:M)
├── career_roadmaps (1:M)
├── courses_created (1:M) ──── courses
├── enrolled_courses (M:M) ──── courses
└── progress_records (1:M) ──── learning_progress

courses
├── course_skills (M:M) ──── skills
└── enrolled_students (M:M) ──── users

jobs
└── posted_by (M:1) ──── users
```

---

## 🔧 Backend Structure

### Directory Organization

```
backend/
├── main.py                    # FastAPI app entry point
├── database.py                # Database connection & session management
├── models.py                  # SQLAlchemy ORM models
├── schemas.py                 # Pydantic validation schemas
├── auth.py                    # JWT authentication utilities
├── api_users.py               # User authentication routes
├── profile_service.py          # Profile business logic
├── user_service.py            # User management service
├── requirements.txt           # Python dependencies
├── Dockerfile                 # Backend container config
│
├── routes/                    # API route modules
│   ├── profile_routes.py      # Profile & skills management
│   ├── cv_routes.py           # CV/Resume CRUD & PDF handling
│   ├── careerbot_routes.py    # AI chat endpoints
│   ├── roadmap_routes.py      # Career roadmap generation
│   ├── job_recommendation_routes.py  # AI job matching
│   └── cv_assistant_routes.py # CV generation & suggestions
│
├── services/                  # Business logic services
│   ├── gemini_service.py      # Gemini AI integration
│   ├── careerbot_service.py   # CareerBot logic
│   ├── roadmap_service.py    # Roadmap generation logic
│   ├── cv_service.py          # CV data management
│   ├── cv_assistant_service.py # CV AI assistance
│   ├── job_recommendation_service.py # Job matching AI
│   ├── guardrail_service.py   # Content filtering
│   └── language_service.py    # Language detection
│
├── alembic/                   # Database migrations
│   ├── env.py
│   └── versions/
│       ├── 001_add_user_career_fields.py
│       ├── 002_add_careerbot_conversations.py
│       ├── 003_add_careerbot_sessions.py
│       ├── 004_add_career_roadmaps.py
│       └── 005_fix_roadmap_columns.py
│
├── migrations/                # Legacy migration scripts
│   ├── add_default_skills_and_jobs.py
│   ├── add_default_courses.py
│   └── migrate_courses.py
│
└── uploads/                   # File storage
    └── cv_pdfs/              # Uploaded CV PDFs
```

### Key Backend Components

#### 1. **Authentication System**

- JWT-based authentication with HS256 algorithm
- Separate admin and user authentication
- Token stored in localStorage (frontend)
- Password hashing with bcrypt
- Protected routes with dependency injection

#### 2. **API Routes Structure**

- **User Routes** (`/api/users/*`): Registration, login, profile management
- **Profile Routes** (`/api/users/me/*`): Skills, career interests, experience
- **CV Routes** (`/api/cv/*`): CV CRUD, PDF upload/parse/download
- **CareerBot Routes** (`/api/careerbot/*`): Chat sessions, conversation history
- **Roadmap Routes** (`/api/roadmap/*`): Generate and manage career roadmaps
- **Job Recommendation Routes** (`/api/job-recommendation/*`): AI-powered job matching
- **CV Assistant Routes** (`/api/cv-assistant/*`): CV generation and suggestions
- **Admin Routes** (`/api/admin/*`): Dashboard, users, skills, jobs, courses management

#### 3. **AI Integration**

- **Gemini Service**: Centralized AI service with fallback models
  - Primary: `gemini-2.5-flash`
  - Fallback: `gemini-2.0-flash`
- **CareerBot Service**: Personalized career guidance using user context
- **Roadmap Service**: AI-generated career development paths
- **CV Assistant Service**: CV analysis, improvement suggestions
- **Job Recommendation Service**: Skill-based job matching with AI scoring

#### 4. **Services Architecture**

- **Guardrail Service**: Content filtering for inappropriate queries
- **Language Service**: Detects English, Bangla, or mixed language
- **Profile Service**: User profile and skills management
- **CV Service**: Structured CV data handling

---

## 🎨 Frontend Structure

### Directory Organization

```
frontend/
├── public/                    # Static assets
│   ├── index.html
│   └── favicon.ico
│
├── src/
│   ├── App.js                 # Main app component & routing
│   ├── App.css                # Global styles
│   ├── index.js               # React entry point
│   ├── index.css              # Base styles
│   │
│   ├── pages/                 # Page components
│   │   ├── Home.js             # Landing page
│   │   ├── Login.js            # User login
│   │   ├── Register.js         # User registration
│   │   ├── Dashboard.js        # User dashboard
│   │   ├── Profile.jsx         # Profile management
│   │   ├── Jobs.js             # Job listings
│   │   ├── Resources.js        # Course resources
│   │   ├── CareerBot.jsx       # AI chat interface
│   │   ├── AIServices.js       # AI services hub
│   │   ├── JobRecommendation.js # Job matching
│   │   ├── Roadmap.jsx         # Career roadmap
│   │   ├── CVAssistant.jsx     # CV assistant
│   │   ├── AdminLogin.js       # Admin login
│   │   ├── AdminDashboard.js   # Admin dashboard
│   │   ├── AdminUsers.js       # User management
│   │   ├── AdminSkills.js      # Skills management
│   │   ├── AdminJobs.js        # Job management
│   │   └── AdminCourses.js     # Course management
│   │
│   ├── components/            # Reusable components
│   │   ├── Navbar.jsx         # Navigation bar
│   │   ├── ProfileCard.jsx    # Profile display card
│   │   ├── chat/              # Chat components
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── ChatSidebar.jsx
│   │   │   ├── ChatInput.jsx
│   │   │   │   └── MessageBubble.jsx
│   │   ├── profile/           # Profile tab components
│   │   │   ├── BasicInfoTab.jsx
│   │   │   ├── SkillsTab.jsx
│   │   │   ├── ExperienceTab.jsx
│   │   │   ├── CareerInterestsTab.jsx
│   │   │   └── CVTab.jsx
│   │   └── roadmap/           # Roadmap components
│   │       ├── RoadmapForm.jsx
│   │       ├── RoadmapDisplay.jsx
│   │       ├── RoadmapList.jsx
│   │       ├── RoadmapTimeline.jsx
│   │       └── RoadmapCharts.jsx
│   │
│   ├── services/              # API service layer
│   │   ├── api.js             # Axios instance & API methods
│   │   ├── careerbotService.js
│   │   ├── cvAssistantService.js
│   │   ├── cvService.js
│   │   ├── profileService.js
│   │   └── roadmapService.js
│   │
│   ├── contexts/              # React Context providers
│   │   └── AuthContext.js     # Authentication state
│   │
│   └── utils/                 # Utility functions
│       ├── chatStorage.js     # Chat history storage
│       └── copyToClipboard.js
│
├── package.json               # Dependencies
├── Dockerfile                 # Frontend container config
└── README.md
```

### Frontend Features

#### 1. **Routing & Navigation**

- React Router v6 with protected routes
- Separate authentication for users and admins
- Public route protection (redirects authenticated users)

#### 2. **State Management**

- React Context API for global auth state
- Local component state with hooks
- localStorage for token persistence

#### 3. **UI/UX Design**

- Dark theme optimized for reduced eye strain
- Glassmorphism effects with backdrop blur
- Gradient accents for visual hierarchy
- Responsive design (mobile, tablet, desktop)
- Smooth animations and transitions

#### 4. **Key Pages**

- **Home**: Landing page with feature highlights
- **Dashboard**: User overview with quick actions
- **Profile**: Multi-tab profile management (Basic Info, Skills, Experience, Career Interests, CV)
- **CareerBot**: ChatGPT-like interface with session management
- **Roadmap**: Career roadmap generation and visualization
- **Job Recommendation**: AI-powered job matching with skill gap analysis
- **CV Assistant**: CV generation, improvement, and suggestions
- **Admin Panel**: Full CRUD for users, skills, jobs, courses

---

## 🤖 AI Features & Services

### 1. **CareerBot** (AI Career Assistant)

- **Purpose**: Personalized career guidance chat
- **Technology**: Gemini 2.5-flash
- **Features**:
  - Multi-language support (English, Bangla, Banglish)
  - Session-based conversations (like ChatGPT)
  - Context-aware responses using user profile, skills, CV
  - Content filtering (guardrails)
  - Conversation history persistence

**User Context Used**:

- Profile: name, education, experience level, career interests
- Skills: All user skills from database
- CV: Personal summary, experiences, education, projects, tools
- Career interests: Target roles and paths

### 2. **Career Roadmap Generator**

- **Purpose**: AI-generated personalized career development paths
- **Technology**: Gemini 2.5-flash
- **Input**: Target role, timeframe, weekly hours commitment
- **Output**:
  - Visual roadmap (ASCII/console-style)
  - Detailed description with milestones
  - Skill progression tracking
  - Learning path recommendations

### 3. **Job Recommendation Engine**

- **Purpose**: AI-powered job matching based on user profile
- **Technology**: Gemini 2.5-flash
- **Features**:
  - Skill-based matching
  - Experience level matching
  - Career interest alignment
  - Match score calculation
  - Skill gap analysis

### 4. **CV Assistant**

- **Purpose**: AI-powered CV generation and improvement
- **Technology**: Gemini 2.5-flash
- **Features**:
  - Professional summary generation
  - Bullet point improvement
  - LinkedIn/portfolio optimization tips
  - CV structure suggestions

### 5. **CV PDF Parser**

- **Purpose**: Extract structured data from uploaded CV PDFs
- **Technology**: Gemini Vision API
- **Features**:
  - Automatic skill extraction (mapped to database skills)
  - Experience parsing
  - Education extraction
  - Projects extraction
  - Auto-populates user profile

---

## 🔐 Security Features

### Authentication & Authorization

- ✅ JWT tokens with HS256 algorithm
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (ADMIN, INSTRUCTOR, STUDENT)
- ✅ Protected API routes with dependency injection
- ✅ Token expiration (30 minutes default)
- ✅ Secure token storage in localStorage

### Data Protection

- ✅ SQL injection prevention (SQLAlchemy ORM)
- ✅ Input validation (Pydantic schemas)
- ✅ CORS configuration
- ✅ Environment variables for sensitive data
- ✅ File upload validation (PDF only, 10MB limit)
- ✅ Content filtering (guardrails for AI responses)

### Audit & Logging

- ✅ Admin action logging (admin_logs table)
- ✅ User activity tracking
- ✅ Error logging and monitoring

---

## 📡 API Endpoints Summary

### Authentication

- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `POST /api/admin/login` - Admin login
- `GET /api/users/me` - Get current user
- `GET /api/admin/me` - Get current admin

### Profile Management

- `GET /api/users/me/profile` - Get full profile
- `PUT /api/users/me/profile` - Update profile
- `GET /api/users/me/skills` - Get user skills
- `POST /api/users/me/skills/{skill_id}` - Add skill
- `DELETE /api/users/me/skills/{skill_id}` - Remove skill
- `POST /api/users/me/skills/suggest` - Suggest new skill
- `GET /api/users/me/career-interests` - Get career interests
- `POST /api/users/me/career-interests` - Set career interests

### CV/Resume Management

- `POST /api/cv` - Create/update CV
- `GET /api/cv/me` - Get user CV
- `DELETE /api/cv/reset` - Reset CV
- `POST /api/cv/pdf` - Upload CV PDF
- `POST /api/cv/pdf/parse` - Parse CV PDF with AI
- `GET /api/cv/pdf` - Download CV PDF
- `DELETE /api/cv/pdf` - Delete CV PDF

### AI Services

#### CareerBot

- `POST /api/careerbot/ask` - Ask CareerBot a question
- `GET /api/careerbot/history` - Get conversation history
- `GET /api/careerbot/sessions` - Get all sessions
- `POST /api/careerbot/sessions` - Create new session
- `PATCH /api/careerbot/sessions/{id}` - Update session title
- `DELETE /api/careerbot/sessions/{id}` - Delete session

#### Roadmap

- `POST /api/roadmap/generate` - Generate career roadmap
- `GET /api/roadmap/all` - Get all user roadmaps
- `GET /api/roadmap/{id}` - Get specific roadmap
- `DELETE /api/roadmap/{id}` - Delete roadmap

#### Job Recommendation

- `POST /api/job-recommendation/generate` - Get job recommendations
- `GET /api/job-recommendation/history` - Get recommendation history

#### CV Assistant

- `POST /api/cv-assistant/generate-summary` - Generate professional summary
- `POST /api/cv-assistant/improve-bullets` - Improve bullet points
- `POST /api/cv-assistant/linkedin-tips` - Get LinkedIn tips

### Public Endpoints

- `GET /api/jobs` - List active jobs
- `GET /api/jobs/{id}` - Get job details
- `GET /api/courses` - List active courses
- `GET /api/courses/{id}` - Get course details
- `GET /api/skills` - List all skills

### Admin Endpoints

- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/users` - List all users
- `GET /api/admin/skills` - List all skills
- `POST /api/admin/skills` - Create skill
- `DELETE /api/admin/skills/{id}` - Delete skill
- `GET /api/admin/jobs` - List all jobs
- `POST /api/admin/jobs` - Create job
- `PUT /api/admin/jobs/{id}` - Update job
- `DELETE /api/admin/jobs/{id}` - Delete job
- `GET /api/admin/courses` - List all courses
- `POST /api/admin/courses` - Create course
- `PUT /api/admin/courses/{id}` - Update course
- `DELETE /api/admin/courses/{id}` - Delete course

---

## 🚀 Deployment & Infrastructure

### Docker Setup

- **Multi-container architecture** with Docker Compose
- **Services**:
  1. Frontend (React dev server on port 3000)
  2. Backend (FastAPI on port 8000)
  3. PostgreSQL (port 5432)
- **Volumes**: Persistent database storage
- **Networking**: Bridge network for inter-service communication
- **Hot Reload**: Enabled for both frontend and backend

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@db:5432/dbname
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_DB=nutrimap

# JWT
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI
GEMINI_API_KEY=your-gemini-api-key

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Database Migrations

- **Alembic** for version-controlled migrations
- **Migration History**:
  1. `001_add_user_career_fields.py` - Added career-related user fields
  2. `002_add_careerbot_conversations.py` - Created conversation history table
  3. `003_add_careerbot_sessions.py` - Added session management
  4. `004_add_career_roadmaps.py` - Created roadmap table
  5. `005_fix_roadmap_columns.py` - Fixed roadmap schema

---

## 📊 Key Features Breakdown

### For Users

1. **Profile Management**

   - Complete profile with skills, experience, career interests
   - Social links (LinkedIn, GitHub, website)
   - Avatar upload
   - Bio and experience description

2. **Skills Management**

   - Add/remove skills from admin-defined catalog
   - Suggest new skills (auto-creates if not exists)
   - Proficiency levels (beginner, intermediate, advanced, expert)
   - Skill categories

3. **CV/Resume Builder**

   - Structured CV with experiences, education, projects
   - PDF upload and AI parsing
   - Auto-skill extraction from CV
   - Professional summary generation

4. **CareerBot (AI Assistant)**

   - ChatGPT-like interface
   - Multiple conversation sessions
   - Personalized advice based on profile
   - Multi-language support (EN, BN, Banglish)

5. **Career Roadmap**

   - AI-generated personalized learning paths
   - Visual roadmap display
   - Milestone tracking
   - Skill progression recommendations

6. **Job Recommendations**

   - AI-powered job matching
   - Skill gap analysis
   - Match score ranking
   - Personalized recommendations

7. **Course Discovery**

   - Browse curated courses from multiple platforms
   - Filter by skills
   - View course details and enrollments

8. **Job Listings**
   - Browse active job postings
   - Filter by skills, location, type
   - View job details and requirements

### For Admins

1. **Dashboard**

   - Platform statistics
   - User growth metrics
   - Course/job/skill counts
   - Monthly analytics

2. **User Management**

   - View all registered users
   - User details and activity
   - Pagination support

3. **Skills Management**

   - CRUD operations for skills
   - Category management
   - Skill descriptions and metadata

4. **Job Management**

   - Create/edit/delete job postings
   - Set required skills
   - Manage application details

5. **Course Management**

   - Add courses from various platforms
   - Link courses to skills
   - Track enrollments and views

6. **Audit Logging**
   - Track all admin actions
   - Security and compliance

---

## 🔄 Data Flow Examples

### CareerBot Conversation Flow

```
1. User sends message → Frontend
2. Frontend → POST /api/careerbot/ask
3. Backend:
   a. Validate session (create if needed)
   b. Run guardrail filter
   c. Detect language
   d. Fetch user profile, skills, CV
   e. Build context prompt
   f. Call Gemini API
   g. Store conversation in database
   h. Return response
4. Frontend displays response
```

### Roadmap Generation Flow

```
1. User inputs target role, timeframe → Frontend
2. Frontend → POST /api/roadmap/generate
3. Backend:
   a. Fetch user profile, skills, CV
   b. Build context snapshot
   c. Generate roadmap with Gemini
   d. Parse and save to database
   e. Return roadmap data
4. Frontend displays visual roadmap
```

### CV PDF Parsing Flow

```
1. User uploads PDF → Frontend
2. Frontend → POST /api/cv/pdf
3. Backend saves file
4. User triggers parse → POST /api/cv/pdf/parse
5. Backend:
   a. Read PDF file
   b. Upload to Gemini Vision API
   c. Extract structured data
   d. Map skills to database skills
   e. Auto-add skills to user profile
   f. Update user_resumes table
6. Frontend displays parsed CV data
```

---

## 🎯 Project Strengths

1. **Comprehensive AI Integration**: Multiple AI services using Gemini
2. **Well-Structured Codebase**: Clear separation of concerns
3. **Modern Tech Stack**: Latest versions of React, FastAPI, PostgreSQL
4. **Scalable Architecture**: Docker-based, microservices-ready
5. **Security**: JWT auth, input validation, audit logging
6. **User Experience**: Dark theme, responsive design, smooth animations
7. **Database Design**: Normalized schema with proper relationships
8. **API Design**: RESTful endpoints with proper error handling

---

## 🔮 Future Enhancements (From Roadmap)

### Phase 2: AI Integration (Partially Complete)

- ✅ Personalized learning paths (Roadmap feature)
- ✅ Skill gap analysis (Job Recommendation)
- ✅ Smart job recommendations (Implemented)
- ✅ Career trajectory planning (Roadmap feature)
- ✅ Resume optimization (CV Assistant)

### Phase 3: Advanced Features

- [ ] Job application tracking
- [x] Resume/CV file upload & parsing (Implemented)
- [ ] Email notifications
- [ ] LinkedIn integration
- [ ] Skill endorsements
- [ ] Interview preparation tools

### Phase 4: Scale & Mobile

- [ ] Mobile app (React Native)
- [ ] Video interviews
- [ ] Employer dashboard
- [ ] API marketplace
- [ ] Advanced analytics

---

## 📝 Notes & Observations

1. **Project Name**: Codebase references "NutriMap" in Docker configs, but the application is branded as "SkillSync"
2. **Database**: Uses PostgreSQL 16 with Alembic migrations
3. **File Storage**: CV PDFs stored in `backend/uploads/cv_pdfs/`
4. **AI Models**: Uses Gemini 2.5-flash with 2.0-flash fallback
5. **Language Support**: Multi-language AI responses (English, Bangla, Banglish)
6. **Session Management**: CareerBot uses session-based conversations (like ChatGPT)
7. **CV Structure**: JSON-based structured CV storage for AI processing
8. **Skills System**: Admin-defined skills catalog with user-suggested additions

---

## 🐛 Known Issues & Considerations

1. **Token Storage**: JWT tokens stored in localStorage (consider httpOnly cookies for production)
2. **File Upload**: PDF files stored on filesystem (consider cloud storage for production)
3. **Rate Limiting**: No explicit rate limiting on API endpoints
4. **Caching**: No caching layer for frequently accessed data
5. **Error Handling**: Basic error handling (could be enhanced with structured logging)
6. **Testing**: Limited test coverage (tests directory exists but minimal tests)

---

## 📚 Documentation Files

- `README.md` - Main project documentation
- `PROJECT_ANALYSIS.md` - This comprehensive analysis
- `backend/ARCHITECTURE_DIAGRAM.md` - Architecture documentation
- API Documentation available at `/docs` (FastAPI Swagger UI)

---

**Analysis Date**: January 2025  
**Project Version**: 1.0.0  
**Status**: Production Ready - Phase 1 Complete
