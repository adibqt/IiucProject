"""
Seed script to populate the courses table with curated learning resources.

This script creates a diverse catalog of courses pulled from popular platforms
like YouTube, Udemy, and Coursera. Each course is associated with the existing
skills in the database through both the JSON `related_skills` column and the
`course_skills` many-to-many relationship.

Run this after the base schema and default skills have been created.
"""

import argparse
import json
import os
import sys

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import Course, Skill


def _build_session(database_url: str) -> Session:
    """Create a SQLAlchemy session for the provided database URL."""
    engine = create_engine(database_url)
    SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    return SessionLocal()


def _load_skills(session: Session) -> dict[str, Skill]:
    """Return a mapping of skill slug -> Skill object."""
    skills = session.query(Skill).all()
    return {skill.slug: skill for skill in skills}


def _create_course(
    session: Session,
    course_data: dict,
    skills_lookup: dict[str, Skill],
) -> None:
    """Create a single course entry if it does not already exist."""
    title = course_data["title"]
    platform = course_data["platform"]

    existing = (
        session.query(Course)
        .filter(Course.title == title, Course.platform == platform)
        .first()
    )
    if existing:
        return

    related_skill_slugs = course_data.pop("related_skill_slugs", [])
    related_skills = [
        skills_lookup[slug]
        for slug in related_skill_slugs
        if slug in skills_lookup
    ]

    related_skill_ids = [skill.id for skill in related_skills]
    course = Course(**course_data)
    course.related_skills = json.dumps(related_skill_ids) if related_skill_ids else None

    for skill in related_skills:
        course.skills.append(skill)

    session.add(course)


