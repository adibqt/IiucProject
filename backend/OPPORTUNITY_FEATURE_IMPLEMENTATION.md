# Local Opportunity Recommendations - Backend Implementation

## ✅ Implementation Complete

The backend for the Local Opportunity Recommendations feature has been fully implemented. This document outlines what was created and how to use it.

---

## 📦 Files Created/Modified

### 1. Database Model

- **File**: `backend/models.py`
- **Model**: `LocalOpportunity`
- **Table**: `local_opportunities`

### 2. Pydantic Schemas

- **File**: `backend/schemas.py`
- **Schemas Added**:
  - `LocalOpportunityBase`
  - `LocalOpportunityCreate`
  - `LocalOpportunityUpdate`
  - `LocalOpportunityResponse`
  - `OpportunityRecommendationResponse`

### 3. Service Layer

- **File**: `backend/services/opportunity_service.py`
- **Functions**:
  - `build_user_context_for_opportunities()` - Builds user context from profile, skills, CV
  - `format_opportunities_for_prompt()` - Formats opportunities for Gemini
  - `build_opportunity_prompt()` - Creates Gemini prompt with SDG 8 focus
  - `clean_opportunity_response()` - Cleans Gemini output
  - `generate_opportunity_recommendations()` - Main function to generate recommendations
  - `filter_opportunities_by_user_profile()` - Filters opportunities by user skills/track

### 4. API Routes

- **File**: `backend/routes/opportunity_routes.py`
- **Endpoints**:
  - `GET /api/opportunities/recommend` - Get personalized recommendations (Protected)
  - `GET /api/opportunities/all` - Get all opportunities (Admin only)
  - `POST /api/opportunities/create` - Create opportunity (Admin only)
  - `PUT /api/opportunities/{id}` - Update opportunity (Admin only)
  - `DELETE /api/opportunities/{id}` - Delete opportunity (Admin only)
  - `GET /api/opportunities/{id}` - Get specific opportunity (Public)

### 5. Database Migration

- **File**: `backend/alembic/versions/006_add_local_opportunities.py`
- **Migration ID**: `006`
- **Revises**: `005`

### 6. Main App Registration

- **File**: `backend/main.py`
- Routes registered and model imported

---

## 🗄️ Database Schema

### `local_opportunities` Table

```sql
CREATE TABLE local_opportunities (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    organization VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,  -- "Internship", "Training", "Job", "Youth Program"
    target_track VARCHAR(255),       -- e.g., "Frontend", "Data Science", "Cybersecurity"
    required_skills TEXT,             -- JSON array of skill IDs or skill names
    link VARCHAR(1000),                -- URL to apply or learn more
    priority_group VARCHAR(255),      -- e.g., "Women", "Rural Youth", "All Youth", "Low-Income"
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ix_local_opportunities_id ON local_opportunities(id);
CREATE INDEX ix_local_opportunities_title ON local_opportunities(title);
CREATE INDEX ix_local_opportunities_category ON local_opportunities(category);
CREATE INDEX ix_local_opportunities_target_track ON local_opportunities(target_track);
CREATE INDEX ix_local_opportunities_is_active ON local_opportunities(is_active);
```

---

## 🚀 API Endpoints

### 1. Get Personalized Recommendations

**Endpoint**: `GET /api/opportunities/recommend`

**Authentication**: Required (JWT token)

**Description**:

- Fetches user profile, skills, and CV data
- Filters opportunities based on matching skills/track
- Generates personalized explanation using Gemini
- Returns ranked opportunities with explanations

**Response**:

```json
{
  "success": true,
  "explanation": "🎯 Top Local Opportunities Tailored for You\n\n### 1. Frontend Developer Internship...",
  "opportunities": [
    {
      "id": 1,
      "title": "Frontend Developer Internship",
      "organization": "Tech Company",
      "description": "...",
      "location": "Dhaka",
      "category": "Internship",
      "target_track": "Frontend",
      "required_skills": "[1, 2, 3]",
      "link": "https://...",
      "priority_group": "All Youth",
      "is_active": true,
      "created_at": "2025-01-15T10:00:00",
      "updated_at": "2025-01-15T10:00:00"
    }
  ],
  "total_matched": 3
}
```

### 2. Get All Opportunities (Admin)

**Endpoint**: `GET /api/opportunities/all?skip=0&limit=100`

**Authentication**: Required (Admin JWT token)

**Query Parameters**:

- `skip` (int, default: 0) - Pagination offset
- `limit` (int, default: 100) - Number of results

### 3. Create Opportunity (Admin)

**Endpoint**: `POST /api/opportunities/create`

**Authentication**: Required (Admin JWT token)

**Request Body**:

```json
{
  "title": "Frontend Developer Internship",
  "organization": "Tech Company",
  "description": "We are looking for a frontend developer intern...",
  "location": "Dhaka, Bangladesh",
  "category": "Internship",
  "target_track": "Frontend",
  "required_skills": "[1, 2, 3]",
  "link": "https://example.com/apply",
  "priority_group": "All Youth",
  "is_active": true
}
```

### 4. Update Opportunity (Admin)

**Endpoint**: `PUT /api/opportunities/{id}`

