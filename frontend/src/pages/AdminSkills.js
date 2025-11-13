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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

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

  // Filter and search logic
  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || skill.category === filterCategory;
    const matchesDifficulty = filterDifficulty === 'all' || skill.difficulty_level === filterDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSkills = filteredSkills.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSkills.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleFilterChange = (type, value) => {
    if (type === 'category') {
      setFilterCategory(value);
    } else if (type === 'difficulty') {
      setFilterDifficulty(value);
    }
    setCurrentPage(1); // Reset to first page on filter change
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

      {/* Search and Filters */}
      <div className="search-filter-container">
        <div className="search-box">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search skills by name or description..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>×</button>
          )}
        </div>

        <div className="filter-group">
          <select 
            value={filterCategory} 
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            <option value="Programming">Programming</option>
            <option value="Design">Design</option>
            <option value="Business">Business</option>
            <option value="Marketing">Marketing</option>
            <option value="Analytics">Analytics</option>
            <option value="Soft Skills">Soft Skills</option>
          </select>

          <select 
            value={filterDifficulty} 
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>

          {(searchTerm || filterCategory !== 'all' || filterDifficulty !== 'all') && (
            <button 
              className="clear-filters-btn"
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('all');
                setFilterDifficulty('all');
              }}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <div className="results-count">
          Showing {currentSkills.length} of {filteredSkills.length} skill{filteredSkills.length !== 1 ? 's' : ''}
          {filteredSkills.length !== skills.length && ` (filtered from ${skills.length} total)`}
        </div>
      )}

      {/* Skills Grid */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading skills...</p>
        </div>
      ) : filteredSkills.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No skills found</h3>
          <p>{searchTerm || filterCategory !== 'all' || filterDifficulty !== 'all' 
            ? 'Try adjusting your search or filters' 
            : 'Add your first skill to get started'}</p>
        </div>
      ) : (
        <div className="skills-grid">
          {currentSkills.map((skill) => (
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

      {/* Pagination */}
      {!loading && filteredSkills.length > itemsPerPage && (
        <div className="pagination">
          <button 
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>
          
          <div className="pagination-numbers">
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              // Show first page, last page, current page, and pages around current
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNumber}
                    className={`pagination-number ${currentPage === pageNumber ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                );
              } else if (
                pageNumber === currentPage - 2 ||
                pageNumber === currentPage + 2
              ) {
                return <span key={pageNumber} className="pagination-ellipsis">...</span>;
              }
              return null;
            })}
          </div>

          <button 
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
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
