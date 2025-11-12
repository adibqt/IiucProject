# User Authentication & Management API - Test Guide

This document provides sample API requests for testing the user authentication and management endpoints.

## Base URL

```
http://localhost:8000
```

## 📝 API Endpoints Overview

### Authentication

- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `POST /api/users/logout` - Logout user (protected)

### Profile Management

- `GET /api/users/me` - Get current user profile (protected)
- `PUT /api/users/me` - Update current user profile (protected)
- `GET /api/users/{user_id}` - Get user by ID (public)

### Skills Management

- `GET /api/users/me/skills` - Get current user's skills (protected)
- `POST /api/users/me/skills` - Add skill to profile (protected)
- `DELETE /api/users/me/skills` - Remove skill from profile (protected)

### CV Management

- `PUT /api/users/me/cv` - Update CV/resume text (protected)

---

## 🚀 Sample Requests

### 1. User Registration

**Request:**

```bash
curl -X POST "http://localhost:8000/api/users/register" \
  -H "Content-Type: application/json" \
  -d {
    "full_name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "education_level": "Bachelor's Degree",
    "experience_level": "fresher",
    "preferred_career_track": "Web Development"
  }
```

**Response (201 Created):**

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
    "bio": null,
    "education_level": "Bachelor's Degree",
    "experience_level": "fresher",
    "preferred_career_track": "Web Development",
    "skills": null,
    "experiences": null,
    "created_at": "2025-11-12T10:30:00",
    "updated_at": "2025-11-12T10:30:00"
  }
}
```

**Validation Rules:**

- `full_name`: Required, 2-255 characters
- `email`: Required, valid email format, must be unique
- `password`: Required, minimum 8 characters, must contain at least one digit
- `education_level`: Optional
- `experience_level`: Optional (default: "fresher")
- `preferred_career_track`: Optional

**Error Responses:**

```json
// Email already registered (400)
{
  "detail": "Email already registered"
}

// Invalid password (422)
{
  "detail": [{
    "loc": ["body", "password"],
    "msg": "Password must contain at least one digit",
    "type": "value_error"
  }]
}
```

---

### 2. User Login

**Request:**

```bash
curl -X POST "http://localhost:8000/api/users/login" \
  -H "Content-Type: application/json" \
  -d {
    "email": "john@example.com",
    "password": "SecurePass123"
  }
```

**Response (200 OK):**

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
    "bio": null,
    "education_level": "Bachelor's Degree",
    "experience_level": "fresher",
    "preferred_career_track": "Web Development",
    "skills": null,
    "experiences": null,
    "created_at": "2025-11-12T10:30:00",
    "updated_at": "2025-11-12T10:30:00"
  }
}
```

**Error Responses:**

```json
// Invalid credentials (401)
{
  "detail": "Invalid email or password"
}

// Account inactive (403)
{
  "detail": "Account is inactive"
}
```

---

### 3. Get Current User Profile

**Request:**

```bash
curl -X GET "http://localhost:8000/api/users/me" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**

```json
{
  "id": 1,
  "full_name": "John Doe",
  "email": "john@example.com",
  "username": "john",
  "role": "student",
  "bio": null,
  "education_level": "Bachelor's Degree",
  "experience_level": "fresher",
  "preferred_career_track": "Web Development",
  "skills": ["JavaScript", "React", "Node.js"],
  "experiences": null,
  "created_at": "2025-11-12T10:30:00",
  "updated_at": "2025-11-12T10:45:00"
}
```

**Error Responses:**

```json
// Missing token (401)
{
  "detail": "Missing or invalid authentication token"
}

// Invalid token (401)
{
  "detail": "Could not validate credentials"
}

// User not found (404)
{
  "detail": "User not found"
}
```

---

### 4. Update User Profile

**Request:**

```bash
curl -X PUT "http://localhost:8000/api/users/me" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d {
    "full_name": "John Doe Updated",
    "bio": "Software developer passionate about web technologies",
    "education_level": "Bachelor's in Computer Science",
    "experience_level": "junior",
    "phone_number": "+1234567890",
    "preferred_career_track": "Full Stack Web Development",
    "learning_style": "visual",
    "career_goals": "Become a senior full-stack engineer",
    "cv_text": "JOHN DOE\n..."
  }
