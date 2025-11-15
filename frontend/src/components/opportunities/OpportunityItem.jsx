import React from "react";
import "./OpportunityItem.css";

const OpportunityItem = ({
  opportunity,
  onViewDetails,
  onDelete,
  isAdmin = false,
}) => {
  // Parse required skills if it's a JSON string
  const parseSkills = (skillsStr) => {
    if (!skillsStr) return [];
    try {
      const parsed = JSON.parse(skillsStr);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // If not JSON, treat as comma-separated string
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
    <div className="opportunity-item">
      <div className="opportunity-item-header">
        <div className="opportunity-item-icon">
          {getCategoryIcon(opportunity.category)}
        </div>
        <div className="opportunity-item-title-section">
          <h3 className="opportunity-item-title">{opportunity.title}</h3>
          <p className="opportunity-item-organization">
            {opportunity.organization}
          </p>
        </div>
      </div>

      <div className="opportunity-item-content">
        <div className="opportunity-item-meta">
          <span className="opportunity-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
            {opportunity.location}
          </span>
          <span className="opportunity-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 7h10M7 12h10M7 17h10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {opportunity.category}
          </span>
          {opportunity.target_track && (
            <span className="opportunity-meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
              {opportunity.target_track}
            </span>
          )}
        </div>

        {opportunity.priority_group && (
          <div className="opportunity-priority-badge">
            <span className="priority-badge-icon">🎯</span>
            {opportunity.priority_group}
          </div>
        )}

        {skills.length > 0 && (
          <div className="opportunity-skills">
            {skills.slice(0, 5).map((skill, idx) => (
              <span key={idx} className="opportunity-skill-tag">
                {typeof skill === "number" ? `Skill #${skill}` : skill}
              </span>
            ))}
            {skills.length > 5 && (
              <span className="opportunity-skill-tag more-skills">
                +{skills.length - 5} more
              </span>
            )}
          </div>
        )}

        <p className="opportunity-item-description">
          {opportunity.description.length > 150
            ? `${opportunity.description.substring(0, 150)}...`
            : opportunity.description}
        </p>
      </div>

      <div className="opportunity-item-footer">
        <button
          className="opportunity-btn-view"
          onClick={() => onViewDetails(opportunity)}
        >
          View Details
        </button>
        {isAdmin && (
          <button
            className="opportunity-btn-delete"
            onClick={() => onDelete(opportunity.id)}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default OpportunityItem;
