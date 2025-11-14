/**
 * CV/Resume Tab Component
 * Structured CV input with multiple sections
 */
import React, { useState, useEffect } from "react";
import profileAPI from "../../services/profileService";

const CVTab = ({ profile, onUpdate, onError, onSuccess }) => {
  // Social links stored separately in database
  const [socialLinks, setSocialLinks] = useState({
    linkedin: "",
    github: "",
    website: "",
  });

  const [cvData, setCvData] = useState({
    personalInfo: {
      address: "", // Only address is editable in personal info
    },
    education: [],
    experience: [],
    skills: [],
    projects: [],
    certifications: [],
    summary: "",
  });

  const [newEducation, setNewEducation] = useState({
    degree: "",
    institution: "",
    field: "",
    graduationYear: "",
    gpa: "",
  });

  const [newExperience, setNewExperience] = useState({
    title: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  });

  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    technologies: "",
    link: "",
  });

  const [newCertification, setNewCertification] = useState({
    name: "",
    issuer: "",
    date: "",
    expiryDate: "",
    credentialId: "",
    link: "",
  });

  // Load existing CV data and social links
  useEffect(() => {
    // Load social links from profile
    setSocialLinks({
      linkedin: profile?.linkedin_url || "",
      github: profile?.github_url || "",
      website: profile?.website_url || "",
    });

    // Load CV data
    if (profile?.cv_text) {
      try {
        const parsed = JSON.parse(profile.cv_text);
        setCvData(parsed);
      } catch (e) {
        // If not JSON, treat as plain text in summary
        setCvData({
          ...cvData,
          summary: profile.cv_text,
        });
      }
    }
  }, [profile]);

  const handlePersonalInfoChange = (field, value) => {
    setCvData({
      ...cvData,
      personalInfo: {
        ...cvData.personalInfo,
        [field]: value,
      },
    });
  };

  const handleAddEducation = () => {
    if (newEducation.degree && newEducation.institution) {
      setCvData({
        ...cvData,
        education: [...cvData.education, { ...newEducation }],
      });
      setNewEducation({
        degree: "",
        institution: "",
        field: "",
        graduationYear: "",
        gpa: "",
      });
    }
  };

  const handleRemoveEducation = (index) => {
    setCvData({
      ...cvData,
      education: cvData.education.filter((_, i) => i !== index),
    });
  };

  const handleAddExperience = () => {
    if (newExperience.title && newExperience.company) {
      setCvData({
        ...cvData,
        experience: [...cvData.experience, { ...newExperience }],
      });
      setNewExperience({
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      });
    }
  };

  const handleRemoveExperience = (index) => {
    setCvData({
      ...cvData,
      experience: cvData.experience.filter((_, i) => i !== index),
    });
  };

  const handleAddProject = () => {
    if (newProject.name) {
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
    }
  };

  const handleRemoveProject = (index) => {
    setCvData({
      ...cvData,
      projects: cvData.projects.filter((_, i) => i !== index),
    });
  };

  const handleAddCertification = () => {
    if (newCertification.name && newCertification.issuer) {
      setCvData({
        ...cvData,
        certifications: [...cvData.certifications, { ...newCertification }],
      });
      setNewCertification({
        name: "",
        issuer: "",
        date: "",
        expiryDate: "",
        credentialId: "",
        link: "",
      });
    }
  };

  const handleRemoveCertification = (index) => {
    setCvData({
      ...cvData,
      certifications: cvData.certifications.filter((_, i) => i !== index),
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      onError(null);

      // Save CV text
      const cvText = JSON.stringify(cvData);
      await profileAPI.setCV(cvText);

      // Save social links via profile update
      await profileAPI.updateProfile({
        linkedin_url: socialLinks.linkedin || null,
        github_url: socialLinks.github || null,
        website_url: socialLinks.website || null,
      });

      // Refresh profile data
      const updatedProfile = await profileAPI.getProfile();
      onUpdate({ ...updatedProfile, cv_text: cvText });
      onSuccess("CV and social links updated successfully!");
    } catch (err) {
      onError("Failed to update CV");
      console.error(err);
    }
  };

  return (
    <div className="tab-panel">
      <h2>CV/Resume</h2>
      <p className="tab-description">
        Build your structured CV/resume. All information is stored securely for
        future AI analysis and job matching.
      </p>

      <form onSubmit={handleSave} className="profile-form">
        {/* Personal Information */}
        <div className="cv-section">
          <h3>Personal Information</h3>
          <p className="read-only-note">
            Name, email, and phone cannot be edited. Contact support to update
            your personal information.
          </p>

          {/* Read-only Personal Info */}
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <div className="read-only-field">
                {profile?.full_name || "Not set"}
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <div className="read-only-field">
                {profile?.email || "Not set"}
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <div className="read-only-field">
                {profile?.phone_number || "Not set"}
              </div>
            </div>
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                value={cvData.personalInfo.address || ""}
                onChange={(e) =>
                  handlePersonalInfoChange("address", e.target.value)
                }
                placeholder="City, Country"
              />
            </div>
          </div>

          {/* Editable Social Links */}
          <div className="form-row">
            <div className="form-group">
              <label>LinkedIn</label>
              <input
                type="url"
                value={socialLinks.linkedin}
                onChange={(e) =>
                  setSocialLinks({ ...socialLinks, linkedin: e.target.value })
                }
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
            <div className="form-group">
              <label>GitHub</label>
              <input
                type="url"
                value={socialLinks.github}
                onChange={(e) =>
                  setSocialLinks({ ...socialLinks, github: e.target.value })
                }
                placeholder="https://github.com/yourusername"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Website/Portfolio</label>
            <input
              type="url"
              value={socialLinks.website}
              onChange={(e) =>
                setSocialLinks({ ...socialLinks, website: e.target.value })
              }
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>

        {/* Professional Summary */}
        <div className="cv-section">
          <h3>Professional Summary</h3>
          <div className="form-group">
            <label>Summary</label>
            <textarea
              value={cvData.summary}
              onChange={(e) =>
                setCvData({ ...cvData, summary: e.target.value })
              }
              placeholder="Write a brief professional summary..."
              rows="4"
            />
          </div>
        </div>

        {/* Education */}
        <div className="cv-section">
          <h3>Education</h3>
          <div className="cv-add-item">
            <div className="form-row">
              <div className="form-group">
                <label>Degree</label>
                <input
                  type="text"
                  value={newEducation.degree}
                  onChange={(e) =>
                    setNewEducation({ ...newEducation, degree: e.target.value })
                  }
                  placeholder="Bachelor of Science"
                />
              </div>
              <div className="form-group">
                <label>Institution</label>
                <input
                  type="text"
                  value={newEducation.institution}
                  onChange={(e) =>
                    setNewEducation({
                      ...newEducation,
                      institution: e.target.value,
                    })
                  }
                  placeholder="University Name"
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
                    setNewEducation({ ...newEducation, field: e.target.value })
                  }
                  placeholder="Computer Science"
                />
              </div>
              <div className="form-group">
                <label>Graduation Year</label>
                <input
                  type="text"
                  value={newEducation.graduationYear}
                  onChange={(e) =>
                    setNewEducation({
                      ...newEducation,
                      graduationYear: e.target.value,
                    })
                  }
                  placeholder="2024"
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
                placeholder="3.8/4.0"
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
                      {edu.graduationYear && ` • ${edu.graduationYear}`}
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

        {/* Work Experience */}
        <div className="cv-section">
          <h3>Work Experience</h3>
          <div className="cv-add-item">
            <div className="form-row">
              <div className="form-group">
                <label>Job Title</label>
                <input
                  type="text"
                  value={newExperience.title}
                  onChange={(e) =>
                    setNewExperience({
                      ...newExperience,
                      title: e.target.value,
                    })
                  }
                  placeholder="Software Engineer"
                />
              </div>
              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  value={newExperience.company}
                  onChange={(e) =>
                    setNewExperience({
                      ...newExperience,
                      company: e.target.value,
                    })
                  }
                  placeholder="Company Name"
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
                  placeholder="City, Country"
                />
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="text"
                  value={newExperience.startDate}
                  onChange={(e) =>
                    setNewExperience({
                      ...newExperience,
                      startDate: e.target.value,
                    })
                  }
                  placeholder="MM/YYYY"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="text"
                  value={newExperience.endDate}
                  onChange={(e) =>
                    setNewExperience({
                      ...newExperience,
                      endDate: e.target.value,
                    })
                  }
                  placeholder="MM/YYYY or Present"
                  disabled={newExperience.current}
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newExperience.current}
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        current: e.target.checked,
                        endDate: e.target.checked ? "Present" : "",
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
                placeholder="Describe your responsibilities and achievements..."
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

          {cvData.experience.length > 0 && (
            <div className="cv-items-list">
              {cvData.experience.map((exp, idx) => (
                <div key={idx} className="cv-item">
                  <div className="cv-item-content">
                    <h4>{exp.title}</h4>
                    <p>
                      {exp.company}
                      {exp.location && ` • ${exp.location}`}
                    </p>
                    <p>
                      {exp.startDate} - {exp.endDate || "Present"}
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

        {/* Projects */}
        <div className="cv-section">
          <h3>Projects</h3>
          <div className="cv-add-item">
            <div className="form-group">
              <label>Project Name</label>
              <input
                type="text"
                value={newProject.name}
                onChange={(e) =>
                  setNewProject({ ...newProject, name: e.target.value })
                }
                placeholder="My Awesome Project"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newProject.description}
                onChange={(e) =>
                  setNewProject({ ...newProject, description: e.target.value })
                }
                placeholder="Describe your project..."
                rows="3"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Technologies</label>
                <input
                  type="text"
                  value={newProject.technologies}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      technologies: e.target.value,
                    })
                  }
                  placeholder="React, Node.js, MongoDB"
                />
              </div>
              <div className="form-group">
                <label>Project Link</label>
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
                        >
                          View Project
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

        {/* Certifications */}
        <div className="cv-section">
          <h3>Certifications</h3>
          <div className="cv-add-item">
            <div className="form-row">
              <div className="form-group">
                <label>Certification Name</label>
                <input
                  type="text"
                  value={newCertification.name}
                  onChange={(e) =>
                    setNewCertification({
                      ...newCertification,
                      name: e.target.value,
                    })
                  }
                  placeholder="AWS Certified Solutions Architect"
                />
              </div>
              <div className="form-group">
                <label>Issuing Organization</label>
                <input
                  type="text"
                  value={newCertification.issuer}
                  onChange={(e) =>
                    setNewCertification({
                      ...newCertification,
                      issuer: e.target.value,
                    })
                  }
                  placeholder="Amazon Web Services"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Issue Date</label>
                <input
                  type="text"
                  value={newCertification.date}
                  onChange={(e) =>
                    setNewCertification({
                      ...newCertification,
                      date: e.target.value,
                    })
                  }
                  placeholder="MM/YYYY"
                />
              </div>
              <div className="form-group">
                <label>Expiry Date (Optional)</label>
                <input
                  type="text"
                  value={newCertification.expiryDate}
                  onChange={(e) =>
                    setNewCertification({
                      ...newCertification,
                      expiryDate: e.target.value,
                    })
                  }
                  placeholder="MM/YYYY"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Credential ID (Optional)</label>
                <input
                  type="text"
                  value={newCertification.credentialId}
                  onChange={(e) =>
                    setNewCertification({
                      ...newCertification,
                      credentialId: e.target.value,
                    })
                  }
                  placeholder="ABC123XYZ"
                />
              </div>
              <div className="form-group">
                <label>Verification Link (Optional)</label>
                <input
                  type="url"
                  value={newCertification.link}
                  onChange={(e) =>
                    setNewCertification({
                      ...newCertification,
                      link: e.target.value,
                    })
                  }
                  placeholder="https://verify-cert.com"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddCertification}
              className="home-btn home-btn-secondary"
            >
              + Add Certification
            </button>
          </div>

          {cvData.certifications.length > 0 && (
            <div className="cv-items-list">
              {cvData.certifications.map((cert, idx) => (
                <div key={idx} className="cv-item">
                  <div className="cv-item-content">
                    <h4>{cert.name}</h4>
                    <p>
                      {cert.issuer}
                      {cert.date && ` • Issued: ${cert.date}`}
                      {cert.expiryDate && ` • Expires: ${cert.expiryDate}`}
                    </p>
                    {cert.credentialId && (
                      <p>
                        <strong>Credential ID:</strong> {cert.credentialId}
                      </p>
                    )}
                    {cert.link && (
                      <p>
                        <a
                          href={cert.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Verify Certification
                        </a>
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCertification(idx)}
                    className="cv-item-remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="home-btn home-btn-primary">
          Save CV
        </button>
      </form>
    </div>
  );
};

export default CVTab;
