/**
 * User Dashboard Page
 * Main page for authenticated users
 */

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Dashboard.css";
import Navbar from "../components/Navbar";
import api from "../services/api";
import profileAPI from "../services/profileService";
import "./Jobs.css"; // reuse compact job card styles

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const carouselRef = useRef(null);
  const coursesRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [isPausedCourses, setIsPausedCourses] = useState(false);

  const scrollCarousel = useCallback((direction = 1) => {
    const el = carouselRef.current;
    if (!el) return;

    const card = el.querySelector(".recommended-job-card");
    const cardWidth = card
      ? card.getBoundingClientRect().width
      : el.clientWidth;
    const gap = 16;

    el.scrollBy({
      left: direction * (cardWidth + gap),
      behavior: "smooth",
    });
  }, []);

  const scrollCourses = useCallback((direction = 1) => {
    const el = coursesRef.current;
    if (!el) return;

    const card = el.querySelector(".recommended-course-card");
    const cardWidth = card
      ? card.getBoundingClientRect().width
      : el.clientWidth;
    const gap = 16;

    el.scrollBy({
      left: direction * (cardWidth + gap),
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    // Fetch profile skills and jobs, compute deterministic matches
    const loadRecommendations = async () => {
      try {
        const profile = await profileAPI.getProfile();
        const userSkillIds = (profile?.skills || []).map((s) => String(s.id));
        const userSet = new Set(userSkillIds);

        const resp = await api.get("/jobs");
        const jobs = resp?.data || [];

        const matched = jobs
          .map((job) => {
            let req = [];
            try {
              req = job.required_skills ? JSON.parse(job.required_skills) : [];
            } catch (e) {
              // malformed JSON, ignore
              req = [];
            }
            const reqIds = (req || []).map((r) => String(r));
            const matchedIds = reqIds.filter((id) => userSet.has(id));
            const matchedCount = matchedIds.length;
            const requiredCount = reqIds.length;
            if (matchedCount === 0) return null; // exclude no-overlap

            return {
              ...job,
              _matched_count: matchedCount,
              _required_count: requiredCount,
              _is_full: requiredCount > 0 && matchedCount === requiredCount,
              _match_label:
                requiredCount > 0 && matchedCount === requiredCount
                  ? "Full match"
                  : `${matchedCount} match${matchedCount > 1 ? "es" : ""}`,
            };
          })
          .filter(Boolean);

        const full = matched.filter((j) => j._is_full);
        const partial = matched
          .filter((j) => !j._is_full)
          .sort((a, b) => b._matched_count - a._matched_count);

        setRecommendedJobs([...full, ...partial]);
      } catch (err) {
        // silently fail; keep recommendedJobs empty
        console.error("Failed to load job recommendations", err);
      }
    };

    loadRecommendations();
  }, []);

  // Fetch recommended courses and compute matches similar to jobs
  useEffect(() => {
    const loadCourseRecommendations = async () => {
      try {
        const profile = await profileAPI.getProfile();
        const userSkillIds = (profile?.skills || []).map((s) => String(s.id));
        const userSet = new Set(userSkillIds);

        const resp = await api.get("/courses");
        const courses = resp?.data || [];

        const matched = courses
          .map((course) => {
            let req = [];
            try {
              // Courses use 'related_skills' not 'required_skills'
              req = course.related_skills
                ? JSON.parse(course.related_skills)
                : [];
            } catch (e) {
              req = [];
            }
            const reqIds = (req || []).map((r) => String(r));
            const matchedIds = reqIds.filter((id) => userSet.has(id));
            const matchedCount = matchedIds.length;
            const requiredCount = reqIds.length;
            // Show courses even if no match, but prioritize matched ones
            if (matchedCount === 0 && requiredCount > 0) return null;

            return {
              ...course,
              _matched_count: matchedCount,
              _required_count: requiredCount,
              _is_full: requiredCount > 0 && matchedCount === requiredCount,
              _match_label:
                requiredCount === 0
                  ? "General"
                  : requiredCount > 0 && matchedCount === requiredCount
                  ? "Full match"
                  : `${matchedCount} match${matchedCount > 1 ? "es" : ""}`,
            };
          })
          .filter(Boolean);

        const full = matched.filter((c) => c._is_full);
        const partial = matched
          .filter((c) => !c._is_full)
          .sort((a, b) => {
            // Sort by match count descending, then by required count
            if (b._matched_count !== a._matched_count) {
              return b._matched_count - a._matched_count;
            }
            return b._required_count - a._required_count;
          });

        setRecommendedCourses([...full, ...partial]);
      } catch (err) {
        console.error("Failed to load course recommendations", err);
        // Set empty array on error so UI shows "No matched courses"
        setRecommendedCourses([]);
      }
    };

    loadCourseRecommendations();
  }, []);

  // auto-scroll carousel: advance by container width every 4s
  useEffect(() => {
    const el = carouselRef.current;
    if (!el || recommendedJobs.length <= 3) return; // nothing to scroll

    const interval = setInterval(() => {
      if (isPaused) return;
      const maxScrollLeft = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScrollLeft - 4) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollCarousel(1);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [recommendedJobs, isPaused, scrollCarousel]);

  // auto-scroll courses carousel: advance by container width every 4s
  useEffect(() => {
    const el = coursesRef.current;
    if (!el || recommendedCourses.length <= 3) return;

    const interval = setInterval(() => {
      if (isPausedCourses) return;
      const maxScrollLeft = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScrollLeft - 4) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollCourses(1);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [recommendedCourses, isPausedCourses, scrollCourses]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#0f172a",
          color: "#f8fafc",
        }}
      >
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Navbar />

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-hero">
          <div className="dashboard-welcome">
            <h2>Welcome, {user.full_name || user.email}! 👋</h2>
            <p>Ready to continue your learning journey?</p>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* User Info */}
          <section className="dashboard-section">
            <h3>Account Information</h3>
            <div className="dashboard-user-info">
              <div className="info-item">
                <label>Email:</label>
                <span>{user.email}</span>
              </div>
              <div className="info-item">
                <label>Username:</label>
                <span>{user.username}</span>
              </div>
              <div className="info-item">
                <label>Role:</label>
                <span className="role-badge">{user.role}</span>
              </div>
            </div>
          </section>

          {/* Recommended Jobs (based on user's skills) */}
          <section className="dashboard-section dashboard-section--centered">
            <h3>
              <span>Recommended Jobs</span>
              {recommendedJobs.length > 0 && (
                <div
                  className="jobs-scroll-controls"
                  role="group"
                  aria-label="Recommended jobs navigation"
                >
                  <button
                    type="button"
                    className="jobs-scroll-btn"
                    onClick={() => scrollCarousel(-1)}
                    aria-label="Scroll recommended jobs left"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    className="jobs-scroll-btn"
                    onClick={() => scrollCarousel(1)}
                    aria-label="Scroll recommended jobs right"
                  >
                    →
                  </button>
                </div>
              )}
            </h3>
            <div className="recommended-jobs-grid">
              {recommendedJobs.length === 0 && (
                <div className="coming-soon-card">
                  <div className="coming-soon-icon">🎯</div>
                  <h4>No matched jobs</h4>
                  <p>We couldn't find jobs matching your skills yet.</p>
                </div>
              )}

              <div
                className="recommended-jobs-list"
                ref={carouselRef}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                {recommendedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="job-card-compact recommended-job-card"
                    onClick={() => navigate(`/jobs`)}
                    role="button"
                    tabIndex={0}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="job-card-header">
                      {job.company_logo && (
                        <img
                          src={job.company_logo}
                          alt={job.company_name}
                          className="company-logo-compact"
                        />
                      )}
                    </div>

                    <div className="job-card-content">
                      <h3 className="job-title-compact">{job.title}</h3>
                      <p className="company-name-compact">{job.company_name}</p>

                      <div className="job-card-meta">
                        <span className="meta-item">{job.location}</span>
                        <span className="meta-item">{job.job_type}</span>
                      </div>

                      <div className="job-card-footer">
                        <span className="job-posted">{job._match_label}</span>
                        <span className="job-views-compact">
                          🔧 {job._matched_count}/{job._required_count}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Recommended Courses (based on user's skills) */}
          <section className="dashboard-section dashboard-section--centered">
            <h3>
              <span>Recommended Courses</span>
              {recommendedCourses.length > 0 && (
                <div
                  className="jobs-scroll-controls"
                  role="group"
                  aria-label="Recommended courses navigation"
                >
                  <button
                    type="button"
                    className="jobs-scroll-btn"
                    onClick={() => scrollCourses(-1)}
                    aria-label="Scroll recommended courses left"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    className="jobs-scroll-btn"
                    onClick={() => scrollCourses(1)}
                    aria-label="Scroll recommended courses right"
                  >
                    →
                  </button>
                </div>
              )}
            </h3>

            <div className="recommended-courses-grid">
              {recommendedCourses.length === 0 && (
                <div className="coming-soon-card">
                  <div className="coming-soon-icon">🎓</div>
                  <h4>No matched courses</h4>
                  <p>We couldn't find courses matching your skills yet.</p>
                </div>
              )}

              <div
                className="recommended-courses-list"
                ref={coursesRef}
                onMouseEnter={() => setIsPausedCourses(true)}
                onMouseLeave={() => setIsPausedCourses(false)}
              >
                {recommendedCourses.map((course) => (
                  <div
                    key={course.id}
                    className="job-card-compact recommended-course-card course-card-compact"
                    onClick={() => window.open(course.url, "_blank")}
                    role="button"
                    tabIndex={0}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="job-card-header">
                      {course.thumbnail_url && (
                        <img
                          src={course.thumbnail_url}
                          alt={course.platform || course.title}
                          className="company-logo-compact"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      )}
                    </div>

                    <div className="job-card-content">
                      <h3 className="job-title-compact">{course.title}</h3>
                      <p className="company-name-compact">
                        {course.platform || ""}
                      </p>

                      <div className="job-card-meta">
                        <span className="meta-item">
                          {course.cost_type === "free" ? "🆓 Free" : "💰 Paid"}
                        </span>
                        <span className="meta-item">
                          {course.platform || ""}
                        </span>
                      </div>

                      <div className="job-card-footer">
                        <span className="job-posted">
                          {course._match_label}
                        </span>
                        <span className="job-views-compact">
                          🎯 {course._matched_count}/
                          {course._required_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>&copy; 2025 SkillSync. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Dashboard;
