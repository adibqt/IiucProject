import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./Resources.css";

const Resources = () => {
  const [courses, setCourses] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterCost, setFilterCost] = useState("all");
  const [sortOption, setSortOption] = useState("recent");
  const navigate = useNavigate();

  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://localhost:8000/api";

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/login", {
        state: {
          from: "/resources",
          message: "Please login to view resources",
        },
      });
      return;
    }
    loadResources();
  }, [navigate]);

  const loadResources = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");
      const config = token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : undefined;

      const [coursesResponse, skillsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/courses`, config),
        axios.get(`${API_BASE_URL}/skills`, config).catch(() => ({ data: [] })),
      ]);

      setCourses(coursesResponse.data || []);
      setSkills(skillsResponse.data || []);
    } catch (error) {
      console.error("Error loading resources:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("userToken");
        localStorage.removeItem("userData");
        navigate("/login", {
          state: {
            from: "/resources",
            message: "Session expired. Please login again.",
          },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const platformOptions = useMemo(() => {
    const platforms = new Set();
    courses.forEach((course) => {
      if (course.platform) {
        platforms.add(course.platform);
      }
    });
    return Array.from(platforms).sort((a, b) => a.localeCompare(b));
  }, [courses]);

  const skillMap = useMemo(() => {
    return skills.reduce((acc, skill) => {
      acc[skill.id] = skill.name;
      return acc;
    }, {});
  }, [skills]);

  const parseRelatedSkills = (course) => {
    if (!course.related_skills) return [];
    try {
      const parsed =
        typeof course.related_skills === "string"
          ? JSON.parse(course.related_skills)
          : course.related_skills;
      if (Array.isArray(parsed)) {
        return parsed
          .map((skillId) => skillMap[skillId])
          .filter((name) => Boolean(name));
      }
    } catch (error) {
      console.warn("Invalid related_skills format", course.related_skills);
    }
    return [];
  };

  const filteredCourses = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    const filtered = courses.filter((course) => {
      const matchesSearch =
        !search ||
        (course.title && course.title.toLowerCase().includes(search)) ||
        (course.platform && course.platform.toLowerCase().includes(search)) ||
        (course.description &&
          course.description.toLowerCase().includes(search));

      const matchesPlatform =
        filterPlatform === "all" ||
        course.platform?.toLowerCase() === filterPlatform.toLowerCase();

      const matchesCost =
        filterCost === "all" ||
        course.cost_type?.toLowerCase() === filterCost.toLowerCase();

      return matchesSearch && matchesPlatform && matchesCost;
    });

    switch (sortOption) {
      case "popular":
        return filtered.sort((a, b) => b.views_count - a.views_count);
      case "alphabetical":
        return filtered.sort((a, b) => a.title.localeCompare(b.title));
      case "recent":
      default:
        return filtered.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
    }
  }, [courses, searchTerm, filterPlatform, filterCost, sortOption]);

  const handleCourseSelect = async (course) => {
    setSelectedCourse(course);
    try {
      const token = localStorage.getItem("userToken");
      const config = token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : undefined;
      // Increment view count
      await axios.get(`${API_BASE_URL}/courses/${course.id}`, config);
      setCourses((prev) =>
        prev.map((item) =>
          item.id === course.id
            ? { ...item, views_count: item.views_count + 1 }
            : item
        )
      );
    } catch (error) {
      console.error("Failed to update course views", error);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterPlatform("all");
    setFilterCost("all");
    setSortOption("recent");
  };

  const formatCost = (costType) => {
    if (!costType) return "N/A";
    if (costType.toLowerCase() === "free") return "Free Access";
    if (costType.toLowerCase() === "paid") return "Paid";
    return costType;
  };

  return (
    <div className="resources-page">
      <div className="resources-bg-grid" />
      <div className="resources-bg-orbs">
        <div className="resources-orb resources-orb-1" />
        <div className="resources-orb resources-orb-2" />
        <div className="resources-orb resources-orb-3" />
      </div>

      <Navbar />

      <main className="resources-main">
        <section className="resources-hero">
          <div className="resources-hero-content">
            <h1>Find the Right Learning Resource</h1>
            <p>
              Curated courses from trusted platforms to help you sharpen your
              skills and accelerate your career.
            </p>

            <div className="resources-search-wrapper">
              <div className="resources-search-bar">
                <svg
                  className="resources-search-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                >
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
                  placeholder="Search by course title, platform or keywords..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <div className="resources-filters">
                <select
                  value={filterPlatform}
                  onChange={(event) => setFilterPlatform(event.target.value)}
                >
                  <option value="all">All Platforms</option>
                  {platformOptions.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>

                <select
                  value={filterCost}
                  onChange={(event) => setFilterCost(event.target.value)}
                >
                  <option value="all">Cost: All</option>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>

                <select
                  value={sortOption}
                  onChange={(event) => setSortOption(event.target.value)}
                >
                  <option value="recent">Newest</option>
                  <option value="popular">Most Popular</option>
                  <option value="alphabetical">A-Z</option>
                </select>

                {(searchTerm ||
                  filterPlatform !== "all" ||
                  filterCost !== "all" ||
                  sortOption !== "recent") && (
                  <button
                    className="resources-clear-btn"
                    onClick={clearFilters}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="resources-summary">
          <div className="summary-card">
            <span className="summary-label">Available Courses</span>
            <span className="summary-value">{filteredCourses.length}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Total Views</span>
            <span className="summary-value">
              {filteredCourses.reduce(
                (total, course) => total + (course.views_count || 0),
                0
              )}
            </span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Active Platforms</span>
            <span className="summary-value">{platformOptions.length}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Skills Covered</span>
            <span className="summary-value">{skills.length}</span>
          </div>
        </section>

        <section className="resources-content">
          {loading ? (
            <div className="resources-loading">
              <div className="resources-spinner" />
              <p>Loading curated resources...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="resources-empty">
              <div className="empty-icon">📚</div>
              <h3>No courses found</h3>
              <p>Try adjusting your search or filter criteria.</p>
              {(searchTerm ||
                filterPlatform !== "all" ||
                filterCost !== "all") && (
                <button className="resources-clear-btn" onClick={clearFilters}>
                  Reset filters
                </button>
              )}
            </div>
          ) : (
            <div className="resources-grid">
              {filteredCourses.map((course) => (
                <article
                  key={course.id}
                  className="course-card"
                  onClick={() => handleCourseSelect(course)}
                >
                  <div className="course-card-badge">
                    {formatCost(course.cost_type)}
                  </div>
                  <div className="course-thumb">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url}
                        alt={`${course.title} cover`}
                      />
                    ) : (
                      <div className="course-thumb-placeholder">
                        <span>{course.platform?.charAt(0) || "C"}</span>
                      </div>
                    )}
                  </div>
                  <div className="course-card-body">
                    <div className="course-meta">
                      <span className="course-platform">{course.platform}</span>
                      <span className="course-views">
                        👁️ {course.views_count ?? 0}
                      </span>
                    </div>
                    <h3 className="course-title">{course.title}</h3>
                    <p className="course-description">
                      {course.description
                        ? `${course.description.slice(0, 160)}${
                            course.description.length > 160 ? "..." : ""
                          }`
                        : "Explore this course to discover key lessons and learning outcomes."}
                    </p>
                    {parseRelatedSkills(course).length > 0 && (
                      <div className="course-skills">
                        {parseRelatedSkills(course)
                          .slice(0, 4)
                          .map((skill) => (
                            <span key={skill} className="course-skill-chip">
                              {skill}
                            </span>
                          ))}
                        {parseRelatedSkills(course).length > 4 && (
                          <span className="course-skill-chip more-chip">
                            +{parseRelatedSkills(course).length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {selectedCourse && (
        <div
          className="course-modal-overlay"
          onClick={() => setSelectedCourse(null)}
        >
          <div
            className="course-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="course-modal-close"
              onClick={() => setSelectedCourse(null)}
            >
              ×
            </button>

            <div className="course-modal-header">
              <div className="course-modal-thumb">
                {selectedCourse.thumbnail_url ? (
                  <img
                    src={selectedCourse.thumbnail_url}
                    alt={`${selectedCourse.title} thumbnail`}
                  />
                ) : (
                  <div className="course-thumb-placeholder">
                    <span>{selectedCourse.platform?.charAt(0) || "C"}</span>
                  </div>
                )}
              </div>
              <div className="course-modal-meta">
                <span className="course-modal-platform">
                  {selectedCourse.platform}
                </span>
                <h2>{selectedCourse.title}</h2>
                <div className="course-modal-stats">
                  <span>👁️ {selectedCourse.views_count ?? 0} views</span>
                  <span>
                    🎓 {selectedCourse.enrollment_count ?? 0} learners
                  </span>
                  <span>{formatCost(selectedCourse.cost_type)}</span>
                </div>
              </div>
            </div>

            <div className="course-modal-body">
              {selectedCourse.description && (
                <section>
                  <h3>What you will learn</h3>
                  <p>{selectedCourse.description}</p>
                </section>
              )}

              {parseRelatedSkills(selectedCourse).length > 0 && (
                <section>
                  <h3>Skills covered</h3>
                  <div className="course-skill-grid">
                    {parseRelatedSkills(selectedCourse).map((skill) => (
                      <span key={skill} className="course-skill-chip">
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h3>Course details</h3>
                <ul className="course-details-list">
                  <li>
                    <span>Platform</span>
                    <span>{selectedCourse.platform}</span>
                  </li>
                  <li>
                    <span>Access</span>
                    <span>{formatCost(selectedCourse.cost_type)}</span>
                  </li>
                  <li>
                    <span>Last updated</span>
                    <span>
                      {new Date(selectedCourse.updated_at).toLocaleDateString()}
                    </span>
                  </li>
                </ul>
              </section>
            </div>

            <div className="course-modal-footer">
              <button
                className="course-save-btn"
                onClick={() => {
                  navigator.clipboard
                    .writeText(selectedCourse.url)
                    .then(() => {
                      const timeout = setTimeout(() => {
                        clearTimeout(timeout);
                      }, 1500);
                    })
                    .catch((error) =>
                      console.error("Failed to copy course link", error)
                    );
                }}
              >
                Copy Link
              </button>
              <a
                href={selectedCourse.url}
                target="_blank"
                rel="noopener noreferrer"
                className="course-primary-btn"
              >
                Visit Course
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;
