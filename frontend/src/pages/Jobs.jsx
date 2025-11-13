/**
 * Jobs Page - Professional job listing with advanced filtering
 * Features: Search, category filters, skill matching, job recommendations
 */
import React, { useEffect, useState } from "react";
import jobAPI from "../services/jobService";
import { userAPI } from "../services/api";
import "./Jobs.css";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [skills, setSkills] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Stats
  const [locationOptions, setLocationOptions] = useState([]);
  const [jobTypeOptions] = useState([
    "Full-time",
    "Part-time",
    "Internship",
    "Freelance",
    "Contract",
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobsData, skillsData, userSkillsData] = await Promise.all([
        jobAPI.list(),
        jobAPI.listSkillsPublic(),
        userAPI.getSkills().catch(() => ({ skills: [] })),
      ]);

      setJobs(jobsData || []);
      setFilteredJobs(jobsData || []);
      setSkills(skillsData || []);
      setUserSkills(userSkillsData.skills || []);

      // Extract unique locations
      const locs = [
        ...new Set((jobsData || []).map((j) => j.location).filter(Boolean)),
      ];
      setLocationOptions(locs);
    } catch (err) {
      console.error("Failed to load jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = async (jobId) => {
    setShowModal(true);
    setSelectedJob(null);
    try {
      const res = await jobAPI.get(jobId);
      setSelectedJob(res);
    } catch (err) {
      console.error("Failed to load job details:", err);
      setSelectedJob({ error: true });
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedJob(null);
  };

  // Application form state
  const [applicationMessage, setApplicationMessage] = useState("");
  const [applying, setApplying] = useState(false);
  const [applicationResult, setApplicationResult] = useState(null);

  // Apply filters whenever filter state changes
  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedJobType, selectedLocation, selectedSkill, jobs]);

  const applyFilters = () => {
    let filtered = jobs;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.description.toLowerCase().includes(query) ||
          (job.company && job.company.toLowerCase().includes(query))
      );
    }

    // Job type filter
    if (selectedJobType) {
      filtered = filtered.filter((job) => job.job_type === selectedJobType);
    }

    // Location filter
    if (selectedLocation) {
      filtered = filtered.filter((job) => job.location === selectedLocation);
    }

    // Skill filter
    if (selectedSkill) {
      filtered = filtered.filter((job) => {
        try {
          const reqSkills = job.required_skills
            ? JSON.parse(job.required_skills)
            : [];
          return reqSkills.includes(parseInt(selectedSkill));
        } catch (e) {
          return false;
        }
      });
    }

    setFilteredJobs(filtered);
  };

  const getMatchedSkills = (job) => {
    try {
      const requiredSkillIds = job.required_skills
        ? JSON.parse(job.required_skills)
        : [];
      const userSkillNames = userSkills.map((s) =>
        s.name ? s.name.toLowerCase() : ""
      );

      return skills
        .filter(
          (s) =>
            requiredSkillIds.includes(s.id) &&
            userSkillNames.includes(s.name.toLowerCase())
        )
        .map((s) => s.name);
    } catch (e) {
      return [];
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedJobType("");
    setSelectedLocation("");
    setSelectedSkill("");
  };

  const hasActiveFilters =
    searchQuery || selectedJobType || selectedLocation || selectedSkill;

  return (
    <div className="jobs-page">
      {/* Page Header */}
      <div className="jobs-header">
        <div className="jobs-header-content">
          <h1>Find Your Next Opportunity</h1>
          <p>Discover roles that match your skills and career goals</p>
        </div>
      </div>

      <div className="jobs-wrapper">
        {/* Sidebar Filters */}
        <aside className={`jobs-sidebar ${showFilters ? "open" : ""}`}>
          <div className="sidebar-header">
            <h3>Filters</h3>
            <button
              className="close-filters-btn"
              onClick={() => setShowFilters(false)}
            >
              ✕
            </button>
          </div>

          <div className="filter-section search">
            <label className="filter-label">Search Jobs</label>
            <input
              type="text"
              className="filter-input"
              placeholder="Job title, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-section">
            <label className="filter-label">Job Type</label>
            <select
              className="filter-select"
              value={selectedJobType}
              onChange={(e) => setSelectedJobType(e.target.value)}
            >
              <option value="">All Types</option>
              {jobTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-section">
            <label className="filter-label">Location</label>
            <select
              className="filter-select"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="">All Locations</option>
              {locationOptions.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-section">
            <label className="filter-label">Required Skill</label>
            <select
              className="filter-select"
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
            >
              <option value="">All Skills</option>
              {skills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear All Filters
            </button>
          )}
        </aside>

        {/* Main Content */}
        <main className="jobs-main">
          {/* Toolbar */}
          <div className="jobs-toolbar">
            <div className="jobs-count">
              {loading ? (
                <p>Loading jobs...</p>
              ) : (
                <p>
                  <strong>{filteredJobs.length}</strong>{" "}
                  {filteredJobs.length === 1 ? "job" : "jobs"} found
                </p>
              )}
            </div>
            <button
              className="mobile-filter-btn"
              onClick={() => setShowFilters(true)}
            >
              ⚙ Filters
            </button>
          </div>

          {/* Jobs List */}
          <div className="jobs-list">
            {loading ? (
              <div className="jobs-loading">
                <div className="spinner"></div>
                <p>Loading opportunities...</p>
              </div>
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map((job) => {
                const matchedSkills = getMatchedSkills(job);
                const matchPercentage =
                  job.required_skills &&
                  JSON.parse(job.required_skills).length > 0
                    ? Math.round(
                        (matchedSkills.length /
                          JSON.parse(job.required_skills).length) *
                          100
                      )
                    : 0;

                return (
                  <div
                    key={job.id}
                    className="job-card"
                    onClick={() => openModal(job.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && openModal(job.id)}
                  >
                    <div className="job-card-header">
                      <div className="job-title-section">
                        <h3 className="job-title">{job.title}</h3>
                        <p className="job-company">
                          {job.company || "Unknown"}
                        </p>
                      </div>
                      {matchPercentage > 0 && (
                        <div className="job-match-badge">
                          <span className="match-percentage">
                            {matchPercentage}%
                          </span>
                          <span className="match-label">Match</span>
                        </div>
                      )}
                    </div>

                    <p className="job-description">{job.description}</p>

                    <div className="job-meta">
                      <span className="job-type">{job.job_type}</span>
                      <span className="job-location">📍 {job.location}</span>
                    </div>

                    {matchedSkills.length > 0 && (
                      <div className="job-matched-skills">
                        <span className="matched-label">Matched Skills:</span>
                        <div className="skill-badges">
                          {matchedSkills.slice(0, 3).map((skill) => (
                            <span key={skill} className="skill-badge">
                              {skill}
                            </span>
                          ))}
                          {matchedSkills.length > 3 && (
                            <span className="skill-badge more">
                              +{matchedSkills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="job-cta">
                      <button className="view-details-btn">
                        View Details
                        <span className="arrow">→</span>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="jobs-empty">
                <div className="empty-icon">🔍</div>
                <h3>No jobs found</h3>
                <p>
                  {hasActiveFilters
                    ? "Try adjusting your filters to find more opportunities"
                    : "No jobs available at the moment"}
                </p>
                {hasActiveFilters && (
                  <button className="clear-filters-btn" onClick={clearFilters}>
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Job Details Modal */}
          {showModal && (
            <div className="job-modal-overlay" onClick={closeModal}>
              <div
                className="job-modal"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
              >
                <button className="modal-close-btn" onClick={closeModal}>
                  ✕
                </button>

                {selectedJob ? (
                  selectedJob.error ? (
                    <div className="modal-body">
                      Failed to load job details.
                    </div>
                  ) : (
                    <div className="modal-body">
                      <h2>{selectedJob.title}</h2>
                      <div className="job-meta">
                        <span className="job-company">
                          {selectedJob.company_name}
                        </span>
                        <span className="job-location">
                          📍 {selectedJob.location}
                        </span>
                        <span className="job-type">{selectedJob.job_type}</span>
                      </div>

                      <div className="job-description">
                        {selectedJob.description}
                      </div>

                      <h4>Required Skills</h4>
                      <div className="job-skills-list">
                        {(() => {
                          try {
                            const req = selectedJob.required_skills
                              ? JSON.parse(selectedJob.required_skills)
                              : [];
                            return req.map((s) => (
                              <span key={s} className="job-skill-badge">
                                {skills.find((sk) => sk.id === s)?.name || s}
                              </span>
                            ));
                          } catch (e) {
                            return <em>No skills listed</em>;
                          }
                        })()}
                      </div>

                      <div className="modal-cta">
                        {selectedJob.application_url ? (
                          <a
                            href={selectedJob.application_url}
                            className="view-details-btn"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Apply Now
                          </a>
                        ) : (
                          <div className="apply-form">
                            <label style={{ display: 'block', marginBottom: 8 }}>
                              Message to employer (optional)
                            </label>
                            <textarea
                              className="filter-input"
                              rows={4}
                              value={applicationMessage}
                              onChange={(e) => setApplicationMessage(e.target.value)}
                              placeholder="Introduce yourself, mention why you're a good fit..."
                            />
                            <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
                              <button
                                className="view-details-btn"
                                onClick={async () => {
                                  if (applying) return;
                                  setApplying(true);
                                  setApplicationResult(null);
                                  try {
                                    await jobAPI.apply(selectedJob.id, { message: applicationMessage });
                                    setApplicationResult({ success: true, message: 'Application submitted. The admin will review it.' });
                                    setApplicationMessage('');
                                  } catch (err) {
                                    console.error('Apply failed', err);
                                    setApplicationResult({ success: false, message: err?.response?.data?.detail || 'Failed to submit application' });
                                  } finally {
                                    setApplying(false);
                                  }
                                }}
                                disabled={applying}
                              >
                                {applying ? 'Submitting...' : 'Submit Application'}
                              </button>
                              <button className="clear-filters-btn" onClick={() => { setApplicationMessage(''); setApplicationResult(null); }}>
                                Cancel
                              </button>
                            </div>

                            {applicationResult && (
                              <div style={{ marginTop: 10 }} className={applicationResult.success ? 'profile-alert success' : 'profile-alert error'}>
                                {applicationResult.message}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                ) : (
                  <div className="modal-body">Loading...</div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Jobs;
