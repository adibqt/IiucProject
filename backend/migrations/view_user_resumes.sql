-- SQL query to view all CV/Resume data from user_resumes table

-- View all resumes with basic info
SELECT 
    id,
    user_id,
    personal_summary,
    experiences,
    education,
    skills,
    tools,
    projects,
    raw_cv_text,
    created_at,
    updated_at
FROM user_resumes;

-- View resumes with user information (join with users table)
SELECT 
    ur.id,
    ur.user_id,
    u.full_name,
    u.email,
    ur.personal_summary,
    ur.experiences,
    ur.education,
    ur.skills,
    ur.tools,
    ur.projects,
    ur.raw_cv_text,
    ur.created_at,
    ur.updated_at
FROM user_resumes ur
LEFT JOIN users u ON ur.user_id = u.id
ORDER BY ur.updated_at DESC;

-- Count total resumes
SELECT COUNT(*) as total_resumes FROM user_resumes;

-- View parsed JSON data (PostgreSQL specific - if you want to see parsed JSON)
SELECT 
    id,
    user_id,
    personal_summary,
    experiences::jsonb as experiences_parsed,
    education::jsonb as education_parsed,
    skills::jsonb as skills_parsed,
    tools::jsonb as tools_parsed,
    projects::jsonb as projects_parsed,
    LENGTH(raw_cv_text) as raw_cv_text_length,
    created_at,
    updated_at
FROM user_resumes;

