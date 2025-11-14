import React from 'react';
import './ProfileCard.css';

const ProfileCard = ({ profile, interestsForm }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="profile-card-container">
      <div className="professional-profile-card">
        {/* Header Section */}
        <div className="card-header">
          <div className="card-background-pattern"></div>
          <div className="card-header-content">
            <div className="avatar-section">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className="profile-avatar-large" />
              ) : (
                <div className="profile-avatar-placeholder">
                  {profile.full_name?.substring(0, 2).toUpperCase() || "US"}
                </div>
              )}
              <div className="avatar-status-badge">Active</div>
            </div>
            <div className="profile-identity">
              <h2 className="profile-name">{profile.full_name || "User"}</h2>
              <p className="profile-username">@{profile.username}</p>
              <p className="profile-email">{profile.email}</p>
              {profile.phone_number && (
                <p className="profile-phone">📞 {profile.phone_number}</p>
              )}
            </div>
          </div>
        </div>

        {/* Bio Section */}
        {profile.bio && (
          <div className="card-section bio-section">
            <h3 className="section-title">
              <span className="section-icon">💼</span>
              About Me
            </h3>
            <p className="bio-text">{profile.bio}</p>
          </div>
        )}

        {/* Skills Section */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="card-section skills-section">
            <h3 className="section-title">
              <span className="section-icon">⚡</span>
              Skills & Expertise
              <span className="section-count">{profile.skills.length}</span>
            </h3>
            <div className="skills-showcase">
              {profile.skills.map((skill) => (
                <div key={skill.id} className="skill-showcase-item">
                  <span className="skill-name">{skill.name}</span>
                  <span className={`skill-level level-${skill.proficiency_level || 'beginner'}`}>
                    {skill.proficiency_level || 'beginner'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Career Interests */}
        {interestsForm && interestsForm.length > 0 && (
          <div className="card-section interests-section">
            <h3 className="section-title">
              <span className="section-icon">🎯</span>
              Career Interests
            </h3>
            <div className="interests-showcase">
              {interestsForm.map((interest, idx) => (
                <div key={idx} className="interest-showcase-item">
                  {interest}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience Section */}
        {profile.experience_description && (
          <div className="card-section experience-section">
            <h3 className="section-title">
              <span className="section-icon">💡</span>
              Professional Experience
            </h3>
            <p className="experience-text">{profile.experience_description}</p>
          </div>
        )}

        {/* CV Indicator */}
        {profile.cv_text && (
          <div className="card-section cv-indicator-section">
            <div className="cv-indicator">
              <span className="cv-icon">📄</span>
              <span className="cv-text">Resume/CV on file</span>
              <span className="cv-badge">✓</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="card-footer">
          <div className="footer-item">
            <span className="footer-label">Member Since</span>
            <span className="footer-value">
              {new Date(profile.created_at).toLocaleDateString('en-US', { 
                month: 'short', 
                year: 'numeric' 
              })}
            </span>
          </div>
          {profile.last_login && (
            <div className="footer-item">
              <span className="footer-label">Last Active</span>
              <span className="footer-value">
                {new Date(profile.last_login).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
