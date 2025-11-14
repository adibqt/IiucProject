/**
 * Experience Tab Component
 */
import React from "react";

const ExperienceTab = ({ experienceForm, setExperienceForm, onSubmit }) => {
  return (
    <div className="tab-panel">
      <h2>Work Experience</h2>
      <p className="tab-description">
        Describe your relevant work experience and projects
      </p>
      <form onSubmit={onSubmit} className="profile-form">
        <div className="form-group">
          <label>Experience Description</label>
          <textarea
            value={experienceForm}
            onChange={(e) => setExperienceForm(e.target.value)}
            placeholder="Tell us about your work experience, projects, and achievements..."
            rows="8"
          />
        </div>
        <button type="submit" className="home-btn home-btn-primary">
          Save Experience
        </button>
      </form>
    </div>
  );
};

export default ExperienceTab;
