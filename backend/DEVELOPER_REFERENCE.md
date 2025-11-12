# Developer's Quick Reference Card

## 🔗 API Quick Reference

### Base URL

```
http://localhost:8000
```

### Authentication Header Format

```
Authorization: Bearer <JWT_TOKEN>
```

---

## 📝 Endpoint Quick Reference

### 1. Register User

```bash
curl -X POST "http://localhost:8000/api/users/register" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"John","email":"john@example.com","password":"Pass123"}'
```

**Response:** 201 with `access_token`

---

### 2. Login User

```bash
curl -X POST "http://localhost:8000/api/users/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Pass123"}'
```

**Response:** 200 with `access_token`

---

### 3. Get Current User Profile

```bash
curl -X GET "http://localhost:8000/api/users/me" \
  -H "Authorization: Bearer TOKEN"
```

**Response:** 200 with user profile

---

### 4. Update Profile

```bash
curl -X PUT "http://localhost:8000/api/users/me" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"John Updated","bio":"Developer"}'
```

**Response:** 200 with updated profile

---

### 5. Add Skill

```bash
curl -X POST "http://localhost:8000/api/users/me/skills?skill=JavaScript" \
  -H "Authorization: Bearer TOKEN"
```

**Response:** 200 success message

---

### 6. Remove Skill

```bash
curl -X DELETE "http://localhost:8000/api/users/me/skills?skill=JavaScript" \
  -H "Authorization: Bearer TOKEN"
```

**Response:** 200 success message

---

### 7. Get User Skills

```bash
curl -X GET "http://localhost:8000/api/users/me/skills" \
  -H "Authorization: Bearer TOKEN"
```

**Response:** 200 with skills array

---

### 8. Update CV

```bash
curl -X PUT "http://localhost:8000/api/users/me/cv" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cv_text":"JOHN DOE\nDeveloper at TechCorp..."}'
```

**Response:** 200 success message

---

## 🔐 HTTP Status Codes

| Code | Meaning       | When                                    |
| ---- | ------------- | --------------------------------------- |
| 200  | OK            | Successful GET/PUT                      |
| 201  | Created       | Successful POST (register)              |
| 400  | Bad Request   | Validation error                        |
| 401  | Unauthorized  | Missing/invalid token or wrong password |
| 403  | Forbidden     | Account inactive                        |
| 404  | Not Found     | User doesn't exist                      |
| 422  | Unprocessable | Schema validation error                 |

---

## 💾 Common Data Models

### User Profile

```json
{
  "id": 1,
  "full_name": "John Doe",
  "email": "john@example.com",
  "username": "john",
  "role": "student",
  "bio": "...",
  "education_level": "Bachelor's",
  "experience_level": "fresher",
  "preferred_career_track": "Web Dev",
  "skills": ["JavaScript", "React"],
  "created_at": "2025-11-12T10:30:00",
  "updated_at": "2025-11-12T10:45:00"
}
```

### Registration Request

```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "education_level": "Bachelor's",
  "experience_level": "fresher",
  "preferred_career_track": "Web Development"
}
```

### Login Request

```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Profile Update Request

```json
{
  "full_name": "John Updated",
  "bio": "Software developer",
  "phone_number": "+1234567890",
  "experience_level": "junior"
}
```

---

## 🛠️ Development Quick Commands

### Start Backend

```bash
cd backend
python -m uvicorn main:app --reload
```

### Run Migrations

```bash
alembic revision --autogenerate -m "description"
alembic upgrade head
```

### Access API Docs

```
Swagger: http://localhost:8000/docs
ReDoc:   http://localhost:8000/redoc
```

### Test with Python

```python
import requests

# Login
r = requests.post('http://localhost:8000/api/users/login', json={
    'email': 'john@example.com',
    'password': 'Pass123'
})
token = r.json()['access_token']

# Use token
headers = {'Authorization': f'Bearer {token}'}
r = requests.get('http://localhost:8000/api/users/me', headers=headers)
print(r.json())
```

---

## 🔑 Key Files

| File              | Purpose                  |
| ----------------- | ------------------------ |
| `user_service.py` | Business logic           |
| `api_users.py`    | API routes               |
| `models.py`       | Database models          |
| `schemas.py`      | Pydantic validation      |
| `auth.py`         | JWT & password utilities |
| `main.py`         | FastAPI app setup        |

---

## 🔄 Common Workflows

### Frontend: Register → Login → Access Profile

```javascript
// 1. Register
const reg = await axios.post("/api/users/register", {
  full_name: "John",
  email: "john@example.com",
  password: "Pass123",
});
localStorage.setItem("authToken", reg.data.access_token);

