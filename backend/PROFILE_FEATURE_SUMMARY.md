# User Profile & Skill Input Backend - Implementation Summary

## Overview

Implemented a complete user profile management system with skill input, experience tracking, career interests, and CV storage. All endpoints are modular, clean, and follow existing project patterns.

## What Was Added

### 1. Database Model Extensions (backend/models.py)

Extended the `User` model with three new fields:

- `experience_description` (Text) — user's work/project experience
- `career_interests` (Text) — target roles or career paths (stored as JSON array)
- `cv_text` (Text) — CV/resume text for later AI analysis

The `Skill` relationship already existed in the User model as a many-to-many relationship (`user_skills` table).

### 2. Pydantic Schemas (backend/schemas.py)

Added/Updated:

- `UserProfileUpdate` — request schema for profile updates (all new fields + existing fields)
- `UserProfile` — enhanced response schema to include all profile fields

### 3. Profile Service (backend/profile_service.py)

Clean, reusable business logic class `ProfileService` with methods:

- `get_user_profile(db, user_id)` — fetch user by ID
- `update_user_profile(db, user_id, profile_data)` — update all profile fields
- `add_skill(db, user_id, skill_id, proficiency_level)` — add skill via many-to-many
- `remove_skill(db, user_id, skill_id)` — remove skill
- `get_user_skills(db, user_id)` — fetch user's skills list
- `set_career_interests(db, user_id, interests)` — set interests (stores as JSON)
- `get_career_interests(db, user_id)` — get interests (parses from JSON)
- `set_experience_description(db, user_id, experience)` — set experience text
- `set_cv_text(db, user_id, cv_text)` — store CV text

### 4. Profile Routes (backend/routes/profile_routes.py)

Modular FastAPI router with the following endpoints:

#### Profile Endpoints

- `GET /api/users/me/profile` — get current user's full profile (protected)
- `PUT /api/users/me/profile` — update current user's profile (protected)
- `GET /api/users/{user_id}/profile` — get any user's public profile

#### Skill Management Endpoints

- `GET /api/users/me/skills` — get current user's skills (returns Skill objects) (protected)
- `POST /api/users/me/skills/{skill_id}` — add skill to user (protected)
  - Query param: `proficiency_level` (beginner, intermediate, advanced, expert)
- `DELETE /api/users/me/skills/{skill_id}` — remove skill from user (protected)

#### Career Interests Endpoints

- `GET /api/users/me/career-interests` — get user's career interests list (protected)
- `POST /api/users/me/career-interests` — set/update career interests (protected)
  - Body: `{ "interests": ["Data Science", "Frontend", ...] }`

#### Experience Endpoints

- `PUT /api/users/me/experience` — update experience description (protected)
  - Body: `{ "experience_description": "5 years in full-stack..." }`

#### CV Endpoints

- `PUT /api/users/me/cv` — store/update CV text (protected)
  - Body: `{ "cv_text": "Full CV/resume text..." }`

### 5. Main App Integration (backend/main.py)

Included the profile router:

```python
from routes.profile_routes import router as profile_router
app.include_router(profile_router)
```

## API Testing Examples (PowerShell)

### 1. Get Current User's Profile

```powershell
$userToken = "YOUR_USER_JWT_TOKEN"
Invoke-WebRequest -Uri "http://localhost:8000/api/users/me/profile" `
  -Method GET `
  -Headers @{ Authorization = "Bearer $userToken" } | Select-Object -ExpandProperty Content
```

### 2. Update User's Profile (with new fields)

```powershell
$profileData = @{
    full_name = "John Doe"
    bio = "Passionate learner"
    phone_number = "+1234567890"
    experience_description = "5 years in backend development"
    career_interests = null
    cv_text = "CV content here"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000/api/users/me/profile" `
  -Method PUT `
  -Headers @{ Authorization = "Bearer $userToken"; "Content-Type" = "application/json" } `
  -Body $profileData | Select-Object -ExpandProperty Content
```

### 3. Get User's Skills

```powershell
Invoke-WebRequest -Uri "http://localhost:8000/api/users/me/skills" `
  -Method GET `
  -Headers @{ Authorization = "Bearer $userToken" } | Select-Object -ExpandProperty Content
```

### 4. Add Skill to User (assuming skill_id=1 exists)

```powershell
Invoke-WebRequest -Uri "http://localhost:8000/api/users/me/skills/1?proficiency_level=intermediate" `
  -Method POST `
  -Headers @{ Authorization = "Bearer $userToken" } | Select-Object -ExpandProperty Content
```

### 5. Remove Skill from User

```powershell
Invoke-WebRequest -Uri "http://localhost:8000/api/users/me/skills/1" `
  -Method DELETE `
  -Headers @{ Authorization = "Bearer $userToken" } | Select-Object -ExpandProperty Content
```

### 6. Set Career Interests

```powershell
$interestData = @{
    interests = @("Data Science", "Machine Learning", "Backend Development")
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000/api/users/me/career-interests" `
  -Method POST `
  -Headers @{ Authorization = "Bearer $userToken"; "Content-Type" = "application/json" } `
  -Body $interestData | Select-Object -ExpandProperty Content
```

### 7. Get Career Interests

```powershell
Invoke-WebRequest -Uri "http://localhost:8000/api/users/me/career-interests" `
  -Method GET `
  -Headers @{ Authorization = "Bearer $userToken" } | Select-Object -ExpandProperty Content
```

### 8. Update Experience Description

```powershell
$expData = @{
    experience_description = "Worked as a Full Stack Developer for 5 years..."
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000/api/users/me/experience" `
  -Method PUT `
  -Headers @{ Authorization = "Bearer $userToken"; "Content-Type" = "application/json" } `
  -Body $expData | Select-Object -ExpandProperty Content
```

### 9. Update CV Text

```powershell
$cvData = @{
    cv_text = "JOHN DOE
Senior Full Stack Developer
...full CV text..."
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000/api/users/me/cv" `
  -Method PUT `
  -Headers @{ Authorization = "Bearer $userToken"; "Content-Type" = "application/json" } `
  -Body $cvData | Select-Object -ExpandProperty Content
```

## Architecture Highlights

1. **Clean Separation**: Profile service handles business logic; routes handle HTTP/FastAPI details.
2. **Skill Management**: Uses the existing SQLAlchemy many-to-many relationship (`user_skills` table).
3. **JSON Storage**: Career interests stored as JSON strings in the database for flexibility.
4. **Future-Ready**: CV text stored but not processed; ready for AI analysis in future phases.
5. **Protected Routes**: All endpoints require user JWT authentication (except public profile view).
6. **Consistent Patterns**: Follows existing project error handling, response schemas, and modular structure.

## Frontend Integration

The frontend can now:

- Call these endpoints to build a profile/settings page
- Show skill input/selection UI
- Display career interests
- Store/edit experience and CV text

No frontend implementation yet — these endpoints are ready for frontend consumption.

## Notes

- All protected routes use the existing `get_current_user` dependency from `api_users.py`.
- Skills are returned as full Skill objects (id, name, slug, etc.) via the SQLAlchemy relationship.
- Career interests are stored as a JSON array of strings for flexibility.
- CV text is stored as plain text — no validation or processing is done (as per spec).