```

**Response (200 OK):**

```json
{
  "id": 1,
  "full_name": "John Doe Updated",
  "email": "john@example.com",
  "username": "john",
  "role": "student",
  "bio": "Software developer passionate about web technologies",
  "education_level": "Bachelor's in Computer Science",
  "experience_level": "junior",
  "preferred_career_track": "Full Stack Web Development",
  "skills": ["JavaScript", "React", "Node.js"],
  "experiences": null,
  "created_at": "2025-11-12T10:30:00",
  "updated_at": "2025-11-12T11:00:00"
}
```

**Note:** All fields are optional. Only provided fields will be updated.

---

### 5. Get User by ID

**Request:**

```bash
curl -X GET "http://localhost:8000/api/users/1"
```

**Response (200 OK):**

```json
{
  "id": 1,
  "full_name": "John Doe",
  "email": "john@example.com",
  "username": "john",
  "role": "student",
  "bio": "Software developer passionate about web technologies",
  "education_level": "Bachelor's Degree",
  "experience_level": "fresher",
  "preferred_career_track": "Web Development",
  "skills": ["JavaScript", "React", "Node.js"],
  "experiences": null,
  "created_at": "2025-11-12T10:30:00",
  "updated_at": "2025-11-12T10:45:00"
}
```

**Error Response:**

```json
// User not found (404)
{
  "detail": "User not found"
}
```

---

### 6. Add Skill to Profile

**Request:**

```bash
curl -X POST "http://localhost:8000/api/users/me/skills?skill=Python" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Skill 'Python' added successfully"
}
```

**Error Responses:**

```json
// Missing authorization (401)
{
  "detail": "Missing or invalid authentication token"
}
```

---

### 7. Remove Skill from Profile

**Request:**

```bash
curl -X DELETE "http://localhost:8000/api/users/me/skills?skill=Python" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Skill 'Python' removed successfully"
}
```

---

### 8. Get User's Skills

**Request:**

```bash
curl -X GET "http://localhost:8000/api/users/me/skills" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**

```json
{
  "skills": ["JavaScript", "React", "Node.js", "Python"],
  "count": 4
}
```

---

### 9. Update CV/Resume Text

**Request:**

```bash
curl -X PUT "http://localhost:8000/api/users/me/cv" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d {
    "cv_text": "JOHN DOE\njohn@example.com\n\nEXPERIENCE:\n- Junior Web Developer at TechCorp (2023-Present)\n  - Built React applications\n  - API integration with Node.js\n\nEDUCATION:\n- Bachelor's in Computer Science, University (2023)\n\nSKILLS:\n- JavaScript, React, Node.js, Python, SQL"
  }
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "CV updated successfully"
}
```

---

### 10. User Logout

**Request:**

```bash
curl -X POST "http://localhost:8000/api/users/logout" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Note:** With JWT authentication, logout is mainly a client-side operation. The client removes the token from storage.

---

## 🔐 Authentication Notes

### JWT Token Structure

- **Header:** `Authorization: Bearer <JWT_TOKEN>`
- **Token Format:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huQGV4YW1wbGUuY29tIiwicm9sZSI6InN0dWRlbnQiLCJleHAiOjE3MzE0MTIwMDB9.xxx`
- **Expiration:** 24 hours by default
- **Algorithm:** HS256

### Token Claims

```json
{
  "sub": "john@example.com", // Subject (user email)
  "role": "student", // User role
  "exp": 1731412000 // Expiration timestamp
}
```

### Security Best Practices

1. ✅ Passwords are hashed with bcrypt before storage
2. ✅ Tokens are signed with SECRET_KEY from .env
3. ✅ All protected routes require valid JWT
4. ✅ Invalid credentials don't reveal which field is wrong
5. ✅ Sensitive information not returned in responses
6. ✅ User email is unique in the database

---

## 📝 Testing with Python Requests