// 2. Login (next time)
const login = await axios.post("/api/users/login", {
  email: "john@example.com",
  password: "Pass123",
});
localStorage.setItem("authToken", login.data.access_token);

// 3. Access protected route
const config = {
  headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
};
const profile = await axios.get("/api/users/me", config);
```

---

## ❌ Common Errors & Fixes

| Error                            | Fix                                        |
| -------------------------------- | ------------------------------------------ |
| "Email already registered"       | Use different email                        |
| "Password must contain digit"    | Add number to password                     |
| "Missing authentication token"   | Add `Authorization: Bearer <token>` header |
| "Could not validate credentials" | Token expired, re-login                    |
| "User not found"                 | User ID doesn't exist                      |
| 422 validation error             | Check request body format                  |

---

## 📊 Database Schema (Quick View)

### Users Table Key Fields

```sql
id (PK)
email (UNIQUE)
username (UNIQUE)
hashed_password
full_name
role (student, admin, instructor)
education_level
experience_level (fresher, junior, mid, senior)
preferred_career_track
skills (JSON array)
experiences (JSON array)
cv_text
created_at
updated_at
last_login
```

---

## 🎯 Validation Rules

| Field            | Rules                               |
| ---------------- | ----------------------------------- |
| full_name        | 2-255 chars, required               |
| email            | Valid format, unique, required      |
| password         | 8+ chars, must have digit, required |
| education_level  | Optional string                     |
| experience_level | fresher/junior/mid/senior           |
| career_track     | Optional string                     |

---

## 🔐 Security Checklist

- [x] Passwords hashed with bcrypt
- [x] JWT tokens 24-hour expiration
- [x] Token signature verified
- [x] Email uniqueness enforced
- [x] Protected routes require token
- [x] No sensitive data in logs
- [x] SQL injection prevention (ORM)
- [x] CORS configured

---

## 📚 Documentation Files

| File                                  | Content           |
| ------------------------------------- | ----------------- |
| QUICK_START.md                        | 5-minute setup    |
| USER_AUTHENTICATION_IMPLEMENTATION.md | Complete guide    |
| USER_AUTH_API_TESTS.md                | 25+ test examples |
| DATABASE_MIGRATION_GUIDE.md           | Migration setup   |
| ARCHITECTURE_DIAGRAM.md               | System diagrams   |
| IMPLEMENTATION_SUMMARY.md             | Feature summary   |
| COMPLETION_CHECKLIST.md               | Full checklist    |
| README_IMPLEMENTATION.md              | Overview          |

---

## 🚀 Quick Test Suite (5 minutes)

```bash
# 1. Register
curl -X POST "http://localhost:8000/api/users/register" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test","email":"test@example.com","password":"Test123"}'

# 2. Login
curl -X POST "http://localhost:8000/api/users/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123"}'

# 3. Get profile (use token from response)
curl -X GET "http://localhost:8000/api/users/me" \
  -H "Authorization: Bearer <TOKEN>"

# 4. Add skill
curl -X POST "http://localhost:8000/api/users/me/skills?skill=Python" \
  -H "Authorization: Bearer <TOKEN>"

# 5. Get skills
curl -X GET "http://localhost:8000/api/users/me/skills" \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 💡 Tips & Tricks

1. **Use Swagger UI** for interactive testing

   - Go to http://localhost:8000/docs
   - Try endpoints from browser

2. **Save tokens** for manual testing

   - Copy token from register/login response
   - Use in Authorization header

3. **Check logs** for debugging

   - uvicorn logs show all requests
   - Error details in response body

4. **Test with Postman**

   - Create Bearer token auth
   - Reuse token across requests

5. **Use Python for integration**
   - `requests` library simplest
   - Good for testing workflows

---

## 📞 Getting Help

1. Check **QUICK_START.md** for common issues
2. Review **USER_AUTH_API_TESTS.md** for examples
3. Check error message in response
4. Look at implementation files for details
5. Review architecture in ARCHITECTURE_DIAGRAM.md

---

## 🎯 Integration Checklist

- [ ] Backend running on port 8000
- [ ] Database migrations applied
- [ ] CORS configured for frontend domain
- [ ] User registration working
- [ ] User login working
- [ ] Protected routes working
- [ ] Token storage working
- [ ] Profile update working
- [ ] Skills management working
- [ ] Error handling working

---

## 🚀 Production Checklist

- [ ] Change SECRET_KEY in .env
- [ ] Set DEBUG=False
- [ ] Update CORS origins
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure logging
- [ ] Test all endpoints
- [ ] Performance test
- [ ] Security audit
- [ ] Load test

---

**Quick Reference Version 1.0**
**Last Updated: November 12, 2025**
