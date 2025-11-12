# User Authentication & Management Implementation

## 📋 Overview

This implementation adds **user registration, authentication, and profile management** to the SkillSync backend using JWT-based security. It extends the existing admin authentication system to support normal users (students) with career roadmap features.

## 🎯 Features Implemented

### 1. User Registration

- ✅ Secure user registration with password hashing (bcrypt)
- ✅ Email validation and uniqueness checking
- ✅ Password strength validation (minimum 8 chars, must contain digit)
- ✅ Automatic username generation from email
- ✅ Career track selection during signup
- ✅ Immediate JWT token issuance after registration

### 2. User Authentication

- ✅ Email/password-based login
- ✅ JWT token generation with 24-hour expiration
- ✅ Password verification with bcrypt
- ✅ Last login tracking
- ✅ Account activation check
- ✅ Secure error messages (don't leak valid emails)

### 3. JWT Middleware

- ✅ Token verification dependency for protected routes
- ✅ Automatic user extraction from token
- ✅ 401/403 error handling
- ✅ Authorization header parsing (Bearer token format)

### 4. Profile Management

- ✅ Get current user profile
- ✅ Update profile information (name, bio, phone, etc.)
- ✅ Career-specific fields (education, experience level, career track)
- ✅ Profile timestamps (created_at, updated_at)

### 5. Skills Management

- ✅ Add skills to user profile (with duplicate prevention)
- ✅ Remove skills from profile
- ✅ Get user's skills list
- ✅ JSON storage for skill arrays

### 6. CV/Resume Management

- ✅ Store raw CV text in database
- ✅ Placeholder for future AI parsing (cv_analyzer service)
- ✅ Supports multi-line CV content

## 📁 Files Created/Modified

### New Files

#### `backend/user_service.py`

Service layer for user business logic:

- `register_user()` - User registration with validation
- `authenticate_user()` - Login and JWT generation
- `get_user_profile()` - Fetch user by ID
- `update_user_profile()` - Update user fields
- `add_skill()` - Add skill to user
- `remove_skill()` - Remove skill from user
- `get_user_skills()` - Get user's skills list
- `set_cv_text()` - Store CV text

#### `backend/api_users.py`

API routes and endpoints:

- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Authenticate user
- `GET /api/users/me` - Get current user profile (protected)
- `PUT /api/users/me` - Update profile (protected)
- `GET /api/users/{user_id}` - Get user by ID
- `POST /api/users/me/skills` - Add skill (protected)
- `DELETE /api/users/me/skills` - Remove skill (protected)
- `GET /api/users/me/skills` - Get skills list (protected)
- `PUT /api/users/me/cv` - Update CV text (protected)
- `POST /api/users/logout` - Logout (protected)

Includes `get_current_user` dependency for route protection.

#### `backend/USER_AUTH_API_TESTS.md`

Comprehensive test documentation with:

- API endpoint overview
- cURL request examples for all endpoints
- Response examples (success and error)
- Python test script
- Postman instructions
- Test cases checklist
- Troubleshooting guide

### Modified Files

#### `backend/models.py`

Extended User model with career fields:

- `education_level` - User's education level
- `experience_level` - Enum: FRESHER, JUNIOR, MID, SENIOR
- `preferred_career_track` - Career preference
- `skills` - JSON array of skills
- `experiences` - JSON array of experience descriptions
- `cv_text` - Raw CV/resume text

Added `ExperienceLevel` enum for career tracking.

#### `backend/schemas.py`

Added Pydantic schemas:

- `ExperienceLevel` - Enum for experience levels
- `UserRegister` - Registration request with validation
- `UserLogin` - Login request
- `UserUpdate` - Profile update request
- `UserProfile` - Detailed user response
- `UserLoginResponse` - Login/Register response with token

#### `backend/main.py`

- Imported `api_users` router
- Added `app.include_router(user_router)` to register user endpoints

### Unchanged Files (Compatible)

- `backend/auth.py` - Reused for password hashing and JWT
- `backend/database.py` - Reused for DB sessions
- `backend/requirements.txt` - All dependencies already present

## 🔐 Security Implementation

### Password Security

```python
# Password hashing with bcrypt
hashed = get_password_hash(password)  # Bcrypt with salt
verified = verify_password(plain, hashed)  # Secure comparison
```

### JWT Security

```python
# Token creation with expiration
token = create_access_token({
    "sub": email,           # Subject claim
    "role": role,           # Role claim
    "exp": exp_time         # Expiration time
})

# Token verification
payload = decode_access_token(token)  # Verifies signature and expiration
```

### Authentication Flow

```
User Registration
    ↓
Validate email (format, uniqueness) → 400 if invalid
    ↓
Validate password (length, strength) → 422 if invalid
    ↓
Hash password with bcrypt → Store in DB
    ↓
Create JWT token → Return to user
    ↓
User stores token in localStorage

Protected Route Access
    ↓
Send Authorization: Bearer <token> header
    ↓
Middleware extracts token
    ↓
Verify signature and expiration
    ↓
Extract user email and role
    ↓
Query database for user
    ↓
Attach user to request context
    ↓
Proceed with route logic
```

## 🛠 Data Models

### User Model Extensions

```python
class User(Base):
    # Existing fields
    id: int
    email: str (unique)
    username: str (unique)
    hashed_password: str
    full_name: str
    role: UserRole (ADMIN, INSTRUCTOR, STUDENT)

    # Career Roadmap Fields (NEW)
    education_level: str          # e.g., High School, Bachelor's
    experience_level: ExperienceLevel  # FRESHER, JUNIOR, MID, SENIOR
    preferred_career_track: str   # e.g., Web Dev, Data Science
    skills: Text (JSON array)     # ["JavaScript", "React", "Node.js"]
    experiences: Text (JSON array) # ["2 years at TechCorp", ...]
    cv_text: Text                 # Raw resume/CV content

    # Timestamps
    created_at: datetime
    updated_at: datetime
    last_login: datetime
```

### Enums

```python
class ExperienceLevel(str, Enum):
    FRESHER = "fresher"
    JUNIOR = "junior"
    MID = "mid"
    SENIOR = "senior"
```

## 📊 API Response Structure

### Successful Registration/Login

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "full_name": "John Doe",
    "email": "john@example.com",
    "username": "john",
    "role": "student",
    "education_level": "Bachelor's",
    "experience_level": "fresher",
    "preferred_career_track": "Web Development",
    "skills": ["JavaScript", "React"],
    "created_at": "2025-11-12T10:30:00",
    "updated_at": "2025-11-12T10:30:00"
  }
}
```

### Error Response

```json
{
  "detail": "Email already registered"
}
```

## 🔧 Configuration

### Environment Variables (`.env`)

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost/nutrimap

# JWT
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440  # 24 hours

# CORS
FRONTEND_URL=http://localhost:3000
```