```python
import requests
import json

BASE_URL = "http://localhost:8000"

# Register
response = requests.post(
    f"{BASE_URL}/api/users/register",
    json={
        "full_name": "Jane Doe",
        "email": "jane@example.com",
        "password": "SecurePass456",
        "education_level": "Master's Degree",
        "experience_level": "junior",
        "preferred_career_track": "Data Science"
    }
)
print("Register:", response.json())
token = response.json()["access_token"]

# Get profile
response = requests.get(
    f"{BASE_URL}/api/users/me",
    headers={"Authorization": f"Bearer {token}"}
)
print("Profile:", response.json())

# Add skill
response = requests.post(
    f"{BASE_URL}/api/users/me/skills?skill=Machine%20Learning",
    headers={"Authorization": f"Bearer {token}"}
)
print("Add Skill:", response.json())

# Get skills
response = requests.get(
    f"{BASE_URL}/api/users/me/skills",
    headers={"Authorization": f"Bearer {token}"}
)
print("Skills:", response.json())

# Update profile
response = requests.put(
    f"{BASE_URL}/api/users/me",
    headers={"Authorization": f"Bearer {token}"},
    json={
        "bio": "Data scientist and ML engineer",
        "experience_level": "mid"
    }
)
print("Update Profile:", response.json())

# Login
response = requests.post(
    f"{BASE_URL}/api/users/login",
    json={
        "email": "jane@example.com",
        "password": "SecurePass456"
    }
)
print("Login:", response.json())
```

---

## 🧪 Testing with Postman

1. **Create New Request:** `POST /api/users/register`
2. **Set Headers:** `Content-Type: application/json`
3. **Set Body (JSON):**
   ```json
   {
     "full_name": "Test User",
     "email": "test@example.com",
     "password": "TestPass123",
     "education_level": "Bachelor's",
     "experience_level": "fresher",
     "preferred_career_track": "Web Development"
   }
   ```
4. **Save token** from response
5. **Create Bearer Token:** In Authorization tab, select "Bearer Token" and paste the token
6. **Test protected endpoints** with the token

---

## ✅ Test Cases Checklist

- [ ] Register new user with valid data
- [ ] Register fails with existing email
- [ ] Register fails with weak password
- [ ] Register fails with invalid email format
- [ ] Login with correct credentials
- [ ] Login fails with incorrect password
- [ ] Login fails with non-existent email
- [ ] Get profile without token → 401
- [ ] Get profile with invalid token → 401
- [ ] Get profile with valid token → 200
- [ ] Update profile fields
- [ ] Update with invalid data
- [ ] Add skill to profile
- [ ] Remove skill from profile
- [ ] Get user skills list
- [ ] Update CV text
- [ ] Logout successfully
- [ ] Token expires after 24 hours

---

## 🚀 Running the Backend

```bash
# 1. Create virtual environment
python -m venv venv
source venv/Scripts/activate  # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set up environment
# Create .env file with:
# DATABASE_URL=postgresql://user:password@localhost/career_roadmap
# SECRET_KEY=your-secret-key-change-in-production

# 4. Run migrations (first time)
alembic upgrade head

# 5. Start server
uvicorn main:app --reload

# 6. Access API docs
# Swagger UI: http://localhost:8000/docs
# ReDoc: http://localhost:8000/redoc
```

---

## 📚 Database Schema

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  hashed_password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'student',
  bio TEXT,
  avatar_url VARCHAR(500),
  phone_number VARCHAR(20),
  education_level VARCHAR(100),
  experience_level VARCHAR(50) DEFAULT 'fresher',
  preferred_career_track VARCHAR(255),
  skills TEXT,  -- JSON array
  experiences TEXT,  -- JSON array
  cv_text TEXT,
  learning_style VARCHAR(50),
  skill_level VARCHAR(50),
  interests TEXT,  -- JSON array
  career_goals TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);
```

---

## 🔧 Troubleshooting

### "Email already registered"

- Check if user with that email exists
- Use different email for new registration

### "Invalid email or password"

- Double-check credentials (case-sensitive)
- Verify email is correct

### "Missing or invalid authentication token"

- Ensure Bearer token is included in Authorization header
- Check token format: `Bearer <token>`

### "Could not validate credentials"

- Token may have expired (24 hours)
- Re-login to get new token

### "User not found"

- Verify user ID exists
- Check token corresponds to correct user

---

## 📞 Support

For issues or questions:

1. Check API documentation at `/docs`
2. Review this test guide
3. Check error message details
4. Verify database connectivity
