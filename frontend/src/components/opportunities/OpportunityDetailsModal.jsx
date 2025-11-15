import React from "react";
import "./OpportunityDetailsModal.css";

const OpportunityDetailsModal = ({
  opportunity,
  onClose,
  isAdmin = false,
  onDelete,
}) => {
  if (!opportunity) return null;

  // Parse required skills
  const parseSkills = (skillsStr) => {
    if (!skillsStr) return [];
    try {
      const parsed = JSON.parse(skillsStr);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return skillsStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  };

  const skills = parseSkills(opportunity.required_skills);

  const getCategoryIcon = (category) => {
    const icons = {
      Internship: "💼",
      Training: "📚",
      Job: "💻",
      "Youth Program": "🌟",
    };
    return icons[category] || "📋";
  };

  return (
    <div className="opportunity-modal-overlay" onClick={onClose}>
      <div className="opportunity-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="opportunity-modal-header">
          <div className="opportunity-modal-header-content">
            <div className="opportunity-modal-icon-large">
              {getCategoryIcon(opportunity.category)}
            </div>
            <div className="opportunity-modal-title-section">
              <h1 className="opportunity-modal-title">{opportunity.title}</h1>
              <p className="opportunity-modal-organization">
                {opportunity.organization}
              </p>
            </div>
          </div>
          <button className="opportunity-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Quick Info Bar */}
        <div className="opportunity-modal-quick-info">
          <div className="quick-info-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
            <span>{opportunity.location}</span>
          </div>
          <div className="quick-info-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 7h10M7 12h10M7 17h10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span>{opportunity.category}</span>
          </div>
          {opportunity.target_track && (
            <div className="quick-info-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
              <span>{opportunity.target_track}</span>
            </div>
          )}
          {opportunity.priority_group && (
            <div className="quick-info-item priority-group">
              <span>🎯</span>
              <span>{opportunity.priority_group}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="opportunity-modal-body">
          {/* Description */}
          <section className="opportunity-modal-section">
            <div className="section-header">
              <span className="section-icon">📋</span>
              <h2>About This Opportunity</h2>
            </div>
            <div className="section-content">
              <p className="description-text">{opportunity.description}</p>
            </div>
          </section>

          {/* Required Skills */}
          {skills.length > 0 && (
            <section className="opportunity-modal-section">
              <div className="section-header">
                <span className="section-icon">🔧</span>
                <h2>Required Skills</h2>
              </div>
              <div className="section-content">
                <div className="skills-grid-modal">
                  {skills.map((skill, idx) => (
                    <span key={idx} className="skill-chip-modal">
                      {typeof skill === "number" ? `Skill #${skill}` : skill}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Application Link */}
          {opportunity.link && (
            <section className="opportunity-modal-section">
              <div className="section-header">
                <span className="section-icon">🔗</span>
                <h2>Application Information</h2>
              </div>
              <div className="section-content">
                <p className="apply-instruction">
                  Click the button below to apply or learn more about this
                  opportunity.
                </p>
              </div>
            </section>
          )}
        </div>

        {/* Footer Actions */}
        <div className="opportunity-modal-footer">
          {isAdmin && (
            <button
              className="btn-delete-modal"
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to delete this opportunity?"
                  )
                ) {
                  onDelete(opportunity.id);
                  onClose();
                }
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Delete
            </button>
          )}
          {opportunity.link && (
            <a
              href={opportunity.link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-apply-primary-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
              </svg>
              Apply Now
            </a>
          )}
          <button className="btn-close-modal" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetailsModal;
