/**
 * CV/Resume Tab Component - PDF Upload + Manual CV Input
 * Users can upload PDF and/or manually input CV details
 */
import React, { useState, useEffect } from "react";
import cvAPI from "../../services/cvService";
import api from "../../services/api";

const CVTab = ({ profile, onUpdate, onError, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [availableSkills, setAvailableSkills] = useState([]);

  // PDF state
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfFilename, setPdfFilename] = useState(null);
  const [uploadingPDF, setUploadingPDF] = useState(false);

  // CV Form State
  const [cvData, setCvData] = useState({
    personal_summary: "",
    experiences: [],
    education: [],
    skills: [], // Array of skill IDs
    tools: [], // Array of strings
    projects: [],
    raw_cv_text: "",
  });

  // Form inputs for adding new items
  const [newExperience, setNewExperience] = useState({
    title: "",
    company: "",
    location: "",
    start_date: "",
    end_date: "",
    current: false,
    description: "",
  });

  const [newEducation, setNewEducation] = useState({
    degree: "",
    institution: "",
    field: "",
    graduation_year: "",
    gpa: "",
  });

  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    technologies: "",
    link: "",
  });

  const [newTool, setNewTool] = useState("");
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);

  // Load CV data and available skills on mount
  useEffect(() => {
    loadCVData();
    loadAvailableSkills();
  }, []);

  const loadCVData = async () => {
    try {
      setLoading(true);
      const cv = await cvAPI.getCV();
      console.log("CV loaded successfully:", cv);
      setCvData({
        personal_summary: cv.personal_summary || "",
        experiences: cv.experiences || [],
        education: cv.education || [],
        skills: cv.skills || [],
        tools: cv.tools || [],
        projects: cv.projects || [],
        raw_cv_text: cv.raw_cv_text || "",
      });
      setSelectedSkillIds(cv.skills || []);
      setPdfFilename(cv.cv_pdf_filename || null);
    } catch (err) {
      // CV doesn't exist yet, that's okay
      if (err.response?.status !== 404) {
        console.error("Error loading CV:", err);
        onError(
          "Failed to load CV: " + (err.response?.data?.detail || err.message)
        );
      } else {
        console.log("No CV found yet - this is normal for new users");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSkills = async () => {
    try {
      const response = await api.get("/skills");
      setAvailableSkills(response.data || []);
    } catch (err) {
      console.error("Error loading skills:", err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      onError(null);

      const cvPayload = {
        personal_summary: cvData.personal_summary || null,
        experiences: cvData.experiences,
        education: cvData.education,
        skills: selectedSkillIds,
        tools: cvData.tools,
        projects: cvData.projects,
        raw_cv_text: cvData.raw_cv_text || null,
      };

      console.log("Saving CV with payload:", cvPayload);
      const saved = await cvAPI.saveCV(cvPayload);
      console.log("CV saved successfully:", saved);

      // Update local state with saved data
      setCvData({
        personal_summary: saved.personal_summary || "",
        experiences: saved.experiences || [],
        education: saved.education || [],
        skills: saved.skills || [],
        tools: saved.tools || [],
        projects: saved.projects || [],
        raw_cv_text: saved.raw_cv_text || "",
      });
      setSelectedSkillIds(saved.skills || []);

      onSuccess("CV details saved successfully!");
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail || err.message || "Failed to save CV";
      console.error("Error saving CV:", err);
      console.error("Error response:", err.response?.data);
      onError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // PDF handlers
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        onError("Only PDF files are allowed");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        onError("File size exceeds 10MB limit");
        return;
      }
      setPdfFile(file);
    }
  };

  const handleUploadPDF = async () => {
    if (!pdfFile) {
      onError("Please select a PDF file first");
      return;
    }

    try {
      setUploadingPDF(true);
      onError(null);
      const result = await cvAPI.uploadPDF(pdfFile);
      setPdfFilename(pdfFile.name);
      setPdfFile(null);
      // Reset file input
      const fileInput = document.getElementById("cv-pdf-upload");
      if (fileInput) fileInput.value = "";
      onSuccess(result.message || "CV PDF uploaded successfully!");
    } catch (err) {
      onError(err.response?.data?.detail || "Failed to upload PDF");
      console.error("Error uploading PDF:", err);
    } finally {
      setUploadingPDF(false);
    }
  };

  const handleViewPDF = async () => {
    try {
      const blob = await cvAPI.downloadPDF();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (err) {
      onError(err.response?.data?.detail || "Failed to download PDF");
      console.error("Error downloading PDF:", err);
    }
  };

  const handleDeletePDF = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your CV PDF? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setUploadingPDF(true);
      onError(null);
      await cvAPI.deletePDF();
      setPdfFilename(null);
      onSuccess("CV PDF deleted successfully!");
    } catch (err) {
      onError(err.response?.data?.detail || "Failed to delete PDF");
      console.error("Error deleting PDF:", err);
    } finally {
      setUploadingPDF(false);
    }
  };

  // Experience handlers
  const handleAddExperience = () => {
    if (!newExperience.title || !newExperience.company) {
      onError("Title and company are required");
      return;
    }
    setCvData({
      ...cvData,
      experiences: [...cvData.experiences, { ...newExperience }],
    });
    setNewExperience({
      title: "",
      company: "",
      location: "",
      start_date: "",
      end_date: "",
      current: false,
      description: "",
    });
  };

  const handleRemoveExperience = (index) => {
    setCvData({
      ...cvData,
      experiences: cvData.experiences.filter((_, i) => i !== index),
    });
  };

  // Education handlers
  const handleAddEducation = () => {
    if (!newEducation.degree || !newEducation.institution) {
      onError("Degree and institution are required");
      return;
    }
    setCvData({
      ...cvData,
      education: [...cvData.education, { ...newEducation }],
    });
    setNewEducation({
      degree: "",
      institution: "",
      field: "",
      graduation_year: "",
      gpa: "",
    });
  };

  const handleRemoveEducation = (index) => {
    setCvData({
      ...cvData,
      education: cvData.education.filter((_, i) => i !== index),
    });
  };

  // Project handlers
  const handleAddProject = () => {
    if (!newProject.name) {
      onError("Project name is required");
      return;
    }
    setCvData({
      ...cvData,
      projects: [...cvData.projects, { ...newProject }],
    });
    setNewProject({
      name: "",
      description: "",
      technologies: "",
      link: "",
    });
  };

  const handleRemoveProject = (index) => {
    setCvData({
      ...cvData,
      projects: cvData.projects.filter((_, i) => i !== index),
    });
  };

  // Tools handlers
  const handleAddTool = () => {
    if (!newTool.trim()) {
      return;
    }
    if (cvData.tools.includes(newTool.trim())) {
      onError("Tool already added");
      return;
    }
    setCvData({
      ...cvData,
      tools: [...cvData.tools, newTool.trim()],
    });
    setNewTool("");
  };

  const handleRemoveTool = (index) => {
    setCvData({
      ...cvData,
      tools: cvData.tools.filter((_, i) => i !== index),
    });
  };

  // Skills handlers (multi-select from admin-defined skills)
  const handleToggleSkill = (skillId) => {
    if (selectedSkillIds.includes(skillId)) {
      setSelectedSkillIds(selectedSkillIds.filter((id) => id !== skillId));
    } else {
      setSelectedSkillIds([...selectedSkillIds, skillId]);
    }
  };

  if (loading) {
    return (
      <div className="tab-panel">
        <div className="profile-loading">Loading CV...</div>
      </div>
    );
  }

  return (
    <div className="tab-panel">
      <div>
        <h2>CV/Resume</h2>
        <p className="tab-description">
          Upload your CV as a PDF and/or manually enter your CV details. All
          information is stored securely for future AI analysis and job
          matching.
        </p>
      </div>

      <form onSubmit={handleSave} className="profile-form">
        {/* CV PDF Upload Section */}
        <div className="cv-section" style={{ marginTop: "30px" }}>
          <h3>📄 CV/Resume PDF Upload</h3>
          <p
            className="read-only-note"
            style={{ marginBottom: "20px", color: "#94a3b8" }}
          >
            Upload your CV/resume as a PDF file (max 10MB). The PDF will be
            stored securely and can be viewed or downloaded later.
          </p>

          {pdfFilename ? (
            <div
              style={{
                padding: "20px",
                backgroundColor: "rgba(34, 197, 94, 0.1)",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                borderRadius: "12px",
                marginBottom: "25px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "15px",
                }}
              >
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <p
                    style={{
                      margin: "0 0 8px 0",
                      color: "#86efac",
                      fontWeight: "600",
                      fontSize: "16px",
                    }}
                  >
                    ✓ PDF Uploaded
                  </p>
                  <p
                    style={{
                      margin: "0",
                      color: "#cbd5e1",
                      fontSize: "14px",
                      wordBreak: "break-word",
                    }}
                  >
                    📄 {pdfFilename}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={handleViewPDF}
                    className="home-btn home-btn-primary"
                    style={{ padding: "10px 20px", fontSize: "14px" }}
                  >
                    👁️ View PDF
                  </button>
                  <button
                    type="button"
                    onClick={handleDeletePDF}
                    className="home-btn"
                    style={{
                      padding: "10px 20px",
                      fontSize: "14px",
                      backgroundColor: "rgba(239, 68, 68, 0.2)",
                      border: "1px solid rgba(239, 68, 68, 0.4)",
                      color: "#fca5a5",
                    }}
                    disabled={uploadingPDF}
                  >
                    {uploadingPDF ? "Deleting..." : "🗑️ Delete"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: "20px",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.2)",
                borderRadius: "12px",
                marginBottom: "25px",
              }}
            >
              <p
                style={{
                  margin: "0 0 15px 0",
                  color: "#94a3b8",
                  fontSize: "14px",
                }}
              >
                No CV PDF uploaded yet. Select a PDF file below to upload.
              </p>
            </div>
          )}

          <div className="form-group">
            <label>Upload CV PDF</label>
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <input
                id="cv-pdf-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                disabled={uploadingPDF || !!pdfFilename}
                style={{
                  flex: 1,
                  minWidth: "250px",
                  padding: "12px",
                  backgroundColor: "rgba(15, 23, 42, 0.7)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  borderRadius: "8px",
                  color: "#ffffff",
                  cursor: pdfFilename ? "not-allowed" : "pointer",
                  opacity: pdfFilename ? 0.6 : 1,
                }}
              />
              {pdfFile && !pdfFilename && (
                <button
                  type="button"
                  onClick={handleUploadPDF}
                  className="home-btn home-btn-primary"
                  disabled={uploadingPDF}
                  style={{ minWidth: "140px", padding: "12px 20px" }}
                >
                  {uploadingPDF ? "Uploading..." : "📤 Upload PDF"}
                </button>
              )}
            </div>
            {pdfFile && !pdfFilename && (
              <p
                style={{
                  margin: "10px 0 0 0",
                  color: "#94a3b8",
                  fontSize: "13px",
                }}
              >
                Selected:{" "}
                <strong style={{ color: "#ffffff" }}>{pdfFile.name}</strong> (
                {(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
            {pdfFilename && (
              <p
                style={{
                  margin: "10px 0 0 0",
                  color: "#94a3b8",
                  fontSize: "13px",
                }}
              >
                To upload a new PDF, delete the current one first.
              </p>
            )}
            {!pdfFilename && (
              <p
                style={{
                  margin: "10px 0 0 0",
                  color: "#94a3b8",
                  fontSize: "13px",
                }}
              >
                <strong>Note:</strong> Only PDF files are accepted. Maximum file
                size is 10MB.
              </p>
            )}
          </div>
        </div>

        {/* Manual CV Input Section */}
        <div className="cv-section" style={{ marginTop: "40px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            <h3 style={{ margin: 0 }}>✍️ Manual CV Details</h3>
            <span
              style={{
                padding: "4px 12px",
                backgroundColor: "rgba(59, 130, 246, 0.2)",
                borderRadius: "12px",
                fontSize: "12px",
                color: "#60a5fa",
              }}
            >
              Optional
            </span>
          </div>
          <p
            className="read-only-note"
            style={{ marginBottom: "25px", color: "#94a3b8" }}
          >
            Fill in your CV details manually. This information will be used for
            AI-based skill extraction and job matching.
          </p>

          {/* Personal Summary */}
          <div className="cv-input-section">
            <h4>📝 Professional Summary</h4>
            <div className="form-group">
              <label>Summary</label>
              <textarea
                value={cvData.personal_summary}
                onChange={(e) =>
                  setCvData({ ...cvData, personal_summary: e.target.value })
                }
                placeholder="Write a brief professional summary highlighting your key skills and experience..."
                rows="4"
              />
            </div>
          </div>

          {/* Work Experience */}
          <div className="cv-input-section">
            <h4>💼 Work Experience</h4>
            <div className="cv-add-item">
              <div className="form-row">
                <div className="form-group">
                  <label>Job Title *</label>
                  <input
                    type="text"
                    value={newExperience.title}
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        title: e.target.value,
                      })
                    }
                    placeholder="e.g., Software Engineer"
                  />
                </div>
                <div className="form-group">
                  <label>Company *</label>
                  <input
                    type="text"
                    value={newExperience.company}
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        company: e.target.value,
                      })
                    }
                    placeholder="e.g., Tech Company Inc."
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={newExperience.location}
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        location: e.target.value,
                      })
                    }
                    placeholder="e.g., New York, USA"
                  />
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="text"
                    value={newExperience.start_date}
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        start_date: e.target.value,
                      })
                    }
                    placeholder="e.g., Jan 2020"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="text"
                    value={newExperience.end_date}
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        end_date: e.target.value,
                      })
                    }
                    placeholder="e.g., Dec 2023 or Present"
                    disabled={newExperience.current}
                  />
                </div>
                <div className="form-group">
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={newExperience.current}
                      onChange={(e) =>
                        setNewExperience({
                          ...newExperience,
                          current: e.target.checked,
                          end_date: e.target.checked ? "Present" : "",
                        })
                      }
                    />
                    Current Position
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newExperience.description}
                  onChange={(e) =>
                    setNewExperience({
                      ...newExperience,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe your responsibilities, achievements, and key contributions..."
                  rows="3"
                />
              </div>
              <button
                type="button"
                onClick={handleAddExperience}
                className="home-btn home-btn-secondary"
              >
                + Add Experience
              </button>
            </div>

            {cvData.experiences.length > 0 && (
              <div className="cv-items-list">
                {cvData.experiences.map((exp, idx) => (
                  <div key={idx} className="cv-item">
                    <div className="cv-item-content">
                      <h4>{exp.title}</h4>
                      <p>
                        {exp.company}
                        {exp.location && ` • ${exp.location}`}
                      </p>
                      <p>
                        {exp.start_date} - {exp.end_date || "Present"}
                      </p>
                      {exp.description && <p>{exp.description}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(idx)}
                      className="cv-item-remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Education */}
          <div className="cv-input-section">
            <h4>🎓 Education</h4>
            <div className="cv-add-item">
              <div className="form-row">
                <div className="form-group">
                  <label>Degree *</label>
                  <input
                    type="text"
                    value={newEducation.degree}
                    onChange={(e) =>
                      setNewEducation({
                        ...newEducation,
                        degree: e.target.value,
                      })
                    }
                    placeholder="e.g., Bachelor of Science"
                  />
                </div>
                <div className="form-group">
                  <label>Institution *</label>
                  <input
                    type="text"
                    value={newEducation.institution}
                    onChange={(e) =>
                      setNewEducation({
                        ...newEducation,
                        institution: e.target.value,
                      })
                    }
                    placeholder="e.g., University Name"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Field of Study</label>
                  <input
                    type="text"
                    value={newEducation.field}
                    onChange={(e) =>
                      setNewEducation({
                        ...newEducation,
                        field: e.target.value,
                      })
                    }
                    placeholder="e.g., Computer Science"
                  />
                </div>
                <div className="form-group">
                  <label>Graduation Year</label>
                  <input
                    type="text"
                    value={newEducation.graduation_year}
                    onChange={(e) =>
                      setNewEducation({
                        ...newEducation,
                        graduation_year: e.target.value,
                      })
                    }
                    placeholder="e.g., 2024"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>GPA (Optional)</label>
                <input
                  type="text"
                  value={newEducation.gpa}
                  onChange={(e) =>
                    setNewEducation({ ...newEducation, gpa: e.target.value })
                  }
                  placeholder="e.g., 3.8/4.0"
                />
              </div>
              <button
                type="button"
                onClick={handleAddEducation}
                className="home-btn home-btn-secondary"
              >
                + Add Education
              </button>
            </div>

            {cvData.education.length > 0 && (
              <div className="cv-items-list">
                {cvData.education.map((edu, idx) => (
                  <div key={idx} className="cv-item">
                    <div className="cv-item-content">
                      <h4>
                        {edu.degree} {edu.field && `in ${edu.field}`}
                      </h4>
                      <p>
                        {edu.institution}
                        {edu.graduation_year && ` • ${edu.graduation_year}`}
                        {edu.gpa && ` • GPA: ${edu.gpa}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(idx)}
                      className="cv-item-remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skills - Multi-select from admin-defined skills */}
          <div className="cv-input-section">
            <h4>🛠️ Skills</h4>
            <p
              className="read-only-note"
              style={{
                marginBottom: "15px",
                color: "#94a3b8",
                fontSize: "13px",
              }}
            >
              Select skills from the admin-defined skills list. Only skills from
              this list can be added.
            </p>
            <div className="form-group">
              <label>Available Skills</label>
              <div
                className="skills-grid"
                style={{
                  maxHeight: "200px",
                  overflowY: "auto",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  padding: "15px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(15, 23, 42, 0.3)",
                }}
              >
                {availableSkills.length === 0 ? (
                  <p className="empty-message">No skills available</p>
                ) : (
                  availableSkills.map((skill) => (
                    <label
                      key={skill.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                        padding: "8px",
                        borderRadius: "6px",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor =
                          "rgba(59, 130, 246, 0.1)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = "transparent")
                      }
                    >
                      <input
                        type="checkbox"
                        checked={selectedSkillIds.includes(skill.id)}
                        onChange={() => handleToggleSkill(skill.id)}
                      />
                      <span style={{ color: "#ffffff" }}>{skill.name}</span>
                    </label>
                  ))
                )}
              </div>
              {selectedSkillIds.length > 0 && (
                <div style={{ marginTop: "15px" }}>
                  <strong style={{ color: "#ffffff" }}>
                    Selected Skills ({selectedSkillIds.length}):
                  </strong>
                  <div className="skills-grid" style={{ marginTop: "10px" }}>
                    {selectedSkillIds.map((skillId) => {
                      const skill = availableSkills.find(
                        (s) => s.id === skillId
                      );
                      return skill ? (
                        <div key={skillId} className="skill-tag">
                          <span>{skill.name}</span>
                          <button
                            type="button"
                            onClick={() => handleToggleSkill(skillId)}
                            className="skill-remove"
                          >
                            ✕
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tools/Technologies */}
          <div className="cv-input-section">
            <h4>⚙️ Tools & Technologies</h4>
            <div className="cv-add-item">
              <div className="form-group">
                <label>Add Tool/Technology</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="text"
                    value={newTool}
                    onChange={(e) => setNewTool(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTool();
                      }
                    }}
                    placeholder="e.g., React, Node.js, MongoDB, Docker"
                  />
                  <button
                    type="button"
                    onClick={handleAddTool}
                    className="home-btn home-btn-secondary"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {cvData.tools.length > 0 && (
              <div className="cv-items-list">
                {cvData.tools.map((tool, idx) => (
                  <div key={idx} className="cv-item">
                    <div className="cv-item-content">
                      <span>{tool}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveTool(idx)}
                      className="cv-item-remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Projects */}
          <div className="cv-input-section">
            <h4>🚀 Projects</h4>
            <div className="cv-add-item">
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  placeholder="e.g., E-Commerce Platform"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe your project, its purpose, and key features..."
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Technologies Used</label>
                  <input
                    type="text"
                    value={newProject.technologies}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        technologies: e.target.value,
                      })
                    }
                    placeholder="e.g., React, Node.js, MongoDB"
                  />
                </div>
                <div className="form-group">
                  <label>Project Link (Optional)</label>
                  <input
                    type="url"
                    value={newProject.link}
                    onChange={(e) =>
                      setNewProject({ ...newProject, link: e.target.value })
                    }
                    placeholder="https://project-link.com"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddProject}
                className="home-btn home-btn-secondary"
              >
                + Add Project
              </button>
            </div>

            {cvData.projects.length > 0 && (
              <div className="cv-items-list">
                {cvData.projects.map((project, idx) => (
                  <div key={idx} className="cv-item">
                    <div className="cv-item-content">
                      <h4>{project.name}</h4>
                      {project.description && <p>{project.description}</p>}
                      {project.technologies && (
                        <p>
                          <strong>Technologies:</strong> {project.technologies}
                        </p>
                      )}
                      {project.link && (
                        <p>
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#3b82f6" }}
                          >
                            View Project →
                          </a>
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveProject(idx)}
                      className="cv-item-remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Raw CV Text (Optional) */}
          <div className="cv-input-section">
            <h4>📄 Raw CV Text (Optional)</h4>
            <p
              className="read-only-note"
              style={{
                marginBottom: "15px",
                color: "#94a3b8",
                fontSize: "13px",
              }}
            >
              Paste your complete CV/resume text here. This will be used for
              future AI-based skill extraction and analysis.
            </p>
            <div className="form-group">
              <label>Paste CV Text</label>
              <textarea
                value={cvData.raw_cv_text}
                onChange={(e) =>
                  setCvData({ ...cvData, raw_cv_text: e.target.value })
                }
                placeholder="Paste your complete CV/resume text here..."
                rows="8"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div
          style={{
            marginTop: "40px",
            padding: "20px",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderRadius: "12px",
            border: "1px solid rgba(59, 130, 246, 0.2)",
          }}
        >
          <p
            style={{
              margin: "0 0 15px 0",
              color: "#94a3b8",
              fontSize: "14px",
            }}
          >
            <strong style={{ color: "#ffffff" }}>
              💾 Save Your CV Details
            </strong>
            <br />
            Click the button below to save all your CV information to the
            database. Your PDF and manual CV details are saved separately.
          </p>
          <button
            type="submit"
            className="home-btn home-btn-primary"
            disabled={saving}
            style={{
              minWidth: "180px",
              padding: "12px 24px",
              fontSize: "16px",
            }}
          >
            {saving ? "Saving..." : "💾 Save CV Details"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CVTab;
