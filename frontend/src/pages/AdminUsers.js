import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingUser, setViewingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const usersData = await usersAPI.list(0, 1000); // Get all users
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      showAlert('error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Filter and search logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.is_active) ||
                         (filterStatus === 'inactive' && !user.is_active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (type, value) => {
    if (type === 'role') {
      setFilterRole(value);
    } else if (type === 'status') {
      setFilterStatus(value);
    }
    setCurrentPage(1);
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const getRoleBadgeClass = (role) => {
    const classes = {
      'admin': 'role-badge-admin',
      'instructor': 'role-badge-instructor',
      'student': 'role-badge-student'
    };
    return classes[role] || 'role-badge-student';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="admin-users-container">
      {/* Header */}
      <div className="admin-users-header">
        <div>
          <h1>Users Management</h1>
          <p>Manage platform users and their accounts</p>
        </div>
        <div className="users-stats-compact">
          <div className="stat-compact">
            <span className="stat-number">{users.length}</span>
            <span className="stat-label">Total Users</span>
          </div>
          <div className="stat-compact">
            <span className="stat-number">{users.filter(u => u.is_active).length}</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat-compact">
            <span className="stat-number">{users.filter(u => u.role === 'student').length}</span>
            <span className="stat-label">Students</span>
          </div>
        </div>
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
            placeholder="Search by name, email, or username..."
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
            value={filterRole} 
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="instructor">Instructors</option>
            <option value="admin">Admins</option>
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

          {(searchTerm || filterRole !== 'all' || filterStatus !== 'all') && (
            <button 
              className="clear-filters-btn"
              onClick={() => {
                setSearchTerm('');
                setFilterRole('all');
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
          Showing {currentUsers.length} of {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
          {filteredUsers.length !== users.length && ` (filtered from ${users.length} total)`}
        </div>
      )}

      {/* Users List */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No users found</h3>
          <p>{searchTerm || filterRole !== 'all' || filterStatus !== 'all'
            ? 'Try adjusting your search or filters' 
            : 'No users registered yet'}</p>
        </div>
      ) : (
        <div className="users-grid">
          {currentUsers.map((user) => (
            <div 
              key={user.id} 
              className={`user-card ${!user.is_active ? 'inactive' : ''}`}
              onClick={() => setViewingUser(user)}
            >
              <div className="user-card-header">
                <div className="user-avatar">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name || user.username} />
                  ) : (
                    <span className="avatar-initials">
                      {(user.full_name || user.username).substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="user-card-info">
                  <h3 className="user-name">{user.full_name || user.username}</h3>
                  <p className="user-email">{user.email}</p>
                </div>
                {!user.is_active && (
                  <span className="inactive-badge">Inactive</span>
                )}
              </div>

              <div className="user-card-meta">
                <div className="meta-item">
                  <span className="meta-label">Role</span>
                  <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Username</span>
                  <span className="meta-value">@{user.username}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Joined</span>
                  <span className="meta-value">{formatDate(user.created_at)}</span>
                </div>
                {user.last_login && (
                  <div className="meta-item">
                    <span className="meta-label">Last Login</span>
                    <span className="meta-value">{formatDate(user.last_login)}</span>
                  </div>
                )}
              </div>

              {user.is_verified && (
                <div className="verified-badge">
                  <span>✓</span> Verified
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredUsers.length > itemsPerPage && (
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

      {/* User Details Modal */}
      {viewingUser && (
        <div className="modal-overlay" onClick={() => setViewingUser(null)}>
          <div className="modal-content modal-large user-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="user-details-header">
                <div className="user-avatar-large">
                  {viewingUser.avatar_url ? (
                    <img src={viewingUser.avatar_url} alt={viewingUser.full_name || viewingUser.username} />
                  ) : (
                    <span className="avatar-initials-large">
                      {(viewingUser.full_name || viewingUser.username).substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h2>{viewingUser.full_name || viewingUser.username}</h2>
                  <p className="user-email-large">{viewingUser.email}</p>
                  <span className={`role-badge ${getRoleBadgeClass(viewingUser.role)}`}>
                    {viewingUser.role.charAt(0).toUpperCase() + viewingUser.role.slice(1)}
                  </span>
                </div>
              </div>
              <button className="modal-close" onClick={() => setViewingUser(null)}>×</button>
            </div>

            <div className="user-details-content">
              <div className="user-details-section">
                <h3>Account Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Username</span>
                    <span className="info-value">@{viewingUser.username}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <span className="info-value">{viewingUser.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{viewingUser.phone_number || 'Not provided'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Status</span>
                    <span className="info-value">
                      {viewingUser.is_active ? (
                        <span className="status-badge active">Active</span>
                      ) : (
                        <span className="status-badge inactive">Inactive</span>
                      )}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Verified</span>
                    <span className="info-value">
                      {viewingUser.is_verified ? (
                        <span className="status-badge verified">✓ Verified</span>
                      ) : (
                        <span className="status-badge unverified">Not Verified</span>
                      )}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Joined</span>
                    <span className="info-value">{formatDate(viewingUser.created_at)}</span>
                  </div>
                  {viewingUser.last_login && (
                    <div className="info-item">
                      <span className="info-label">Last Login</span>
                      <span className="info-value">{formatDate(viewingUser.last_login)}</span>
                    </div>
                  )}
                </div>
              </div>

              {viewingUser.bio && (
                <div className="user-details-section">
                  <h3>Bio</h3>
                  <p>{viewingUser.bio}</p>
                </div>
              )}

              {viewingUser.experience_description && (
                <div className="user-details-section">
                  <h3>Experience</h3>
                  <p>{viewingUser.experience_description}</p>
                </div>
              )}

              {viewingUser.career_interests && (
                <div className="user-details-section">
                  <h3>Career Interests</h3>
                  <p>{viewingUser.career_interests}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
