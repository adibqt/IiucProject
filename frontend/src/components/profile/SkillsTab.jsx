/**
 * Skills Tab Component
 */
import React, { useState } from "react";

const SkillsTab = ({
  profile,
  availableSkills,
  selectedSkillId,
  setSelectedSkillId,
  proficiencyLevel,
  setProficiencyLevel,
  onAddSkill,
  onRemoveSkill,
  onSuggestSkill,
}) => {
  const [showCustomSkill, setShowCustomSkill] = useState(false);
  const [customSkillName, setCustomSkillName] = useState("");
  const [customSkillCategory, setCustomSkillCategory] = useState("Other");

  const handleSuggestSkill = async () => {
    if (!customSkillName.trim()) {
      alert("Please enter a skill name");
      return;
    }
    
    await onSuggestSkill({
      skill_name: customSkillName,
      category: customSkillCategory,
      proficiency_level: proficiencyLevel
    });
    
    // Reset form
    setCustomSkillName("");
    setCustomSkillCategory("Other");
    setShowCustomSkill(false);
  };

  return (
    <div className="tab-panel">
      <h2>Skills</h2>
      <div className="skills-section">
        <div className="add-skill">
          <h3>Add a Skill</h3>
          
          {!showCustomSkill ? (
            <>
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
              
              <div className="custom-skill-toggle">
                <p className="toggle-text">Can't find your skill?</p>
                <button
                  type="button"
                  onClick={() => setShowCustomSkill(true)}
                  className="toggle-btn"
                >
                  ✨ Suggest a New Skill
                </button>
              </div>
            </>
          ) : (
            <div className="custom-skill-form">
              <div className="form-header">
                <h4>✨ Suggest a New Skill</h4>
                <button
                  type="button"
                  onClick={() => setShowCustomSkill(false)}
                  className="close-btn"
                >
                  ✕
                </button>
              </div>
              
              <div className="custom-skill-inputs">
                <div className="input-row">
                  <div className="input-group">
                    <label>Skill Name *</label>
                    <input
                      type="text"
                      value={customSkillName}
                      onChange={(e) => setCustomSkillName(e.target.value)}
                      placeholder="e.g., React Native, TensorFlow, etc."
                      maxLength={100}
                    />
                  </div>
                  
                  <div className="input-group">
                    <label>Category</label>
                    <select
                      value={customSkillCategory}
                      onChange={(e) => setCustomSkillCategory(e.target.value)}
                    >
                      <option value="Programming">Programming</option>
                      <option value="Design">Design</option>
                      <option value="Business">Business</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Data Science">Data Science</option>
                      <option value="DevOps">DevOps</option>
                      <option value="Mobile Development">Mobile Development</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="input-group">
                    <label>Your Level</label>
                    <select
                      value={proficiencyLevel}
                      onChange={(e) => setProficiencyLevel(e.target.value)}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                </div>
                
                <div className="action-buttons">
                  <button
                    type="button"
                    onClick={handleSuggestSkill}
                    className="home-btn home-btn-primary"
                  >
                    ✨ Add New Skill
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustomSkill(false)}
                    className="home-btn home-btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              
              <p className="info-text">
                💡 This skill will be added to the database and your profile
              </p>
            </div>
          )}
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