def upgrade(database_url: str | None = None):
    """Insert a curated catalog of 20+ courses mapped to existing skills."""
    load_dotenv()

    database_url = database_url or os.getenv(
        "DATABASE_URL", "postgresql://myuser:mypassword@localhost:5432/nutrimap"
    )
    session = _build_session(database_url)

    try:
        skills_lookup = _load_skills(session)

        if not skills_lookup:
            print("No skills found in database. Seed skills before courses.")
            return

        courses = [
            {
                "title": "JavaScript Essentials for Beginners",
                "platform": "Udemy",
                "url": "https://www.udemy.com/course/javascript-essentials/",
                "cost_type": "paid",
                "description": "Master core JavaScript concepts through interactive projects.",
                "thumbnail_url": "https://img-c.udemycdn.com/course/480x270/851712_fc61_6.jpg",
                "related_skill_slugs": ["javascript"],
            },
            {
                "title": "Modern HTML & CSS From the Beginning",
                "platform": "Udemy",
                "url": "https://www.udemy.com/course/modern-html-css-from-the-beginning/",
                "cost_type": "paid",
                "description": "Learn responsive web design with modern HTML5 and CSS3 techniques.",
                "thumbnail_url": "https://img-c.udemycdn.com/course/480x270/626928_6e8d_4.jpg",
                "related_skill_slugs": ["html-css"],
            },
            {
                "title": "React Basics",
                "platform": "Coursera",
                "url": "https://www.coursera.org/learn/react-basics",
                "cost_type": "free",
                "description": "Build dynamic user interfaces using React components and hooks.",
                "thumbnail_url": "https://coursera-course-photos.s3.amazonaws.com/8f/5d2cc1f3b911e7a3071cf81a621a51/react-basics.jpg",
                "related_skill_slugs": ["react", "javascript"],
            },
            {
                "title": "Python for Everybody",
                "platform": "Coursera",
                "url": "https://www.coursera.org/specializations/python",
                "cost_type": "free",
                "description": "Foundational Python programming series covering data structures and web access.",
                "thumbnail_url": "https://coursera-course-photos.s3.amazonaws.com/6e/eeb1a27c3211e7a3631c94f6ac0251/python-for-everybody.jpg",
                "related_skill_slugs": ["python"],
            },
            {
                "title": "Data Analysis with Python",
                "platform": "freeCodeCamp (YouTube)",
                "url": "https://www.youtube.com/watch?v=r-uOLxNrNk8",
                "cost_type": "free",
                "description": "Comprehensive Python data analysis using pandas, NumPy, and visualization libraries.",
                "thumbnail_url": "https://i.ytimg.com/vi/r-uOLxNrNk8/maxresdefault.jpg",
                "related_skill_slugs": ["python", "data-analysis"],
            },
            {
                "title": "SQL for Data Science",
                "platform": "Coursera",
                "url": "https://www.coursera.org/learn/sql-for-data-science",
                "cost_type": "free",
                "description": "Learn to write SQL queries and analyze data for business insights.",
                "thumbnail_url": "https://coursera-course-photos.s3.amazonaws.com/2f/027d61014711e7a2a4e8f8a317b51/sql-data-science.jpg",
                "related_skill_slugs": ["sql", "data-analysis"],
            },
            {
                "title": "Microsoft Excel - Excel from Beginner to Advanced",
                "platform": "Udemy",
                "url": "https://www.udemy.com/course/microsoft-excel-2013-from-beginner-to-advanced-and-beyond/",
                "cost_type": "paid",
                "description": "Become an Excel power user with formulas, pivot tables, and automation.",
                "thumbnail_url": "https://img-c.udemycdn.com/course/480x270/793796_0e89.jpg",
                "related_skill_slugs": ["microsoft-excel", "data-analysis"],
            },
            {
                "title": "Complete Communication Skills Masterclass",
                "platform": "Udemy",
                "url": "https://www.udemy.com/course/complete-communication-skills-master-class-for-life/",
                "cost_type": "paid",
                "description": "Build persuasive speaking, listening, and interpersonal communication skills.",
                "thumbnail_url": "https://img-c.udemycdn.com/course/480x270/2462084_4993_3.jpg",
                "related_skill_slugs": ["communication"],
            },
            {
                "title": "Graphic Design Fundamentals",
                "platform": "Skillshare (YouTube Preview)",
                "url": "https://www.youtube.com/watch?v=KXwYUd1J6oY",
                "cost_type": "free",
                "description": "Learn color theory, typography, and layout for compelling designs.",
                "thumbnail_url": "https://i.ytimg.com/vi/KXwYUd1J6oY/maxresdefault.jpg",
                "related_skill_slugs": ["graphic-design"],
            },
            {
                "title": "UI/UX Design Specialization",
                "platform": "Coursera",
                "url": "https://www.coursera.org/specializations/ui-ux-design",
                "cost_type": "paid",
                "description": "Human-centered design process including research, prototyping, and testing.",
                "thumbnail_url": "https://coursera-course-photos.s3.amazonaws.com/a5/f64f0e6b0f11e7a6324c3f112cb5b1/ui-ux-specialization.jpg",
                "related_skill_slugs": ["ui-ux-design", "graphic-design"],
            },
            {
                "title": "Project Management Principles and Practices",
                "platform": "Coursera",
                "url": "https://www.coursera.org/specializations/project-management",
                "cost_type": "free",
                "description": "Master project planning, scheduling, and stakeholder management techniques.",
                "thumbnail_url": "https://coursera-course-photos.s3.amazonaws.com/21/a41ac0a71611e7a0d10e979ec3e9e/project-management.jpg",
                "related_skill_slugs": ["project-management"],
            },
            {
                "title": "Digital Marketing Strategy",
                "platform": "YouTube",
                "url": "https://www.youtube.com/watch?v=V6i4uD3lHnY",
                "cost_type": "free",
                "description": "Plan and execute data-driven digital marketing campaigns.",
                "thumbnail_url": "https://i.ytimg.com/vi/V6i4uD3lHnY/maxresdefault.jpg",
                "related_skill_slugs": ["digital-marketing", "communication"],
            },
            {
                "title": "Advanced JavaScript Concepts",
                "platform": "FrontEnd Masters (YouTube Preview)",
                "url": "https://www.youtube.com/watch?v=PoRJizFvM7s",
                "cost_type": "free",
                "description": "Deep dive into closures, prototypal inheritance, and asynchronous patterns.",
                "thumbnail_url": "https://i.ytimg.com/vi/PoRJizFvM7s/maxresdefault.jpg",
                "related_skill_slugs": ["javascript"],
            },
            {
                "title": "Responsive Web Design Course",
                "platform": "freeCodeCamp (YouTube)",
                "url": "https://www.youtube.com/watch?v=srvUrASNj0s",
                "cost_type": "free",
                "description": "Build responsive layouts with modern CSS and semantic HTML.",
                "thumbnail_url": "https://i.ytimg.com/vi/srvUrASNj0s/maxresdefault.jpg",
                "related_skill_slugs": ["html-css", "graphic-design"],
            },
            {
                "title": "React Hooks and Context",
                "platform": "Udemy",
                "url": "https://www.udemy.com/course/react-hooks-and-context/",
                "cost_type": "paid",
                "description": "Manage state in modern React applications with hooks and context API.",
                "thumbnail_url": "https://img-c.udemycdn.com/course/480x270/2424752_d9ef.jpg",
                "related_skill_slugs": ["react", "javascript"],
            },
            {
                "title": "Intro to Data Visualization with Tableau",
                "platform": "Coursera",
                "url": "https://www.coursera.org/learn/analytics-tableau",
                "cost_type": "paid",
                "description": "Visualize datasets effectively using Tableau dashboards.",
                "thumbnail_url": "https://coursera-course-photos.s3.amazonaws.com/bd/ced73f856211e7a73b7495a7d5d0/tableau.jpg",
                "related_skill_slugs": ["data-analysis", "microsoft-excel"],
            },
            {
                "title": "Effective Business Communication",
                "platform": "Coursera",
                "url": "https://www.coursera.org/learn/effective-business-communication",
                "cost_type": "free",
                "description": "Improve workplace communication through structured messaging and storytelling.",
                "thumbnail_url": "https://coursera-course-photos.s3.amazonaws.com/4c/1b6a8b74df11e7a57c902a6188d141/effective-communication.jpg",
                "related_skill_slugs": ["communication", "project-management"],
            },
            {
                "title": "Foundations of Digital Marketing Analytics",
                "platform": "Coursera",
                "url": "https://www.coursera.org/learn/foundations-of-digital-marketing-analytics",
                "cost_type": "paid",
                "description": "Analyze campaign performance and customer journeys using data.",
                "thumbnail_url": "https://coursera-course-photos.s3.amazonaws.com/9f/c66af0ed9111e7a3e1c5ddf3e4f41f/digital-marketing-analytics.jpg",
                "related_skill_slugs": ["digital-marketing", "data-analysis"],
            },
            {
                "title": "Python Automation with Selenium",
                "platform": "YouTube",
                "url": "https://www.youtube.com/watch?v=3jZ5vnv-LZc",
                "cost_type": "free",
                "description": "Automate workflows and testing using Python and Selenium WebDriver.",
                "thumbnail_url": "https://i.ytimg.com/vi/3jZ5vnv-LZc/maxresdefault.jpg",
                "related_skill_slugs": ["python", "project-management"],
            },
            {
                "title": "Agile Project Management",
                "platform": "Udemy",
                "url": "https://www.udemy.com/course/agile-project-management/",
                "cost_type": "paid",
                "description": "Deliver projects iteratively with Scrum, Kanban, and agile best practices.",
                "thumbnail_url": "https://img-c.udemycdn.com/course/480x270/3010128_f71f.jpg",
                "related_skill_slugs": ["project-management", "communication"],
            },
            {
                "title": "SQL Crash Course",
                "platform": "YouTube",
                "url": "https://www.youtube.com/watch?v=HXV3zeQKqGY",
                "cost_type": "free",
                "description": "Hands-on SQL tutorial covering selects, joins, aggregations, and subqueries.",
                "thumbnail_url": "https://i.ytimg.com/vi/HXV3zeQKqGY/maxresdefault.jpg",
                "related_skill_slugs": ["sql"],
            },
            {
                "title": "Build Responsive Websites with Bootstrap",
                "platform": "Udemy",
                "url": "https://www.udemy.com/course/bootstrap-4-from-scratch-with-5-projects/",
                "cost_type": "paid",
                "description": "Create responsive websites quickly using Bootstrap components and utilities.",
                "thumbnail_url": "https://img-c.udemycdn.com/course/480x270/1561458_bfdd.jpg",
                "related_skill_slugs": ["html-css", "javascript"],
            },
        ]

        for course_data in courses:
            _create_course(session, course_data.copy(), skills_lookup)

        session.commit()
        print(f"✓ Seeded default courses ({len(courses)} entries).")

    except Exception as exc:
        session.rollback()
        print(f"Error seeding courses: {exc}")
        raise
    finally:
        session.close()


