/**
 * Job Recommendation Page - AI-Powered Job Matching
 * Shows personalized job recommendations with match scores and skill gap analysis
 */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import "./JobRecommendation.css";

const JobRecommendation = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [filterLevel, setFilterLevel] = useState("all");

  useEffect(() => {
    loadRecommendations();
    loadStats();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/job-recommendations");
      setRecommendations(response.data);
    } catch (err) {
      console.error("Error loading recommendations:", err);
      setError(
        err.response?.data?.detail ||
          "Failed to load job recommendations. Please make sure you have skills added to your profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get("/job-recommendations/stats");
      setStats(response.data);
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  const getMatchColor = (score) => {
    if (score >= 80) return "#10b981"; // green
    if (score >= 60) return "#3b82f6"; // blue
    if (score >= 40) return "#f59e0b"; // orange
    return "#ef4444"; // red
  };

  const getMatchBadgeClass = (level) => {
    const classes = {
      excellent: "match-badge-excellent",
      good: "match-badge-good",
      fair: "match-badge-fair",
      poor: "match-badge-poor",
    };
    return classes[level] || "match-badge-fair";
  };

  const getImportanceBadgeClass = (importance) => {
    const classes = {
      critical: "importance-critical",
      important: "importance-important",
      "nice-to-have": "importance-nice",
    };
    return classes[importance] || "importance-important";
  };

  const filteredRecommendations = recommendations.filter((rec) => {
    if (filterLevel === "all") return true;
    return rec.match_level === filterLevel;
  });

  if (loading) {
    return (
      <div className="job-rec-page">
        <Navbar />
        <div className="job-rec-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Analyzing jobs and generating recommendations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="job-rec-page">
      <Navbar />

      <div className="job-rec-container">
        {/* Header Section */}
        <div className="job-rec-header">
          <button className="back-button" onClick={() => navigate("/ai-services")}>
            ← Back to AI Services
          </button>

          <div className="header-content">
            <div className="header-icon">💼</div>
            <h1 className="page-title">AI Job Recommendations</h1>
            <p className="page-subtitle">
              Personalized job matches based on your skills and career interests
            </p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.total_jobs}</div>
                  <div className="stat-label">Total Jobs</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.excellent_matches}</div>
                  <div className="stat-label">Excellent Matches</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.good_matches}</div>
                  <div className="stat-label">Good Matches</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.average_match_score}%</div>
                  <div className="stat-label">Avg Match Score</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            {error}
            <button
              className="error-action"
              onClick={() => navigate("/profile")}
            >
              Go to Profile
            </button>
          </div>
        )}

        {/* Filter Buttons */}
        {!error && recommendations.length > 0 && (
          <div className="filter-bar">
            <button
              className={`filter-btn ${filterLevel === "all" ? "active" : ""}`}
              onClick={() => setFilterLevel("all")}
            >
              All ({recommendations.length})
            </button>
            <button
              className={`filter-btn ${
                filterLevel === "excellent" ? "active" : ""
              }`}
              onClick={() => setFilterLevel("excellent")}
            >
              Excellent (
              {recommendations.filter((r) => r.match_level === "excellent").length}
              )
            </button>
            <button
              className={`filter-btn ${filterLevel === "good" ? "active" : ""}`}
              onClick={() => setFilterLevel("good")}
            >
              Good ({recommendations.filter((r) => r.match_level === "good").length})
            </button>
            <button
              className={`filter-btn ${filterLevel === "fair" ? "active" : ""}`}
              onClick={() => setFilterLevel("fair")}
            >
              Fair ({recommendations.filter((r) => r.match_level === "fair").length})
            </button>
          </div>
        )}

        {/* Job Recommendations Grid */}
        {!error && filteredRecommendations.length > 0 && (
          <div className="recommendations-grid">
            {filteredRecommendations.map((rec, index) => (
              <div
                key={index}
                className="job-card"
                onClick={() => setSelectedJob(rec)}
              >
                {/* Match Score Circle */}
                <div
                  className="match-circle"
                  style={{ borderColor: getMatchColor(rec.match_score) }}
                >
                  <div
                    className="match-score"
                    style={{ color: getMatchColor(rec.match_score) }}
                  >
                    {rec.match_score}%
                  </div>
                  <div className="match-text">Match</div>
                </div>

                {/* Job Details */}
                <div className="job-header">
                  <h3 className="job-title">{rec.job.title}</h3>
                  <p className="job-company">{rec.job.company_name}</p>
                  <div className="job-meta">
                    <span className="meta-item">
                      📍 {rec.job.location || "Remote"}
                    </span>
                    <span className="meta-item">
                      💼 {rec.job.experience_level || "Any"}
                    </span>
                    {rec.job.salary_range && (
                      <span className="meta-item">💰 {rec.job.salary_range}</span>
                    )}
                  </div>
                  <span className={`match-badge ${getMatchBadgeClass(rec.match_level)}`}>
                    {rec.match_level.toUpperCase()}
                  </span>
                </div>

                {/* Matching Skills */}
                <div className="skills-section">
                  <h4 className="section-title">✓ Your Matching Skills</h4>
                  <div className="skill-tags">
                    {rec.matching_skills.slice(0, 5).map((skill, idx) => (
                      <span key={idx} className="skill-tag skill-match">
                        {skill}
                      </span>
                    ))}
                    {rec.matching_skills.length > 5 && (
                      <span className="skill-tag skill-more">
                        +{rec.matching_skills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                {rec.missing_skills.length > 0 && (
                  <div className="skills-section">
                    <h4 className="section-title">⚠ Skill Gaps</h4>
                    <div className="skill-tags">
                      {rec.missing_skills.slice(0, 4).map((skill, idx) => (
                        <span key={idx} className="skill-tag skill-missing">
                          {skill}
                        </span>
                      ))}
                      {rec.missing_skills.length > 4 && (
                        <span className="skill-tag skill-more">
                          +{rec.missing_skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="job-quick-stats">
                  <div className="quick-stat">
                    <span className="stat-label">Career Fit</span>
                    <span className="stat-value">{rec.career_alignment}%</span>
                  </div>
                  <div className="quick-stat">
                    <span className="stat-label">Experience</span>
                    <span className="stat-value">
                      {rec.experience_match === "matches expectations"
                        ? "✓"
                        : rec.experience_match === "exceeds"
                        ? "↑"
                        : "↓"}
                    </span>
                  </div>
                </div>

                <button className="view-details-btn">
                  View Full Analysis →
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!error && recommendations.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No Job Recommendations Yet</h3>
            <p>
              Add skills to your profile to get personalized job recommendations
            </p>
            <button
              className="primary-button"
              onClick={() => navigate("/profile")}
            >
              Complete Your Profile
            </button>
          </div>
        )}
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedJob(null)}
            >
              ×
            </button>

            <div className="modal-header">
              <div
                className="modal-match-circle"
                style={{ borderColor: getMatchColor(selectedJob.match_score) }}
              >
                <div
                  className="match-score"
                  style={{ color: getMatchColor(selectedJob.match_score) }}
                >
                  {selectedJob.match_score}%
                </div>
              </div>
              <div>
                <h2 className="modal-title">{selectedJob.job.title}</h2>
                <p className="modal-company">{selectedJob.job.company_name}</p>
              </div>
            </div>

            {/* AI Recommendation */}
            <div className="modal-section">
              <h3 className="modal-section-title">🤖 AI Analysis</h3>
              <p className="recommendation-text">{selectedJob.recommendation}</p>
            </div>

            {/* Strengths */}
            <div className="modal-section">
              <h3 className="modal-section-title">💪 Your Strengths</h3>
              <ul className="strength-list">
                {selectedJob.strengths.map((strength, idx) => (
                  <li key={idx}>
                    <span className="check-icon">✓</span> {strength}
                  </li>
                ))}
              </ul>
            </div>

            {/* Concerns */}
            {selectedJob.concerns.length > 0 && (
              <div className="modal-section">
                <h3 className="modal-section-title">⚠️ Areas to Improve</h3>
                <ul className="concern-list">
                  {selectedJob.concerns.map((concern, idx) => (
                    <li key={idx}>
                      <span className="warning-icon">!</span> {concern}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skill Gap Analysis */}
            {selectedJob.skill_gaps.length > 0 && (
              <div className="modal-section">
                <h3 className="modal-section-title">📊 Skill Gap Analysis</h3>
                <div className="skill-gap-grid">
                  {selectedJob.skill_gaps.map((gap, idx) => (
                    <div key={idx} className="skill-gap-card">
                      <div className="gap-header">
                        <span className="gap-skill">{gap.skill}</span>
                        <span
                          className={`gap-badge ${getImportanceBadgeClass(
                            gap.importance
                          )}`}
                        >
                          {gap.importance}
                        </span>
                      </div>
                      <div className="gap-effort">
                        Learning Effort: <strong>{gap.learning_effort}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Courses */}
            {selectedJob.recommended_courses &&
              selectedJob.recommended_courses.length > 0 && (
                <div className="modal-section">
                  <h3 className="modal-section-title">
                    📚 Recommended Learning Resources
                  </h3>
                  <div className="course-list">
                    {selectedJob.recommended_courses.map((course, idx) => (
                      <div key={idx} className="course-card-small">
                        <div className="course-info">
                          <h4 className="course-title-small">{course.title}</h4>
                          <div className="course-meta-small">
                            <span className="course-platform">
                              {course.platform}
                            </span>
                            <span className="course-level">
                              {course.level || "All Levels"}
                            </span>
                          </div>
                        </div>
                        <a
                          href={course.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="course-link-btn"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Course →
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Job Description */}
            <div className="modal-section">
              <h3 className="modal-section-title">📋 Job Description</h3>
              <p className="job-description">{selectedJob.job.description}</p>
            </div>

            {/* Requirements */}
            {selectedJob.job.requirements && (
              <div className="modal-section">
                <h3 className="modal-section-title">📝 Requirements</h3>
                <p className="job-requirements">{selectedJob.job.requirements}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobRecommendation;
