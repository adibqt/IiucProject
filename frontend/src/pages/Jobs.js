import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Jobs.css";
import Navbar from "../components/Navbar";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterJobType, setFilterJobType] = useState("all");
  const [filterExperience, setFilterExperience] = useState("all");
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://localhost:8000/api";

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      // Redirect to login if not authenticated
      navigate("/login", {
        state: { from: "/jobs", message: "Please login to view jobs" },
      });
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const jobsResponse = await axios.get(`${API_BASE_URL}/jobs`, config);
      console.log("Jobs loaded:", jobsResponse.data);
      setJobs(jobsResponse.data);

      // Try to load skills, but don't fail if unauthorized
      try {
        const skillsResponse = await axios.get(
          `${API_BASE_URL}/skills`,
          config
        );
        console.log("Skills loaded:", skillsResponse.data);
        setSkills(skillsResponse.data);
      } catch (skillError) {
        console.log("Skills not available (not critical):", skillError.message);
        // Skills are optional, continue without them
      }
    } catch (error) {
      console.error("Error loading jobs:", error);
      console.error("Error details:", error.response || error.message);

      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        localStorage.removeItem("userToken");
        localStorage.removeItem("userData");
        navigate("/login", {
          state: {
            from: "/jobs",
            message: "Your session has expired. Please login again.",
          },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJobClick = async (job) => {
    setSelectedJob(job);
    // Increment view count
    try {
      const token = localStorage.getItem("userToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.get(`${API_BASE_URL}/jobs/${job.id}`, config);
      // Update local state
      setJobs(
        jobs.map((j) =>
          j.id === job.id ? { ...j, views_count: j.views_count + 1 } : j
        )
      );
    } catch (error) {
      console.error("Error updating view count:", error);
    }
  };

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      searchTerm === "" ||
      (job.title &&
        job.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job.company_name &&
        job.company_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job.location &&
        job.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job.description &&
        job.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesJobType =
      filterJobType === "all" || job.job_type === filterJobType;
    const matchesExperience =
      filterExperience === "all" || job.experience_level === filterExperience;

    return matchesSearch && matchesJobType && matchesExperience;
  });

  const getJobTypeLabel = (type) => {
    const labels = {
      "full-time": "Full-time",
      "part-time": "Part-time",
      contract: "Contract",
      internship: "Internship",
      freelance: "Freelance",
    };
    return labels[type] || type;
  };

  const getExperienceLabel = (level) => {
    const labels = {
      entry: "Entry Level",
      mid: "Mid Level",
      senior: "Senior Level",
    };
    return labels[level] || level;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  // Carousel navigation
  const itemsPerSlide = 3;
  const totalSlides = Math.ceil(filteredJobs.length / itemsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto-play carousel
  useEffect(() => {
    if (filteredJobs.length > itemsPerSlide) {
      const interval = setInterval(() => {
        nextSlide();
      }, 5000); // Change slide every 5 seconds
      return () => clearInterval(interval);
    }
  }, [filteredJobs.length, currentSlide]);

  // Reset carousel when filters change
  useEffect(() => {
    setCurrentSlide(0);
  }, [searchTerm, filterJobType, filterExperience]);

  return (
    <div className="jobs-page">
      {/* Animated Background */}
      <div className="jobs-bg-grid" />
      <div className="jobs-bg-orbs">
        <div className="jobs-orb jobs-orb-1" />
        <div className="jobs-orb jobs-orb-2" />
        <div className="jobs-orb jobs-orb-3" />
      </div>

      <Navbar />

      {/* Hero Section */}
      <div className="jobs-hero">
        <div className="jobs-hero-content">
          <h1>Discover Your Next Opportunity</h1>
          <p>Explore career opportunities from leading companies</p>

          {/* Search Bar */}
          <div className="jobs-search-bar">
            <svg className="search-icon-hero" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by job title, company, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="jobs-search-input"
            />
          </div>

          {/* Quick Filters */}
          <div className="jobs-quick-filters">
            <select
              value={filterJobType}
              onChange={(e) => setFilterJobType(e.target.value)}
              className="jobs-filter-select"
            >
              <option value="all">All Job Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="freelance">Freelance</option>
            </select>

            <select
              value={filterExperience}
              onChange={(e) => setFilterExperience(e.target.value)}
              className="jobs-filter-select"
            >
              <option value="all">All Experience Levels</option>
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
            </select>

            {(searchTerm ||
              filterJobType !== "all" ||
              filterExperience !== "all") && (
              <button
                className="jobs-clear-btn"
                onClick={() => {
                  setSearchTerm("");
                  setFilterJobType("all");
                  setFilterExperience("all");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Jobs Content */}
      <div className="jobs-content">
        <div className="jobs-container">
          {/* Jobs Header */}
          <div className="jobs-header-section">
            <h2>
              {filteredJobs.length} Job{filteredJobs.length !== 1 ? "s" : ""}{" "}
              Available
            </h2>
            {filteredJobs.length !== jobs.length && (
              <p className="filter-info">
                Filtered from {jobs.length} total jobs
              </p>
            )}
          </div>

          {loading ? (
            <div className="jobs-loading">
              <div className="spinner-large"></div>
              <p>Loading opportunities...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="jobs-empty">
              <div className="empty-icon-large">🔍</div>
              <h3>No jobs found</h3>
              <p>Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="jobs-carousel-container">
              {filteredJobs.length > itemsPerSlide && (
                <button
                  className="carousel-btn carousel-btn-prev"
                  onClick={prevSlide}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M15 18L9 12L15 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}

              <div className="jobs-carousel">
                <div
                  className="jobs-carousel-track"
                  style={{
                    transform: `translateX(-${currentSlide * 100}%)`,
                  }}
                >
                  {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                    <div key={slideIndex} className="jobs-carousel-slide">
                      {filteredJobs
                        .slice(
                          slideIndex * itemsPerSlide,
                          (slideIndex + 1) * itemsPerSlide
                        )
                        .map((job) => (
                          <div
                            key={job.id}
                            className="job-card-compact"
                            onClick={() => handleJobClick(job)}
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
                              <p className="company-name-compact">
                                {job.company_name}
                              </p>

                              <div className="job-card-meta">
                                <span className="meta-item">
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                  >
                                    <path
                                      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      fill="none"
                                    />
                                  </svg>
                                  {job.location}
                                </span>
                                <span className="meta-item">
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                  >
                                    <path
                                      d="M20 6H16V4C16 2.89 15.11 2 14 2H10C8.89 2 8 2.89 8 4V6H4C2.89 6 2.01 6.89 2.01 8L2 19C2 20.11 2.89 21 4 21H20C21.11 21 22 20.11 22 19V8C22 6.89 21.11 6 20 6ZM14 6H10V4H14V6Z"
                                      fill="currentColor"
                                    />
                                  </svg>
                                  {getJobTypeLabel(job.job_type)}
                                </span>
                              </div>

                              {job.salary_range && (
                                <div className="job-salary-compact">
                                  💰 {job.salary_range}
                                </div>
                              )}

                              <div className="job-card-footer">
                                <span className="job-posted">
                                  {formatDate(job.created_at)}
                                </span>
                                <span className="job-views-compact">
                                  👁️ {job.views_count}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              </div>

              {filteredJobs.length > itemsPerSlide && (
                <button
                  className="carousel-btn carousel-btn-next"
                  onClick={nextSlide}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 18L15 12L9 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}

              {filteredJobs.length > itemsPerSlide && totalSlides > 1 && (
                <div className="carousel-indicators">
                  {Array.from({ length: totalSlides }).map((_, index) => (
                    <button
                      key={index}
                      className={`carousel-indicator ${
                        index === currentSlide ? "active" : ""
                      }`}
                      onClick={() => goToSlide(index)}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Job Details Modal - Professional Redesign */}
      {selectedJob && (
        <div className="job-modal-overlay" onClick={() => setSelectedJob(null)}>
          <div className="job-modal" onClick={(e) => e.stopPropagation()}>
            {/* Hero Header with Company Branding */}
            <div className="modal-hero">
              <button
                className="modal-close-btn"
                onClick={() => setSelectedJob(null)}
              >
                ×
              </button>
              <div className="modal-hero-content">
                {selectedJob.company_logo && (
                  <div className="company-avatar">
                    <img
                      src={selectedJob.company_logo}
                      alt={selectedJob.company_name}
                    />
                  </div>
                )}
                <div className="hero-text">
                  <h1 className="job-title-modal">{selectedJob.title}</h1>
                  <p className="company-name-modal">
                    {selectedJob.company_name}
                  </p>
                  <div className="hero-meta">
                    <span className="hero-meta-item">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>
                      {selectedJob.location}
                    </span>
                    <span className="hero-meta-item">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M20 6H16V4C16 2.89 15.11 2 14 2H10C8.89 2 8 2.89 8 4V6H4C2.89 6 2.01 6.89 2.01 8L2 19C2 20.11 2.89 21 4 21H20C21.11 21 22 20.11 22 19V8C22 6.89 21.11 6 20 6ZM14 6H10V4H14V6Z" />
                      </svg>
                      {getJobTypeLabel(selectedJob.job_type)}
                    </span>
                    <span className="hero-meta-item">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                      </svg>
                      Posted {formatDate(selectedJob.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="modal-stats-bar">
              <div className="stat-pill">
                <div className="stat-info">
                  <span className="stat-label">Location</span>
                  <span className="stat-value">{selectedJob.location}</span>
                </div>
              </div>
              <div className="stat-pill">
                <div className="stat-info">
                  <span className="stat-label">Job Type</span>
                  <span className="stat-value">
                    {getJobTypeLabel(selectedJob.job_type)}
                  </span>
                </div>
              </div>
              <div className="stat-pill">
                <div className="stat-info">
                  <span className="stat-label">Experience</span>
                  <span className="stat-value">
                    {getExperienceLabel(selectedJob.experience_level)}
                  </span>
                </div>
              </div>
              {selectedJob.salary_range && (
                <div className="stat-pill highlighted">
                  <div className="stat-info">
                    <span className="stat-label">Salary</span>
                    <span className="stat-value">
                      {selectedJob.salary_range}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Scrollable Content Area */}
            <div className="modal-body">
              {/* Job Description */}
              <section className="modal-section">
                <div className="section-header">
                  <span className="section-icon">📋</span>
                  <h2>About the Role</h2>
                </div>
                <div className="section-content">
                  <p className="description-text">{selectedJob.description}</p>
                </div>
              </section>

              {/* Requirements */}
              {selectedJob.requirements && (
                <section className="modal-section">
                  <div className="section-header">
                    <span className="section-icon">✅</span>
                    <h2>Requirements</h2>
                  </div>
                  <div className="section-content">
                    <ul className="requirement-list">
                      {selectedJob.requirements
                        .split("\n")
                        .filter((line) => line.trim())
                        .map((line, idx) => (
                          <li key={idx}>{line.trim()}</li>
                        ))}
                    </ul>
                  </div>
                </section>
              )}

              {/* Responsibilities */}
              {selectedJob.responsibilities && (
                <section className="modal-section">
                  <div className="section-header">
                    <span className="section-icon">🎯</span>
                    <h2>Responsibilities</h2>
                  </div>
                  <div className="section-content">
                    <ul className="requirement-list">
                      {selectedJob.responsibilities
                        .split("\n")
                        .filter((line) => line.trim())
                        .map((line, idx) => (
                          <li key={idx}>{line.trim()}</li>
                        ))}
                    </ul>
                  </div>
                </section>
              )}

              {/* Skills */}
              {selectedJob.required_skills &&
                JSON.parse(selectedJob.required_skills).length > 0 && (
                  <section className="modal-section">
                    <div className="section-header">
                      <span className="section-icon">🔧</span>
                      <h2>Required Skills</h2>
                    </div>
                    <div className="section-content">
                      <div className="skills-grid">
                        {JSON.parse(selectedJob.required_skills).map(
                          (skillId) => {
                            const skill = skills.find((s) => s.id === skillId);
                            return skill ? (
                              <span key={skillId} className="skill-chip">
                                {skill.name}
                              </span>
                            ) : null;
                          }
                        )}
                      </div>
                    </div>
                  </section>
                )}

              {/* Application Info */}
              {(selectedJob.application_url ||
                selectedJob.application_email) && (
                <section className="modal-section application-section">
                  <div className="section-header">
                    <span className="section-icon">📨</span>
                    <h2>How to Apply</h2>
                  </div>
                  <div className="section-content">
                    {selectedJob.application_deadline && (
                      <div className="deadline-banner">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                        </svg>
                        <div>
                          <strong>Application Deadline</strong>
                          <p>
                            {new Date(
                              selectedJob.application_deadline
                            ).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedJob.application_url && (
                      <p className="apply-instruction">
                        <strong>Apply Online:</strong> Visit the company's
                        application portal to submit your application.
                      </p>
                    )}

                    {selectedJob.application_email && (
                      <p className="apply-instruction">
                        <strong>Email:</strong> Send your resume to{" "}
                        <a href={`mailto:${selectedJob.application_email}`}>
                          {selectedJob.application_email}
                        </a>
                      </p>
                    )}
                  </div>
                </section>
              )}
            </div>

            {/* Sticky Footer with Actions */}
            <div className="modal-footer">
              <button className="btn-save" onClick={(e) => e.stopPropagation()}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                Save Job
              </button>

              {selectedJob.application_url && (
                <a
                  href={selectedJob.application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-apply-primary"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                  </svg>
                  Apply Now
                </a>
              )}

              {!selectedJob.application_url &&
                selectedJob.application_email && (
                  <a
                    href={`mailto:${selectedJob.application_email}`}
                    className="btn-apply-primary"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                    Email Application
                  </a>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;
