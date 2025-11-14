import React, { useState } from 'react';
import './ProfileCard.css';

const ProfileCard = ({ 
  profile, 
  interestsForm, 
  cvData, 
  availableSkills,
  onUpdateBio,
  onUpdateExperience,
  onUpdateEducation,
  onUpdateProject,
  onDeleteExperience,
  onDeleteEducation,
  onDeleteProject,
  onAddExperience,
  onAddEducation,
  onAddProject,
  onUpdateTool,
  onDeleteTool,
  onAddTool
}) => {
  const [editingSection, setEditingSection] = useState(null); // 'bio', 'exp-0', 'edu-1', 'proj-2', 'tool-0', etc.
  const [editForm, setEditForm] = useState({});

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const startEdit = (section, data = {}) => {
    setEditingSection(section);
    setEditForm(data);
  };

  const cancelEdit = () => {
    setEditingSection(null);
    setEditForm({});
  };

  const saveEdit = async (type, index = null) => {
    try {
      if (type === 'bio') {
        await onUpdateBio(editForm.bio || editForm.personal_summary);
      } else if (type === 'experience') {
        if (index !== null) {
          await onUpdateExperience(index, editForm);
        } else {
          await onAddExperience(editForm);
        }
      } else if (type === 'education') {
        if (index !== null) {
          await onUpdateEducation(index, editForm);
        } else {
          await onAddEducation(editForm);
        }
      } else if (type === 'project') {
        if (index !== null) {
          await onUpdateProject(index, editForm);
        } else {
          await onAddProject(editForm);
        }
      } else if (type === 'tool') {
        if (index !== null) {
          await onUpdateTool(index, editForm.tool);
        } else {
          await onAddTool(editForm.tool);
        }
      }
      cancelEdit();
    } catch (err) {
      console.error('Failed to save:', err);
      alert('Failed to save changes: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDelete = async (type, index) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      if (type === 'experience') {
        await onDeleteExperience(index);
      } else if (type === 'education') {
        await onDeleteEducation(index);
      } else if (type === 'project') {
        await onDeleteProject(index);
      } else if (type === 'tool') {
        await onDeleteTool(index);
      }
    } catch (err) {
      console.error('Failed to delete:', err);
      alert('Failed to delete: ' + (err.message || 'Unknown error'));
    }
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

        {/* Bio Section - Editable */}
        {(profile.bio || cvData?.personal_summary) && (
          <div className="card-section bio-section">
            <h3 className="section-title">
              <span className="section-icon">💼</span>
              {cvData?.personal_summary ? 'Professional Summary' : 'About Me'}
              {editingSection !== 'bio' && (
                <button 
                  className="edit-btn-inline"
                  onClick={() => startEdit('bio', { bio: cvData?.personal_summary || profile.bio })}
                  title="Edit bio"
                >
                  ✏️
                </button>
              )}
            </h3>
            
            {editingSection === 'bio' ? (
              <div className="edit-form-inline">
                <textarea
                  value={editForm.bio || ''}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows="4"
                  className="edit-textarea"
                  placeholder="Enter your professional summary..."
                />
                <div className="edit-actions">
                  <button className="save-btn-inline" onClick={() => saveEdit('bio')}>✓ Save</button>
                  <button className="cancel-btn-inline" onClick={cancelEdit}>✕ Cancel</button>
                </div>
              </div>
            ) : (
              <p className="bio-text">{cvData?.personal_summary || profile.bio}</p>
            )}
          </div>
        )}

        {/* Skills Section - Merges profile skills and CV skills */}
        {((profile.skills && profile.skills.length > 0) || (cvData?.skills && cvData.skills.length > 0)) && (
          <div className="card-section skills-section">
            <h3 className="section-title">
              <span className="section-icon">⚡</span>
              Skills & Expertise
              <span className="section-count">
                {(profile.skills?.length || 0) + (cvData?.skills?.length || 0)}
              </span>
            </h3>
            <div className="skills-showcase">
              {/* Profile Skills */}
              {profile.skills?.map((skill) => (
                <div key={`profile-${skill.id}`} className="skill-showcase-item">
                  <span className="skill-name">{skill.name}</span>
                  <span className={`skill-level level-${skill.proficiency_level || 'beginner'}`}>
                    {skill.proficiency_level || 'beginner'}
                  </span>
                </div>
              ))}
              {/* CV Extracted Skills */}
              {cvData?.skills?.map((skillId) => {
                const skill = availableSkills?.find(s => s.id === skillId);
                return skill ? (
                  <div key={`cv-${skillId}`} className="skill-showcase-item">
                    <span className="skill-name">{skill.name}</span>
                    <span className="skill-level level-extracted">
                      from CV
                    </span>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Tools & Technologies - From CV with CRUD */}
        {cvData?.tools && cvData.tools.length > 0 && (
          <div className="card-section tools-section">
            <h3 className="section-title">
              <span className="section-icon">🛠️</span>
              Tools & Technologies
              <span className="section-count">{cvData.tools.length}</span>
              <button 
                className="add-btn-inline"
                onClick={() => startEdit('tool-new', { tool: '' })}
                title="Add tool"
              >
                ➕
              </button>
            </h3>
            <div className="tools-showcase">
              {cvData.tools.map((tool, idx) => (
                <div key={idx} className="tool-showcase-item">
                  {editingSection === `tool-${idx}` ? (
                    <div className="tool-edit-inline">
                      <input
                        type="text"
                        value={editForm.tool || ''}
                        onChange={(e) => setEditForm({ ...editForm, tool: e.target.value })}
                        placeholder="Tool/Technology name"
                        className="tool-edit-input"
                        autoFocus
                      />
                      <button className="tool-save-btn" onClick={() => saveEdit('tool', idx)} title="Save">✓</button>
                      <button className="tool-cancel-btn" onClick={cancelEdit} title="Cancel">✕</button>
                    </div>
                  ) : (
                    <>
                      <span>{tool}</span>
                      <div className="tool-actions">
                        <button 
                          className="tool-edit-btn"
                          onClick={() => startEdit(`tool-${idx}`, { tool })}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button 
                          className="tool-delete-btn"
                          onClick={() => handleDelete('tool', idx)}
                          title="Delete"
                        >
                          ✕
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              
              {/* Add New Tool */}
              {editingSection === 'tool-new' && (
                <div className="tool-showcase-item tool-add-new">
                  <input
                    type="text"
                    value={editForm.tool || ''}
                    onChange={(e) => setEditForm({ ...editForm, tool: e.target.value })}
                    placeholder="Enter tool/technology name"
                    className="tool-edit-input"
                    autoFocus
                  />
                  <button className="tool-save-btn" onClick={() => saveEdit('tool')} title="Add">✓</button>
                  <button className="tool-cancel-btn" onClick={cancelEdit} title="Cancel">✕</button>
                </div>
              )}
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

        {/* Work Experience - From CV with CRUD */}
        {cvData?.experiences && cvData.experiences.length > 0 && (
          <div className="card-section experience-section">
            <h3 className="section-title">
              <span className="section-icon">💼</span>
              Work Experience
              <span className="section-count">{cvData.experiences.length}</span>
              <button 
                className="add-btn-inline"
                onClick={() => startEdit('exp-new', { title: '', company: '', location: '', start_date: '', end_date: '', current: false, description: '' })}
                title="Add experience"
              >
                ➕
              </button>
            </h3>
            <div className="experiences-list">
              {cvData.experiences.map((exp, idx) => (
                <div key={idx} className="experience-item-card">
                  {editingSection === `exp-${idx}` ? (
                    <div className="edit-form-card">
                      <div className="form-row">
                        <input
                          type="text"
                          value={editForm.title || ''}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          placeholder="Job Title"
                          className="edit-input"
                        />
                        <input
                          type="text"
                          value={editForm.company || ''}
                          onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                          placeholder="Company"
                          className="edit-input"
                        />
                      </div>
                      <input
                        type="text"
                        value={editForm.location || ''}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        placeholder="Location"
                        className="edit-input"
                      />
                      <div className="form-row">
                        <input
                          type="text"
                          value={editForm.start_date || ''}
                          onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                          placeholder="Start Date (e.g., Jan 2020)"
                          className="edit-input"
                        />
                        <input
                          type="text"
                          value={editForm.end_date || ''}
                          onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                          placeholder="End Date"
                          className="edit-input"
                          disabled={editForm.current}
                        />
                      </div>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={editForm.current || false}
                          onChange={(e) => setEditForm({ ...editForm, current: e.target.checked, end_date: e.target.checked ? '' : editForm.end_date })}
                        />
                        Currently working here
                      </label>
                      <textarea
                        value={editForm.description || ''}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        placeholder="Job description and responsibilities..."
                        rows="3"
                        className="edit-textarea"
                      />
                      <div className="edit-actions">
                        <button className="save-btn-inline" onClick={() => saveEdit('experience', idx)}>✓ Save</button>
                        <button className="cancel-btn-inline" onClick={cancelEdit}>✕ Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="exp-header">
                        <div className="exp-title-company">
                          <h4 className="exp-title">{exp.title}</h4>
                          <p className="exp-company">{exp.company}</p>
                        </div>
                        <div className="card-actions">
                          {exp.current && <span className="current-badge">Current</span>}
                          <button 
                            className="edit-btn-small"
                            onClick={() => startEdit(`exp-${idx}`, exp)}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button 
                            className="delete-btn-small"
                            onClick={() => handleDelete('experience', idx)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      {exp.location && (
                        <p className="exp-location">📍 {exp.location}</p>
                      )}
                      <p className="exp-dates">
                        {exp.start_date} - {exp.current ? 'Present' : exp.end_date || 'N/A'}
                      </p>
                      {exp.description && (
                        <p className="exp-description">{exp.description}</p>
                      )}
                    </>
                  )}
                </div>
              ))}
              
              {/* Add New Experience Form */}
              {editingSection === 'exp-new' && (
                <div className="experience-item-card">
                  <div className="edit-form-card">
                    <h4 style={{ color: '#06b6d4', marginBottom: '1rem' }}>Add New Experience</h4>
                    <div className="form-row">
                      <input
                        type="text"
                        value={editForm.title || ''}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        placeholder="Job Title"
                        className="edit-input"
                      />
                      <input
                        type="text"
                        value={editForm.company || ''}
                        onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                        placeholder="Company"
                        className="edit-input"
                      />
                    </div>
                    <input
                      type="text"
                      value={editForm.location || ''}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      placeholder="Location"
                      className="edit-input"
                    />
                    <div className="form-row">
                      <input
                        type="text"
                        value={editForm.start_date || ''}
                        onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                        placeholder="Start Date (e.g., Jan 2020)"
                        className="edit-input"
                      />
                      <input
                        type="text"
                        value={editForm.end_date || ''}
                        onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                        placeholder="End Date"
                        className="edit-input"
                        disabled={editForm.current}
                      />
                    </div>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={editForm.current || false}
                        onChange={(e) => setEditForm({ ...editForm, current: e.target.checked, end_date: e.target.checked ? '' : editForm.end_date })}
                      />
                      Currently working here
                    </label>
                    <textarea
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Job description and responsibilities..."
                      rows="3"
                      className="edit-textarea"
                    />
                    <div className="edit-actions">
                      <button className="save-btn-inline" onClick={() => saveEdit('experience')}>✓ Add</button>
                      <button className="cancel-btn-inline" onClick={cancelEdit}>✕ Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Legacy Experience Description */}
        {!cvData?.experiences && profile.experience_description && (
          <div className="card-section experience-section">
            <h3 className="section-title">
              <span className="section-icon">💡</span>
              Professional Experience
            </h3>
            <p className="experience-text">{profile.experience_description}</p>
          </div>
        )}

        {/* Education - From CV with CRUD */}
        {cvData?.education && cvData.education.length > 0 && (
          <div className="card-section education-section">
            <h3 className="section-title">
              <span className="section-icon">🎓</span>
              Education
              <span className="section-count">{cvData.education.length}</span>
              <button 
                className="add-btn-inline"
                onClick={() => startEdit('edu-new', { degree: '', field: '', institution: '', graduation_year: '', gpa: '' })}
                title="Add education"
              >
                ➕
              </button>
            </h3>
            <div className="education-list">
              {cvData.education.map((edu, idx) => (
                <div key={idx} className="education-item-card">
                  {editingSection === `edu-${idx}` ? (
                    <div className="edit-form-card">
                      <input
                        type="text"
                        value={editForm.degree || ''}
                        onChange={(e) => setEditForm({ ...editForm, degree: e.target.value })}
                        placeholder="Degree (e.g., Bachelor of Science)"
                        className="edit-input"
                      />
                      <input
                        type="text"
                        value={editForm.field || ''}
                        onChange={(e) => setEditForm({ ...editForm, field: e.target.value })}
                        placeholder="Field of Study (e.g., Computer Science)"
                        className="edit-input"
                      />
                      <input
                        type="text"
                        value={editForm.institution || ''}
                        onChange={(e) => setEditForm({ ...editForm, institution: e.target.value })}
                        placeholder="Institution Name"
                        className="edit-input"
                      />
                      <div className="form-row">
                        <input
                          type="text"
                          value={editForm.graduation_year || ''}
                          onChange={(e) => setEditForm({ ...editForm, graduation_year: e.target.value })}
                          placeholder="Graduation Year"
                          className="edit-input"
                        />
                        <input
                          type="text"
                          value={editForm.gpa || ''}
                          onChange={(e) => setEditForm({ ...editForm, gpa: e.target.value })}
                          placeholder="GPA (optional)"
                          className="edit-input"
                        />
                      </div>
                      <div className="edit-actions">
                        <button className="save-btn-inline" onClick={() => saveEdit('education', idx)}>✓ Save</button>
                        <button className="cancel-btn-inline" onClick={cancelEdit}>✕ Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="edu-header-actions">
                        <div>
                          <h4 className="edu-degree">{edu.degree}</h4>
                          {edu.field && <p className="edu-field">{edu.field}</p>}
                        </div>
                        <div className="card-actions">
                          <button 
                            className="edit-btn-small"
                            onClick={() => startEdit(`edu-${idx}`, edu)}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button 
                            className="delete-btn-small"
                            onClick={() => handleDelete('education', idx)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <p className="edu-institution">{edu.institution}</p>
                      <div className="edu-details">
                        {edu.graduation_year && (
                          <span className="edu-year">🎓 {edu.graduation_year}</span>
                        )}
                        {edu.gpa && (
                          <span className="edu-gpa">GPA: {edu.gpa}</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
              
              {/* Add New Education Form */}
              {editingSection === 'edu-new' && (
                <div className="education-item-card">
                  <div className="edit-form-card">
                    <h4 style={{ color: '#3b82f6', marginBottom: '1rem' }}>Add New Education</h4>
                    <input
                      type="text"
                      value={editForm.degree || ''}
                      onChange={(e) => setEditForm({ ...editForm, degree: e.target.value })}
                      placeholder="Degree (e.g., Bachelor of Science)"
                      className="edit-input"
                    />
                    <input
                      type="text"
                      value={editForm.field || ''}
                      onChange={(e) => setEditForm({ ...editForm, field: e.target.value })}
                      placeholder="Field of Study (e.g., Computer Science)"
                      className="edit-input"
                    />
                    <input
                      type="text"
                      value={editForm.institution || ''}
                      onChange={(e) => setEditForm({ ...editForm, institution: e.target.value })}
                      placeholder="Institution Name"
                      className="edit-input"
                    />
                    <div className="form-row">
                      <input
                        type="text"
                        value={editForm.graduation_year || ''}
                        onChange={(e) => setEditForm({ ...editForm, graduation_year: e.target.value })}
                        placeholder="Graduation Year"
                        className="edit-input"
                      />
                      <input
                        type="text"
                        value={editForm.gpa || ''}
                        onChange={(e) => setEditForm({ ...editForm, gpa: e.target.value })}
                        placeholder="GPA (optional)"
                        className="edit-input"
                      />
                    </div>
                    <div className="edit-actions">
                      <button className="save-btn-inline" onClick={() => saveEdit('education')}>✓ Add</button>
                      <button className="cancel-btn-inline" onClick={cancelEdit}>✕ Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Projects - From CV with CRUD */}
        {cvData?.projects && cvData.projects.length > 0 && (
          <div className="card-section projects-section">
            <h3 className="section-title">
              <span className="section-icon">🚀</span>
              Projects
              <span className="section-count">{cvData.projects.length}</span>
              <button 
                className="add-btn-inline"
                onClick={() => startEdit('proj-new', { name: '', description: '', technologies: '', link: '' })}
                title="Add project"
              >
                ➕
              </button>
            </h3>
            <div className="projects-list">
              {cvData.projects.map((project, idx) => (
                <div key={idx} className="project-item-card">
                  {editingSection === `proj-${idx}` ? (
                    <div className="edit-form-card">
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Project Name"
                        className="edit-input"
                      />
                      <input
                        type="text"
                        value={editForm.link || ''}
                        onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
                        placeholder="Project Link (optional)"
                        className="edit-input"
                      />
                      <textarea
                        value={editForm.description || ''}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        placeholder="Project description..."
                        rows="3"
                        className="edit-textarea"
                      />
                      <input
                        type="text"
                        value={editForm.technologies || ''}
                        onChange={(e) => setEditForm({ ...editForm, technologies: e.target.value })}
                        placeholder="Technologies (comma-separated, e.g., React, Node.js, MongoDB)"
                        className="edit-input"
                      />
                      <div className="edit-actions">
                        <button className="save-btn-inline" onClick={() => saveEdit('project', idx)}>✓ Save</button>
                        <button className="cancel-btn-inline" onClick={cancelEdit}>✕ Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="project-header">
                        <h4 className="project-name">{project.name}</h4>
                        <div className="card-actions">
                          {project.link && (
                            <a 
                              href={project.link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="project-link"
                              title="View project"
                            >
                              🔗
                            </a>
                          )}
                          <button 
                            className="edit-btn-small"
                            onClick={() => startEdit(`proj-${idx}`, project)}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button 
                            className="delete-btn-small"
                            onClick={() => handleDelete('project', idx)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      {project.description && (
                        <p className="project-description">{project.description}</p>
                      )}
                      {project.technologies && (
                        <div className="project-tech">
                          <strong>Tech:</strong> {project.technologies}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
              
              {/* Add New Project Form */}
              {editingSection === 'proj-new' && (
                <div className="project-item-card">
                  <div className="edit-form-card">
                    <h4 style={{ color: '#a78bfa', marginBottom: '1rem' }}>Add New Project</h4>
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Project Name"
                      className="edit-input"
                    />
                    <input
                      type="text"
                      value={editForm.link || ''}
                      onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
                      placeholder="Project Link (optional)"
                      className="edit-input"
                    />
                    <textarea
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Project description..."
                      rows="3"
                      className="edit-textarea"
                    />
                    <input
                      type="text"
                      value={editForm.technologies || ''}
                      onChange={(e) => setEditForm({ ...editForm, technologies: e.target.value })}
                      placeholder="Technologies (comma-separated, e.g., React, Node.js, MongoDB)"
                      className="edit-input"
                    />
                    <div className="edit-actions">
                      <button className="save-btn-inline" onClick={() => saveEdit('project')}>✓ Add</button>
                      <button className="cancel-btn-inline" onClick={cancelEdit}>✕ Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
