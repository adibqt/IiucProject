import React, { useState, useEffect } from 'react';
import { skillsAPI } from '../services/api';
import './AdminSkills.css';

const AdminSkills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSkill, setNewSkill] = useState({
    name: '',
    slug: '',
    description: '',
    category: 'Programming',
    difficulty_level: 'beginner',
    estimated_learning_hours: ''
  });
  const [alert, setAlert] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      setLoading(true);
      const data = await skillsAPI.list();
      setSkills(data);
    } catch (error) {
      console.error('Error loading skills:', error);
      showAlert('error', 'Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSkill(prev => ({
      ...prev,
      [name]: value,
      // Auto-generate slug from name
      ...(name === 'name' ? { slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-') } : {})
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newSkill.name || !newSkill.slug) {
      showAlert('error', 'Name and slug are required');
      return;
    }

    try {
      const skillData = {
        ...newSkill,
        estimated_learning_hours: newSkill.estimated_learning_hours ? parseInt(newSkill.estimated_learning_hours) : null
      };

      await skillsAPI.create(skillData);
      showAlert('success', 'Skill created successfully!');
      setShowAddModal(false);
      setNewSkill({
        name: '',
        slug: '',
        description: '',
        category: 'Programming',
        difficulty_level: 'beginner',
        estimated_learning_hours: ''
      });
      loadSkills();
    } catch (error) {
      console.error('Error creating skill:', error);
      showAlert('error', error.response?.data?.detail || 'Failed to create skill');
    }
  };

  const handleDelete = async (skillId) => {
    try {
      await skillsAPI.delete(skillId);
      showAlert('success', 'Skill deleted successfully!');
      setDeleteConfirm(null);
      loadSkills();
    } catch (error) {
      console.error('Error deleting skill:', error);
      showAlert('error', 'Failed to delete skill');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Programming': '#3b82f6',
      'Design': '#8b5cf6',
      'Business': '#10b981',
      'Marketing': '#f59e0b',
      'Analytics': '#06b6d4',
      'Soft Skills': '#ec4899'
    };
    return colors[category] || '#6b7280';
  };

  const getDifficultyBadge = (level) => {
    const badges = {
      'beginner': { color: '#10b981', label: 'Beginner' },
      'intermediate': { color: '#f59e0b', label: 'Intermediate' },
      'advanced': { color: '#ef4444', label: 'Advanced' },
      'expert': { color: '#8b5cf6', label: 'Expert' }
    };
    return badges[level] || badges['beginner'];
  };

  return (
    <div className="admin-skills-container">
      {/* Header */}
      <div className="admin-skills-header">
        <div>
          <h1>Skills Management</h1>
          <p>Manage skills that users can learn and are required for jobs</p>
        </div>
        <button 
          className="btn-add-skill"
          onClick={() => setShowAddModal(true)}
        >
          <span>+</span>
          Add New Skill
        </button>
      </div>

      {/* Alert */}
      {alert && (
        <div className={`admin-alert ${alert.type}`}>
          <span>{alert.type === 'success' ? '✓' : '⚠'}</span>
          <span>{alert.message}</span>
          <button onClick={() => setAlert(null)}>×</button>
        </div>
      )}

      {/* Skills Grid */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading skills...</p>
        </div>
      ) : skills.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>No skills yet</h3>
          <p>Add your first skill to get started</p>
        </div>
      ) : (
        <div className="skills-grid">
          {skills.map((skill) => (
            <div key={skill.id} className="skill-card">
              <div className="skill-card-header">
                <div 
                  className="skill-category-badge"
                  style={{ backgroundColor: getCategoryColor(skill.category) }}
                >
                  {skill.category}
                </div>
                <button 
                  className="btn-delete-skill"
                  onClick={() => setDeleteConfirm(skill)}
                  title="Delete skill"
                >
                  🗑️
                </button>
              </div>

              <h3 className="skill-name">{skill.name}</h3>
              
              {skill.description && (
                <p className="skill-description">{skill.description}</p>
              )}

              <div className="skill-meta">
                <div 
                  className="difficulty-badge"
                  style={{ backgroundColor: getDifficultyBadge(skill.difficulty_level).color }}
                >
                  {getDifficultyBadge(skill.difficulty_level).label}
                </div>
                {skill.estimated_learning_hours && (
                  <div className="learning-hours">
                    ⏱️ {skill.estimated_learning_hours}h
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Skill Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Skill</h2>
              <button 
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="skill-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Skill Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={newSkill.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Node.js"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Slug *</label>
                  <input
                    type="text"
                    name="slug"
                    value={newSkill.slug}
                    onChange={handleInputChange}
                    placeholder="e.g., nodejs"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={newSkill.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of the skill"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={newSkill.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Programming">Programming</option>
                    <option value="Design">Design</option>
                    <option value="Business">Business</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Analytics">Analytics</option>
                    <option value="Soft Skills">Soft Skills</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Difficulty Level *</label>
                  <select
                    name="difficulty_level"
                    value={newSkill.difficulty_level}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Estimated Learning Hours</label>
                <input
                  type="number"
                  name="estimated_learning_hours"
                  value={newSkill.estimated_learning_hours}
                  onChange={handleInputChange}
                  placeholder="e.g., 40"
                  min="1"
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Create Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Skill</h2>
              <button 
                className="modal-close"
                onClick={() => setDeleteConfirm(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-delete"
                onClick={() => handleDelete(deleteConfirm.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSkills;