### JWT Settings (in `auth.py`)

```python
SECRET_KEY = os.getenv("SECRET_KEY", "...")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours
```

## 🧪 Testing

### Quick Test with cURL

```bash
# Register
curl -X POST "http://localhost:8000/api/users/register" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123",
    "education_level": "Bachelor'\''s",
    "experience_level": "fresher",
    "preferred_career_track": "Web Development"
  }'

# Login
curl -X POST "http://localhost:8000/api/users/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'

# Get Profile (replace TOKEN with actual token)
curl -X GET "http://localhost:8000/api/users/me" \
  -H "Authorization: Bearer TOKEN"
```

### Using FastAPI Swagger UI

1. Navigate to `http://localhost:8000/docs`
2. Find user endpoints under "users" tag
3. Click "Try it out"
4. Fill in request body
5. Execute request
6. View response

## 📈 Future AI Integration Points

The architecture includes placeholders for AI features:

```python
# backend/services/ai/cv_analyzer.py (placeholder)
def extract_skills_from_cv(cv_text: str) -> List[str]:
    """Extract skills from CV using NLP/AI"""
    pass

def extract_experience_from_cv(cv_text: str) -> List[Experience]:
    """Parse experience from CV using AI"""
    pass

# backend/services/ai/career_recommender.py (placeholder)
def recommend_careers(user_profile: User) -> List[CareerPath]:
    """AI-powered career path recommendations"""
    pass

def analyze_skill_gaps(user: User, target_role: str) -> SkillGaps:
    """Identify missing skills for target role"""
    pass
```

Skills are stored as JSON arrays ready for ML algorithms.

## ✅ Validation Rules

### User Registration

```
full_name:
  - Required
  - Length: 2-255 characters

email:
  - Required
  - Valid email format
  - Unique in database

password:
  - Required
  - Minimum 8 characters
  - Must contain at least one digit

education_level:
  - Optional
  - String

experience_level:
  - Optional (default: "fresher")
  - Enum: fresher, junior, mid, senior

preferred_career_track:
  - Optional
  - String
```

### Profile Update

- All fields optional
- Only provided fields are updated
- automatically updates `updated_at` timestamp

## 🔄 Request/Response Flow

### Registration Flow

```
1. User submits registration form
   ↓
2. Backend validates input
   ↓
3. Check email uniqueness
   ↓
4. Hash password with bcrypt
   ↓
5. Create user in database
   ↓
6. Generate JWT token
   ↓
7. Return token + user profile
   ↓
8. Frontend stores token in localStorage
```

### Login Flow

