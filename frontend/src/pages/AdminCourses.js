import React, { useState, useEffect } from 'react';
import { coursesAPI, skillsAPI } from '../services/api';
import './AdminCourses.css';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    platform: '',
    url: '',
    cost_type: 'free',
    description: '',
    thumbnail_url: '',
    related_skills: [],
    is_active: true
  });
  const [alert, setAlert] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewingCourse, setViewingCourse] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterCostType, setFilterCostType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesData, skillsData] = await Promise.all([
        coursesAPI.list(),
        skillsAPI.list()
      ]);
      setCourses(coursesData);
      setSkills(skillsData);
    } catch (error) {
      console.error('Error loading data:', error);
      showAlert('error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Filter and search logic
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = filterPlatform === 'all' || course.platform.toLowerCase() === filterPlatform.toLowerCase();
    const matchesCostType = filterCostType === 'all' || course.cost_type === filterCostType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && course.is_active) ||
                         (filterStatus === 'inactive' && !course.is_active);
    
    return matchesSearch && matchesPlatform && matchesCostType && matchesStatus;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (type, value) => {
    if (type === 'platform') {
      setFilterPlatform(value);
    } else if (type === 'costType') {
      setFilterCostType(value);
    } else if (type === 'status') {
      setFilterStatus(value);
    }
    setCurrentPage(1);
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSkillToggle = (skillId) => {
    setFormData(prev => ({
      ...prev,
      related_skills: prev.related_skills.includes(skillId)
        ? prev.related_skills.filter(id => id !== skillId)
        : [...prev.related_skills, skillId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.platform || !formData.url) {
      showAlert('error', 'Please fill in all required fields');
      return;
    }

    try {
      const courseData = {
        title: formData.title,
        platform: formData.platform,
        url: formData.url,
        cost_type: formData.cost_type,
        description: formData.description || null,
        thumbnail_url: formData.thumbnail_url || null,
        related_skills: formData.related_skills.length > 0 ? formData.related_skills : [],
        is_active: formData.is_active
      };
      
      console.log('Sending course data:', courseData);

      if (editingCourse) {
        await coursesAPI.update(editingCourse.id, courseData);
        showAlert('success', 'Course updated successfully!');
      } else {
        await coursesAPI.create(courseData);
        showAlert('success', 'Course created successfully!');
      }

      setShowModal(false);
      setEditingCourse(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving course:', error);
      console.error('Error response data:', JSON.stringify(error.response?.data, null, 2));
      
      let errorMessage = 'Failed to save course';
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (Array.isArray(detail)) {
          errorMessage = detail.map(err => `${err.loc?.join('.')||'field'}: ${err.msg || err.message}`).join(', ');
        } else if (typeof detail === 'string') {
          errorMessage = detail;
        }
      }
      
      showAlert('error', errorMessage);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      platform: course.platform,
      url: course.url,
      cost_type: course.cost_type,
      description: course.description || '',
      thumbnail_url: course.thumbnail_url || '',
      related_skills: course.related_skills ? JSON.parse(course.related_skills) : [],
      is_active: course.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (courseId) => {
    try {
      await coursesAPI.delete(courseId);
      showAlert('success', 'Course deleted successfully!');
      setDeleteConfirm(null);
      loadData();
    } catch (error) {
      console.error('Error deleting course:', error);
      showAlert('error', 'Failed to delete course');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      platform: '',
      url: '',
      cost_type: 'free',
      description: '',
      thumbnail_url: '',
      related_skills: [],
      is_active: true
    });
  };

  const openCreateModal = () => {
    resetForm();
    setEditingCourse(null);
    setShowModal(true);
  };

  const getPlatforms = () => {
    const platforms = [...new Set(courses.map(c => c.platform))];
    return platforms.sort();
  };

  return (
    <div className="admin-courses-container">
      {/* Header */}
      <div className="admin-courses-header">
        <div>
          <h1>Courses Management</h1>
          <p>Manage learning resources for the platform</p>
        </div>
        <button className="btn-add-course" onClick={openCreateModal}>
          <span>+</span>
          Add New Course
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
            placeholder="Search courses by title, platform, or description..."
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
            value={filterPlatform} 
            onChange={(e) => handleFilterChange('platform', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Platforms</option>
            {getPlatforms().map(platform => (
              <option key={platform} value={platform}>{platform}</option>
            ))}
          </select>

          <select 
            value={filterCostType} 
            onChange={(e) => handleFilterChange('costType', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>

          <select 
            value={filterStatus} 
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {(searchTerm || filterPlatform !== 'all' || filterCostType !== 'all' || filterStatus !== 'all') && (
            <button 
              className="clear-filters-btn"
              onClick={() => {
                setSearchTerm('');
                setFilterPlatform('all');
                setFilterCostType('all');
                setFilterStatus('all');
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
          Showing {currentCourses.length} of {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
          {filteredCourses.length !== courses.length && ` (filtered from ${courses.length} total)`}
        </div>
      )}

      {/* Courses List */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading courses...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>No courses found</h3>
          <p>{searchTerm || filterPlatform !== 'all' || filterCostType !== 'all' || filterStatus !== 'all'
            ? 'Try adjusting your search or filters' 
            : 'Create your first course to get started'}</p>
        </div>
      ) : (
        <div className="courses-grid">
          {currentCourses.map((course) => (
            <div 
              key={course.id} 
              className={`course-card-compact ${!course.is_active ? 'inactive' : ''}`}
              onClick={() => setViewingCourse(course)}
            >
              <div className="course-card-compact-header">
                {course.thumbnail_url && (
                  <img src={course.thumbnail_url} alt={course.title} className="course-thumbnail-compact" />
                )}
                <div className="course-card-compact-info">
                  <h3 className="course-title-compact">{course.title}</h3>
                  <p className="platform-name-compact">{course.platform}</p>
                </div>
                {!course.is_active && (
                  <span className="inactive-badge-compact">Inactive</span>
                )}
              </div>

              <div className="course-card-compact-meta">
                <div className="meta-item-compact">
                  <span className="meta-icon">🌐</span>
                  <span>{course.platform}</span>
                </div>
                <div className="meta-item-compact">
                  <span className="meta-icon">{course.cost_type === 'free' ? '🆓' : '💰'}</span>
                  <span>{course.cost_type === 'free' ? 'Free' : 'Paid'}</span>
                </div>
              </div>

              {course.related_skills && JSON.parse(course.related_skills).length > 0 && (
                <div className="course-skills-compact">
                  {JSON.parse(course.related_skills).slice(0, 3).map((skillId) => {
                    const skill = skills.find(s => s.id === skillId);
                    return skill ? (
                      <span key={skillId} className="skill-tag-compact">{skill.name}</span>
                    ) : null;
                  })}
                  {JSON.parse(course.related_skills).length > 3 && (
                    <span className="skill-tag-compact more">+{JSON.parse(course.related_skills).length - 3}</span>
                  )}
                </div>
              )}

              <div className="course-card-compact-footer">
                <div className="course-stats-compact">
                  <span>👁️ {course.views_count}</span>
                  <span>👥 {course.enrollment_count}</span>
                </div>
                <div className="course-card-compact-actions" onClick={(e) => e.stopPropagation()}>
                  <button className="btn-icon" onClick={() => handleEdit(course)} title="Edit">
                    ✏️
                  </button>
                  <button className="btn-icon" onClick={() => setDeleteConfirm(course)} title="Delete">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredCourses.length > itemsPerPage && (
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCourse ? 'Edit Course' : 'Add New Course'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="course-form">
              <div className="form-section">
                <h3>Basic Information</h3>
                
                <div className="form-group">
                  <label>Course Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Complete Python Bootcamp"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Platform *</label>
                    <input
                      type="text"
                      name="platform"
                      value={formData.platform}
                      onChange={handleInputChange}
                      placeholder="e.g., YouTube, Coursera, Udemy"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Cost Type *</label>
                    <select name="cost_type" value={formData.cost_type} onChange={handleInputChange} required>
                      <option value="free">Free</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Course URL *</label>
                  <input
                    type="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/course"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Thumbnail URL</label>
                  <input
                    type="url"
                    name="thumbnail_url"
                    value={formData.thumbnail_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/thumbnail.jpg"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe what students will learn in this course..."
                    rows="4"
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Related Skills</h3>
                <div className="skills-selection">
                  {skills.map((skill) => (
                    <label key={skill.id} className="skill-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.related_skills.includes(skill.id)}
                        onChange={() => handleSkillToggle(skill.id)}
                      />
                      <span>{skill.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                    />
                    <span>Course is active</span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingCourse ? 'Update Course' : 'Add Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Details Modal */}
      {viewingCourse && (
        <div className="modal-overlay" onClick={() => setViewingCourse(null)}>
          <div className="modal-content modal-large course-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="course-details-header">
                {viewingCourse.thumbnail_url && (
                  <img src={viewingCourse.thumbnail_url} alt={viewingCourse.title} className="course-thumbnail-large" />
                )}
                <div>
                  <h2>{viewingCourse.title}</h2>
                  <p className="platform-name-large">{viewingCourse.platform}</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setViewingCourse(null)}>×</button>
            </div>

            <div className="course-details-content">
              <div className="course-details-meta-grid">
                <div className="meta-detail-item">
                  <span className="meta-label">🌐 Platform</span>
                  <span className="meta-value">{viewingCourse.platform}</span>
                </div>
                <div className="meta-detail-item">
                  <span className="meta-label">💰 Cost</span>
                  <span className="meta-value">{viewingCourse.cost_type === 'free' ? 'Free' : 'Paid'}</span>
                </div>
                <div className="meta-detail-item">
                  <span className="meta-label">🔗 URL</span>
                  <span className="meta-value">
                    <a href={viewingCourse.url} target="_blank" rel="noopener noreferrer">View Course</a>
                  </span>
                </div>
              </div>

              {viewingCourse.description && (
                <div className="course-detail-section">
                  <h3>Description</h3>
                  <p>{viewingCourse.description}</p>
                </div>
              )}

              {viewingCourse.related_skills && JSON.parse(viewingCourse.related_skills).length > 0 && (
                <div className="course-detail-section">
                  <h3>Related Skills</h3>
                  <div className="course-skills-detail">
                    {JSON.parse(viewingCourse.related_skills).map((skillId) => {
                      const skill = skills.find(s => s.id === skillId);
                      return skill ? (
                        <span key={skillId} className="skill-tag">{skill.name}</span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              <div className="course-details-stats">
                <div className="stat-item">
                  <span className="stat-icon">👁️</span>
                  <div>
                    <span className="stat-number">{viewingCourse.views_count}</span>
                    <span className="stat-label">Views</span>
                  </div>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">👥</span>
                  <div>
                    <span className="stat-number">{viewingCourse.enrollment_count}</span>
                    <span className="stat-label">Enrollments</span>
                  </div>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">📅</span>
                  <div>
                    <span className="stat-number">{new Date(viewingCourse.created_at).toLocaleDateString()}</span>
                    <span className="stat-label">Added</span>
                  </div>
                </div>
              </div>

              <div className="course-details-actions">
                <button className="btn-edit-large" onClick={() => { setViewingCourse(null); handleEdit(viewingCourse); }}>
                  ✏️ Edit Course
                </button>
                <button className="btn-delete-large" onClick={() => { setViewingCourse(null); setDeleteConfirm(viewingCourse); }}>
                  🗑️ Delete Course
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Course</h2>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>×</button>
            </div>

            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{deleteConfirm.title}</strong> from {deleteConfirm.platform}?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button type="button" className="btn-delete" onClick={() => handleDelete(deleteConfirm.id)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;