**Authentication**: Required (Admin JWT token)

**Request Body**: Same as create, but all fields optional

### 5. Delete Opportunity (Admin)

**Endpoint**: `DELETE /api/opportunities/{id}`

**Authentication**: Required (Admin JWT token)

**Response**:

```json
{
  "success": true,
  "message": "Opportunity 'Frontend Developer Internship' deleted successfully",
  "opportunity_id": 1
}
```

### 6. Get Specific Opportunity (Public)

**Endpoint**: `GET /api/opportunities/{id}`

**Authentication**: Not required

**Description**: Returns a specific active opportunity

---

## 🤖 Gemini Integration

### System Prompt Features

The Gemini prompt includes:

- SDG 8 (Decent Work and Economic Growth) alignment
- Focus on disadvantaged youth groups (women, rural youth, low-income)
- Professional, encouraging tone
- Structured output format (NO JSON)
- Multi-language support (English, Bangla, Banglish)

### Output Format

Gemini generates responses in this structure:

```
🎯 Top Local Opportunities Tailored for You

### 1. [Opportunity Title]
**Why it matches you →**
- Skills matched: [list]
- Track relevance: [explanation]
- Experience fit: [how it matches]

**Action Steps →**
- Improve [skill]
- Prepare [portfolio/document]
- Contact [organization]

**Impact →**
[SDG 8 / disadvantaged youth relevance]

---

### 2. [Next Opportunity]
...

### 📌 Final Advice
[Personalized summary and next steps]
```

---

## 🔍 Filtering Algorithm

The system filters opportunities based on:

1. **Track Matching**:

   - If user has career interests, matches opportunities with matching `target_track`

2. **Skill Matching**:

   - Parses `required_skills` (JSON array)
   - Checks if at least 1-2 skills overlap with user's skills
   - Case-insensitive matching

3. **Fallback**:
   - If no matches found, returns all active opportunities

---

## 📝 Usage Examples

### Example 1: Create an Opportunity (Admin)

```bash
curl -X POST "http://localhost:8000/api/opportunities/create" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Data Science Training Program",
    "organization": "Youth Development Foundation",
    "description": "A comprehensive 3-month training program in data science for youth...",
    "location": "Dhaka, Bangladesh",
    "category": "Training",
    "target_track": "Data Science",
    "required_skills": "[5, 6, 7]",
    "link": "https://example.com/training",
    "priority_group": "Rural Youth",
    "is_active": true
  }'
```

### Example 2: Get Recommendations (User)

```bash
curl -X GET "http://localhost:8000/api/opportunities/recommend" \
  -H "Authorization: Bearer <user_token>"
```

### Example 3: Get All Opportunities (Admin)

```bash
curl -X GET "http://localhost:8000/api/opportunities/all?skip=0&limit=50" \
  -H "Authorization: Bearer <admin_token>"
```

---

## 🗃️ Sample Data

To populate the database with sample opportunities, you can use the admin endpoint:

```python
# Example opportunity data
opportunities = [
    {
        "title": "Frontend Developer Internship",
        "organization": "TechStart Bangladesh",
        "description": "6-month paid internship for frontend developers...",
        "location": "Dhaka",
        "category": "Internship",
        "target_track": "Frontend",
        "required_skills": "[1, 2, 3]",  # Skill IDs from skills table
        "link": "https://techstart.com/careers",
        "priority_group": "All Youth"
    },
    {
        "title": "Data Science Bootcamp",
        "organization": "Youth Skills Academy",
        "description": "Free 3-month bootcamp for data science...",
        "location": "Chittagong",
        "category": "Training",
        "target_track": "Data Science",
        "required_skills": "[5, 6, 7]",
        "link": "https://youthskills.org/bootcamp",
        "priority_group": "Rural Youth"
    }
]
```

---

## 🔄 Database Migration

To apply the migration:

```bash
# From backend directory
alembic upgrade head
```

Or using Docker:

```bash
docker compose exec backend alembic upgrade head
```

---

## ✅ Testing Checklist

- [x] Database model created
- [x] Migration file created
- [x] Schemas defined
- [x] Service functions implemented
- [x] Routes created and registered
- [x] Gemini integration complete
- [x] Filtering algorithm implemented
- [x] Admin endpoints protected
- [x] User endpoint protected
- [x] Error handling implemented

---

## 🎯 Next Steps (Frontend)

The backend is ready. The frontend should:

1. Create a page/component for displaying recommendations
2. Call `GET /api/opportunities/recommend` with user token
3. Display the Gemini explanation (formatted as markdown)
4. Show the list of opportunities with details
5. Add admin interface for managing opportunities

---

## 📚 Notes

- **No External APIs**: All opportunities come from the curated database
- **Gemini Only for Explanation**: Gemini is used for ranking, explanation, and personalization - NOT for fetching opportunities
- **SDG 8 Focus**: System emphasizes opportunities for disadvantaged youth
- **Multi-language**: Supports English, Bangla, and Banglish responses
- **Human-readable Output**: Gemini output is cleaned to remove JSON/code blocks

---

**Implementation Date**: January 15, 2025  
**Status**: ✅ Backend Complete - Ready for Frontend Integration