def downgrade(database_url: str | None = None):
    """Remove the seeded courses from the database."""
    load_dotenv()

    database_url = database_url or os.getenv(
        "DATABASE_URL", "postgresql://myuser:mypassword@localhost:5432/nutrimap"
    )
    session = _build_session(database_url)

    try:
        titles = [
            "JavaScript Essentials for Beginners",
            "Modern HTML & CSS From the Beginning",
            "React Basics",
            "Python for Everybody",
            "Data Analysis with Python",
            "SQL for Data Science",
            "Microsoft Excel - Excel from Beginner to Advanced",
            "Complete Communication Skills Masterclass",
            "Graphic Design Fundamentals",
            "UI/UX Design Specialization",
            "Project Management Principles and Practices",
            "Digital Marketing Strategy",
            "Advanced JavaScript Concepts",
            "Responsive Web Design Course",
            "React Hooks and Context",
            "Intro to Data Visualization with Tableau",
            "Effective Business Communication",
            "Foundations of Digital Marketing Analytics",
            "Python Automation with Selenium",
            "Agile Project Management",
            "SQL Crash Course",
            "Build Responsive Websites with Bootstrap",
        ]

        deleted = (
            session.query(Course)
            .filter(Course.title.in_(titles))
            .delete(synchronize_session=False)
        )
        session.commit()
        print(f"✓ Removed {deleted} courses.")

    except Exception as exc:
        session.rollback()
        print(f"Error removing courses: {exc}")
        raise
    finally:
        session.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed default learning courses.")
    parser.add_argument(
        "--database-url",
        dest="database_url",
        help="Override the DATABASE_URL connection string.",
    )
    parser.add_argument(
        "--rollback",
        action="store_true",
        help="Remove the seeded courses instead of inserting them.",
    )
    args = parser.parse_args()

    action = "Removing" if args.rollback else "Seeding"
    print(f"{action} default courses using {args.database_url or 'DATABASE_URL'}")

    if args.rollback:
        downgrade(args.database_url)
        print("✓ Courses removed.")
    else:
        upgrade(args.database_url)
        print("✓ Course seeding completed successfully!")


