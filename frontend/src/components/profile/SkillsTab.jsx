/**
 * Skills Tab Component
 */
import React from "react";

const SkillsTab = ({
  profile,
  availableSkills,
  selectedSkillId,
  setSelectedSkillId,
  proficiencyLevel,
  setProficiencyLevel,
  onAddSkill,
  onRemoveSkill,
}) => {
  return (
    <div className="tab-panel">
      <h2>Skills</h2>
      <div className="skills-section">
        <div className="add-skill">
          <h3>Add a Skill</h3>
          <div className="skill-input-group">
            <select
              value={selectedSkillId}
              onChange={(e) => setSelectedSkillId(e.target.value)}
            >
              <option value="">Select a skill...</option>
              {availableSkills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name}
                </option>
              ))}
            </select>
            <select
              value={proficiencyLevel}
              onChange={(e) => setProficiencyLevel(e.target.value)}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
            <button
              type="button"
              onClick={onAddSkill}
              className="home-btn home-btn-primary"
            >
              Add Skill
            </button>
          </div>
        </div>

        <div className="my-skills">
          <h3>Your Skills</h3>
          {profile?.skills && profile.skills.length > 0 ? (
            <div className="skills-grid">
              {profile.skills.map((skill) => (
                <div key={skill.id} className="skill-tag">
                  <span>{skill.name}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveSkill(skill.id)}
                    className="skill-remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message">No skills added yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillsTab;