```
1. User submits email/password
   ↓
2. Find user by email
   ↓
3. Verify password with bcrypt
   ↓
4. Check account is active
   ↓
5. Update last_login timestamp
   ↓
6. Generate JWT token
   ↓
7. Return token + user profile
   ↓
8. Frontend stores token in localStorage
```

### Protected Route Access

```
1. Frontend sends request with Authorization header
   ↓
2. Backend middleware receives request
   ↓
3. Extract token from header
   ↓
4. Verify JWT signature and expiration
   ↓
5. Decode token to get email and role
   ↓
6. Query database for user
   ↓
7. Attach user object to request
   ↓
8. Route handler uses current_user
   ↓
9. Return response
```

## 📝 Database Constraints

- `email` - UNIQUE, NOT NULL, INDEX
- `username` - UNIQUE, NOT NULL, INDEX
- `hashed_password` - NOT NULL, VARCHAR(255)
- `role` - NOT NULL, DEFAULT 'student'
- `experience_level` - DEFAULT 'fresher'
- `is_active` - DEFAULT TRUE
- `is_verified` - DEFAULT FALSE
- `created_at` - DEFAULT NOW()
- `updated_at` - DEFAULT NOW()

## 🚀 Running the Implementation

### 1. Start Backend

```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # Windows

pip install -r requirements.txt

# Run migrations if first time
alembic upgrade head

# Start server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Test APIs

```bash
# Using the provided test guide
# See USER_AUTH_API_TESTS.md for complete examples

# Or access Swagger UI
# http://localhost:8000/docs
```

### 3. Integration with Frontend

Frontend will:

1. Call `POST /api/users/register` for signup
2. Store returned JWT token
3. Include token in Authorization header for protected requests
4. Call `POST /api/users/login` for login
5. Handle 401/403 errors for token expiration

## 🐛 Common Issues & Solutions

### Issue: "Email already registered"

**Solution:** Use a different email or reset database

### Issue: "Password must contain at least one digit"

**Solution:** Add at least one number to password (e.g., "Pass123")

### Issue: "Invalid email or password"

**Solution:** Verify email and password are correct (case-sensitive)

### Issue: "Missing or invalid authentication token"

**Solution:** Add Authorization header: `Authorization: Bearer <token>`

### Issue: Token expires

**Solution:** Re-login to get new token (24-hour expiration by default)

## 📚 Code Examples

### Register User (Python)

```python
import requests

response = requests.post(
    "http://localhost:8000/api/users/register",
    json={
        "full_name": "John Doe",
        "email": "john@example.com",
        "password": "SecurePass123",
        "experience_level": "fresher"
    }
)
print(response.json())
```

### Use JWT Token (JavaScript)

```javascript
// Store token from login/register response
localStorage.setItem("authToken", response.data.access_token);

// Use token in requests
const config = {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  },
};
const userProfile = await axios.get("/api/users/me", config);
```

## ✨ Key Features Summary

| Feature            | Status      | Details                             |
| ------------------ | ----------- | ----------------------------------- |
| User Registration  | ✅ Complete | Email, password, career fields      |
| User Login         | ✅ Complete | JWT token, 24h expiration           |
| JWT Middleware     | ✅ Complete | Token verification, user extraction |
| Profile Management | ✅ Complete | Get, update, timestamps             |
| Skills Management  | ✅ Complete | Add, remove, list (JSON storage)    |
| CV Storage         | ✅ Complete | Store raw text (ready for AI)       |
| Password Security  | ✅ Complete | Bcrypt hashing with salt            |
| Email Validation   | ✅ Complete | Format and uniqueness checks        |
| Error Handling     | ✅ Complete | Proper HTTP status codes            |
| API Documentation  | ✅ Complete | Swagger UI at /docs                 |

## 🔄 Next Steps

When frontend development starts:

1. Create login/register pages
2. Store JWT token in localStorage
3. Include token in API requests
4. Handle 401 errors (redirect to login)
5. Implement logout (clear token)
6. Show user profile on dashboard
7. Allow profile editing
8. Manage user skills

## 📖 Documentation Files

- `USER_AUTH_API_TESTS.md` - Complete API testing guide with examples
- This file (`USER_AUTHENTICATION_IMPLEMENTATION.md`) - Implementation details
- Inline code comments - In all Python files for clarity

## 🎓 Learning Resources

For understanding the implementation:

1. **FastAPI Docs:** https://fastapi.tiangolo.com
2. **SQLAlchemy ORM:** https://docs.sqlalchemy.org
3. **JWT Auth:** https://tools.ietf.org/html/rfc7519
4. **Pydantic:** https://docs.pydantic.dev
5. **Bcrypt:** https://github.com/pyca/bcrypt

---

**Status:** ✅ User authentication and management implementation complete and ready for integration with frontend!
