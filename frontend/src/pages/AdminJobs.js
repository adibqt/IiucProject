import React, { useState, useEffect } from 'react';
import { jobsAPI, skillsAPI } from '../services/api';
import './AdminJobs.css';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    company_name: '',
    company_logo: '',
    description: '',
    requirements: '',
    responsibilities: '',
    location: '',
    job_type: 'full-time',
    experience_level: 'entry',
    salary_range: '',
    required_skills: [],
    application_url: '',
    application_email: '',
    application_deadline: '',
    is_active: true
  });
  const [alert, setAlert] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewingJob, setViewingJob] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJobType, setFilterJobType] = useState('all');
  const [filterExperience, setFilterExperience] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsData, skillsData] = await Promise.all([
        jobsAPI.list(),
        skillsAPI.list()
      ]);
      setJobs(jobsData);
      setSkills(skillsData);
    } catch (error) {
      console.error('Error loading data:', error);
      showAlert('error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Filter and search logic
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJobType = filterJobType === 'all' || job.job_type === filterJobType;
    const matchesExperience = filterExperience === 'all' || job.experience_level === filterExperience;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && job.is_active) ||
                         (filterStatus === 'inactive' && !job.is_active);
    
    return matchesSearch && matchesJobType && matchesExperience && matchesStatus;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (type, value) => {
    if (type === 'jobType') {
      setFilterJobType(value);
    } else if (type === 'experience') {
      setFilterExperience(value);
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
      required_skills: prev.required_skills.includes(skillId)
        ? prev.required_skills.filter(id => id !== skillId)
        : [...prev.required_skills, skillId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.company_name || !formData.description || !formData.location) {
      showAlert('error', 'Please fill in all required fields');
      return;
    }

    try {
      // Clean up the data - convert empty strings to null for optional fields
      const jobData = {
        title: formData.title,
        company_name: formData.company_name,
        description: formData.description,
        location: formData.location,
        job_type: formData.job_type,
        experience_level: formData.experience_level,
        company_logo: formData.company_logo || null,
        requirements: formData.requirements || null,
        responsibilities: formData.responsibilities || null,
        salary_range: formData.salary_range || null,
        required_skills: formData.required_skills.length > 0 ? JSON.stringify(formData.required_skills) : null,
        application_url: formData.application_url || null,
        application_email: formData.application_email || null,
        application_deadline: formData.application_deadline || null,
        is_active: formData.is_active
      };
      
      console.log('Sending job data:', jobData);

      if (editingJob) {
        await jobsAPI.update(editingJob.id, jobData);
        showAlert('success', 'Job updated successfully!');
      } else {
        await jobsAPI.create(jobData);
        showAlert('success', 'Job created successfully!');
      }

      setShowModal(false);
      setEditingJob(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving job:', error);
      console.error('Error response data:', JSON.stringify(error.response?.data, null, 2));
      
      // Handle validation errors
      let errorMessage = 'Failed to save job';
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        console.log('Validation errors:', detail);
        if (Array.isArray(detail)) {
          // Format validation errors
          errorMessage = detail.map(err => `${err.loc?.join('.')||'field'}: ${err.msg || err.message}`).join(', ');
        } else if (typeof detail === 'string') {
          errorMessage = detail;
        }
      }
      
      showAlert('error', errorMessage);
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      company_name: job.company_name,
      company_logo: job.company_logo || '',
      description: job.description,
      requirements: job.requirements || '',
      responsibilities: job.responsibilities || '',
      location: job.location,
      job_type: job.job_type,
      experience_level: job.experience_level,
      salary_range: job.salary_range || '',
      required_skills: job.required_skills ? JSON.parse(job.required_skills) : [],
      application_url: job.application_url || '',
      application_email: job.application_email || '',
      application_deadline: job.application_deadline ? job.application_deadline.split('T')[0] : '',
      is_active: job.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (jobId) => {
    try {
      await jobsAPI.delete(jobId);
      showAlert('success', 'Job deleted successfully!');
      setDeleteConfirm(null);
      loadData();
    } catch (error) {
      console.error('Error deleting job:', error);
      showAlert('error', 'Failed to delete job');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      company_name: '',
      company_logo: '',
      description: '',
      requirements: '',
      responsibilities: '',
      location: '',
      job_type: 'full-time',
      experience_level: 'entry',
      salary_range: '',
      required_skills: [],
      application_url: '',
      application_email: '',
      application_deadline: '',
      is_active: true
    });
  };

  const openCreateModal = () => {
    resetForm();
    setEditingJob(null);
    setShowModal(true);
  };

  const getJobTypeLabel = (type) => {
    const labels = {
      'full-time': 'Full-time',
      'part-time': 'Part-time',
      'contract': 'Contract',
      'internship': 'Internship',
      'freelance': 'Freelance'
    };
    return labels[type] || type;
  };

  const getExperienceLabel = (level) => {
    const labels = {
      'entry': 'Entry Level',
      'mid': 'Mid Level',
      'senior': 'Senior Level'
    };
    return labels[level] || level;
  };

  return (
    <div className="admin-jobs-container">
      {/* Header */}
      <div className="admin-jobs-header">
        <div>
          <h1>Jobs Management</h1>
          <p>Manage job postings for the platform</p>
        </div>
        <button className="btn-add-job" onClick={openCreateModal}>
          <span>+</span>
          Post New Job
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
            placeholder="Search jobs by title, company, or location..."
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
            value={filterJobType} 
            onChange={(e) => handleFilterChange('jobType', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Job Types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
            <option value="freelance">Freelance</option>
          </select>

          <select 
            value={filterExperience} 
            onChange={(e) => handleFilterChange('experience', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Levels</option>
            <option value="entry">Entry Level</option>
            <option value="mid">Mid Level</option>
            <option value="senior">Senior Level</option>
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

          {(searchTerm || filterJobType !== 'all' || filterExperience !== 'all' || filterStatus !== 'all') && (
            <button 
              className="clear-filters-btn"
              onClick={() => {
                setSearchTerm('');
                setFilterJobType('all');
                setFilterExperience('all');
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
          Showing {currentJobs.length} of {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
          {filteredJobs.length !== jobs.length && ` (filtered from ${jobs.length} total)`}
        </div>
      )}

      {/* Jobs List */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading jobs...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No jobs found</h3>
          <p>{searchTerm || filterJobType !== 'all' || filterExperience !== 'all' || filterStatus !== 'all'
            ? 'Try adjusting your search or filters' 
            : 'Create your first job posting to get started'}</p>
        </div>
      ) : (
        <div className="jobs-grid">
          {currentJobs.map((job) => (
            <div 
              key={job.id} 
              className={`job-card-compact ${!job.is_active ? 'inactive' : ''}`}
              onClick={() => setViewingJob(job)}
            >
              <div className="job-card-compact-header">
                {job.company_logo && (
                  <img src={job.company_logo} alt={job.company_name} className="company-logo-compact" />
                )}
                <div className="job-card-compact-info">
                  <h3 className="job-title-compact">{job.title}</h3>
                  <p className="company-name-compact">{job.company_name}</p>
                </div>
                {!job.is_active && (
                  <span className="inactive-badge-compact">Inactive</span>
                )}
              </div>

              <div className="job-card-compact-meta">
                <div className="meta-item-compact">
                  <span className="meta-icon">📍</span>
                  <span>{job.location}</span>
                </div>
                <div className="meta-item-compact">
                  <span className="meta-icon">💼</span>
                  <span>{getJobTypeLabel(job.job_type)}</span>
                </div>
                <div className="meta-item-compact">
                  <span className="meta-icon">📊</span>
                  <span>{getExperienceLabel(job.experience_level)}</span>
                </div>
              </div>

              {job.required_skills && JSON.parse(job.required_skills).length > 0 && (
                <div className="job-skills-compact">
                  {JSON.parse(job.required_skills).slice(0, 3).map((skillId) => {
                    const skill = skills.find(s => s.id === skillId);
                    return skill ? (
                      <span key={skillId} className="skill-tag-compact">{skill.name}</span>
                    ) : null;
                  })}
                  {JSON.parse(job.required_skills).length > 3 && (
                    <span className="skill-tag-compact more">+{JSON.parse(job.required_skills).length - 3}</span>
                  )}
                </div>
              )}

              <div className="job-card-compact-footer">
                <div className="job-stats-compact">
                  <span>👁️ {job.views_count}</span>
                  <span>📝 {job.applications_count}</span>
                </div>
                <div className="job-card-compact-actions" onClick={(e) => e.stopPropagation()}>
                  <button className="btn-icon" onClick={() => handleEdit(job)} title="Edit">
                    ✏️
                  </button>
                  <button className="btn-icon" onClick={() => setDeleteConfirm(job)} title="Delete">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredJobs.length > itemsPerPage && (
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingJob ? 'Edit Job' : 'Post New Job'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="job-form">
              <div className="form-section">
                <h3>Basic Information</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Job Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Senior React Developer"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Company Name *</label>
                    <input
                      type="text"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleInputChange}
                      placeholder="e.g., Tech Corp"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Company Logo URL</label>
                  <input
                    type="url"
                    name="company_logo"
                    value={formData.company_logo}
                    onChange={handleInputChange}
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div className="form-group">
                  <label>Job Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the job role and what the candidate will be doing..."
                    rows="4"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Requirements</label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    placeholder="List the requirements and qualifications..."
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Responsibilities</label>
                  <textarea
                    name="responsibilities"
                    value={formData.responsibilities}
                    onChange={handleInputChange}
                    placeholder="List the key responsibilities..."
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Job Details</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g., Remote, New York, USA"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Job Type *</label>
                    <select name="job_type" value={formData.job_type} onChange={handleInputChange} required>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                      <option value="freelance">Freelance</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Experience Level *</label>
                    <select name="experience_level" value={formData.experience_level} onChange={handleInputChange} required>
                      <option value="entry">Entry Level</option>
                      <option value="mid">Mid Level</option>
                      <option value="senior">Senior Level</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Salary Range</label>
                    <input
                      type="text"
                      name="salary_range"
                      value={formData.salary_range}
                      onChange={handleInputChange}
                      placeholder="e.g., $60,000 - $80,000"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Required Skills</h3>
                <div className="skills-selection">
                  {skills.map((skill) => (
                    <label key={skill.id} className="skill-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.required_skills.includes(skill.id)}
                        onChange={() => handleSkillToggle(skill.id)}
                      />
                      <span>{skill.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <h3>Application Details</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>Application URL</label>
                    <input
                      type="url"
                      name="application_url"
                      value={formData.application_url}
                      onChange={handleInputChange}
                      placeholder="https://company.com/apply"
                    />
                  </div>

                  <div className="form-group">
                    <label>Application Email</label>
                    <input
                      type="email"
                      name="application_email"
                      value={formData.application_email}
                      onChange={handleInputChange}
                      placeholder="jobs@company.com"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Application Deadline</label>
                    <input
                      type="date"
                      name="application_deadline"
                      value={formData.application_deadline}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                      />
                      <span>Job is active</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingJob ? 'Update Job' : 'Post Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Job Details Modal */}
      {viewingJob && (
        <div className="modal-overlay" onClick={() => setViewingJob(null)}>
          <div className="modal-content modal-large job-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="job-details-header">
                {viewingJob.company_logo && (
                  <img src={viewingJob.company_logo} alt={viewingJob.company_name} className="company-logo-large" />
                )}
                <div>
                  <h2>{viewingJob.title}</h2>
                  <p className="company-name-large">{viewingJob.company_name}</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setViewingJob(null)}>×</button>
            </div>

            <div className="job-details-content">
              <div className="job-details-meta-grid">
                <div className="meta-detail-item">
                  <span className="meta-label">📍 Location</span>
                  <span className="meta-value">{viewingJob.location}</span>
                </div>
                <div className="meta-detail-item">
                  <span className="meta-label">💼 Job Type</span>
                  <span className="meta-value">{getJobTypeLabel(viewingJob.job_type)}</span>
                </div>
                <div className="meta-detail-item">
                  <span className="meta-label">📊 Experience</span>
                  <span className="meta-value">{getExperienceLabel(viewingJob.experience_level)}</span>
                </div>
                {viewingJob.salary_range && (
                  <div className="meta-detail-item">
                    <span className="meta-label">💰 Salary</span>
                    <span className="meta-value">{viewingJob.salary_range}</span>
                  </div>
                )}
              </div>

              <div className="job-detail-section">
                <h3>Description</h3>
                <p>{viewingJob.description}</p>
              </div>

              {viewingJob.requirements && (
                <div className="job-detail-section">
                  <h3>Requirements</h3>
                  <ul>
                    {viewingJob.requirements.split('\n').filter(line => line.trim()).map((line, idx) => (
                      <li key={idx}>{line.trim()}</li>
                    ))}
                  </ul>
                </div>
              )}

              {viewingJob.responsibilities && (
                <div className="job-detail-section">
                  <h3>Responsibilities</h3>
                  <ul>
                    {viewingJob.responsibilities.split('\n').filter(line => line.trim()).map((line, idx) => (
                      <li key={idx}>{line.trim()}</li>
                    ))}
                  </ul>
                </div>
              )}

              {viewingJob.required_skills && JSON.parse(viewingJob.required_skills).length > 0 && (
                <div className="job-detail-section">
                  <h3>Required Skills</h3>
                  <div className="job-skills-detail">
                    {JSON.parse(viewingJob.required_skills).map((skillId) => {
                      const skill = skills.find(s => s.id === skillId);
                      return skill ? (
                        <span key={skillId} className="skill-tag">{skill.name}</span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {(viewingJob.application_url || viewingJob.application_email) && (
                <div className="job-detail-section">
                  <h3>How to Apply</h3>
                  {viewingJob.application_url && (
                    <p>
                      <strong>Apply at:</strong>{' '}
                      <a href={viewingJob.application_url} target="_blank" rel="noopener noreferrer">
                        {viewingJob.application_url}
                      </a>
                    </p>
                  )}
                  {viewingJob.application_email && (
                    <p>
                      <strong>Email:</strong>{' '}
                      <a href={`mailto:${viewingJob.application_email}`}>{viewingJob.application_email}</a>
                    </p>
                  )}
                  {viewingJob.application_deadline && (
                    <p>
                      <strong>Deadline:</strong> {new Date(viewingJob.application_deadline).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              <div className="job-details-stats">
                <div className="stat-item">
                  <span className="stat-icon">👁️</span>
                  <div>
                    <span className="stat-number">{viewingJob.views_count}</span>
                    <span className="stat-label">Views</span>
                  </div>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">📝</span>
                  <div>
                    <span className="stat-number">{viewingJob.applications_count}</span>
                    <span className="stat-label">Applications</span>
                  </div>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">📅</span>
                  <div>
                    <span className="stat-number">{new Date(viewingJob.created_at).toLocaleDateString()}</span>
                    <span className="stat-label">Posted</span>
                  </div>
                </div>
              </div>

              <div className="job-details-actions">
                <button className="btn-edit-large" onClick={() => { setViewingJob(null); handleEdit(viewingJob); }}>
                  ✏️ Edit Job
                </button>
                <button className="btn-delete-large" onClick={() => { setViewingJob(null); setDeleteConfirm(viewingJob); }}>
                  🗑️ Delete Job
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
              <h2>Delete Job</h2>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>×</button>
            </div>

            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{deleteConfirm.title}</strong> at {deleteConfirm.company_name}?</p>
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

export default AdminJobs;
