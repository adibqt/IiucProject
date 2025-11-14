/**
 * Basic Info Tab Component
 * Personal information (name, email, phone) is read-only
 * Avatar and bio are editable
 */
import React from "react";

const BasicInfoTab = ({ basicForm, setBasicForm, onSubmit, profile }) => {
  return (
    <div className="tab-panel">
      <h2>Basic Information</h2>
      <form onSubmit={onSubmit} className="profile-form">
        {/* Read-only Personal Information */}
        <div className="read-only-section">
          <h3>Personal Information</h3>
          <p className="read-only-note">
            These fields cannot be edited. Contact support to update your
            personal information.
          </p>

          <div className="form-group">
            <label>Full Name</label>
            <div className="read-only-field">
              {profile?.full_name || "Not set"}
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <div className="read-only-field">{profile?.email || "Not set"}</div>
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <div className="read-only-field">
              {profile?.phone_number || "Not set"}
            </div>
          </div>
        </div>

        {/* Editable Fields */}
        <div className="editable-section">
          <h3>Profile Customization</h3>

          <div className="form-group">
            <label>Avatar URL</label>
            <input
              type="url"
              value={basicForm.avatar_url || ""}
              onChange={(e) =>
                setBasicForm({ ...basicForm, avatar_url: e.target.value })
              }
              placeholder="https://example.com/avatar.jpg"
            />
            {basicForm.avatar_url && (
              <div className="avatar-preview">
                <img
                  src={basicForm.avatar_url}
                  alt="Avatar preview"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              value={basicForm.bio || ""}
              onChange={(e) =>
                setBasicForm({ ...basicForm, bio: e.target.value })
              }
              placeholder="Tell us about yourself..."
              rows="5"
            />
          </div>
        </div>

        <button type="submit" className="home-btn home-btn-primary">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default BasicInfoTab;
