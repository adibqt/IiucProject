/**
 * Profile Page - User profile, skills, experience, career interests, CV management
 * Implements Feature #2: User Profile & Skill Input
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import profileAPI from "../services/profileService";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import "./Profile.css";
import Navbar from "../components/Navbar";
import ProfileCard from "../components/ProfileCard";

const Profile = () => {
  const { getCurrentUser } = useAuth();
  const navigate = useNavigate();

  // State
  const [profile, setProfile] = useState(null);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [activeTab, setActiveTab] = useState("basic"); // basic, skills, interests, experience, cv
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Form state
  const [basicForm, setBasicForm] = useState({});
  const [experienceForm, setExperienceForm] = useState("");
  const [interestsForm, setInterestsForm] = useState([]);
  const [cvForm, setCvForm] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [proficiencyLevel, setProficiencyLevel] = useState("beginner");

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileData, skillsResponse] = await Promise.all([
        profileAPI.getProfile(),
        api.get("/skills"),
      ]);
      setProfile(profileData);
      setAvailableSkills(skillsResponse.data || []);
      setBasicForm({
        full_name: profileData.full_name || "",
        bio: profileData.bio || "",
        phone_number: profileData.phone_number || "",
        avatar_url: profileData.avatar_url || "",
      });
      setExperienceForm(profileData.experience_description || "");
      setCvForm(profileData.cv_text || "");

      // Check if basic info is complete to show profile card
      const hasBasicInfo = profileData.full_name && profileData.bio;
      setShowProfileCard(hasBasicInfo);

      // Parse career interests
      try {
        const interests = profileData.career_interests
          ? JSON.parse(profileData.career_interests)
          : [];
        setInterestsForm(interests);
      } catch (e) {
        setInterestsForm([]);
      }
    } catch (err) {
      setError("Failed to load profile data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const validatePhoneNumber = (phone) => {
    // Phone must be 11 digits starting with 01 (e.g., 01712345678)
    const phoneRegex = /^01[0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  const handleBasicUpdate = async (e) => {
    e.preventDefault();
    try {
      setError(null);

      // Validate phone number if provided
      if (
        basicForm.phone_number &&
        !validatePhoneNumber(basicForm.phone_number)
      ) {
        setError(
          "Phone number must be 11 digits starting with 01 (e.g., 01712345678)"
        );
        return;
      }

      const updated = await profileAPI.updateProfile(basicForm);
      setProfile(updated);
      setSuccess("Basic information updated successfully!");
      setTimeout(() => setSuccess(null), 3000);

      // Show profile card if basic info is complete
      if (basicForm.full_name && basicForm.bio) {
        setShowProfileCard(true);
        setSidebarOpen(false);
      }
    } catch (err) {
      setError("Failed to update profile");
      console.error(err);
    }
  };

  const handleExperienceUpdate = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await profileAPI.setExperience(experienceForm);
      setProfile({ ...profile, experience_description: experienceForm });
      setSuccess("Experience updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to update experience");
      console.error(err);
    }
  };

  const handleAddSkill = async () => {
    if (!selectedSkillId) {
      setError("Please select a skill");
      return;
    }
    try {
      setError(null);
      await profileAPI.addSkill(selectedSkillId, proficiencyLevel);
      const updated = await profileAPI.getProfile();
      setProfile(updated);
      setSelectedSkillId("");
      setProficiencyLevel("beginner");
      setSuccess("Skill added successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to add skill");
      console.error(err);
    }
  };

  const handleRemoveSkill = async (skillId) => {
    try {
      setError(null);
      await profileAPI.removeSkill(skillId);
      const updated = await profileAPI.getProfile();
      setProfile(updated);
      setSuccess("Skill removed successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to remove skill");
      console.error(err);
    }
  };

  const handleAddInterest = (interest) => {
    if (interest.trim() && !interestsForm.includes(interest)) {
      setInterestsForm([...interestsForm, interest]);
    }
  };

  const handleRemoveInterest = (index) => {
    setInterestsForm(interestsForm.filter((_, i) => i !== index));
  };

  const handleSaveInterests = async () => {
    try {
      setError(null);
      await profileAPI.setCareerInterests(interestsForm);
      setProfile({
        ...profile,
        career_interests: JSON.stringify(interestsForm),
      });
      setSuccess("Career interests updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to update career interests");
      console.error(err);
    }
  };

  const handleCVUpdate = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await profileAPI.setCV(cvForm);
      setProfile({ ...profile, cv_text: cvForm });
      setSuccess("CV updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to update CV");
      console.error(err);
    }
  };

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  if (loading)
    return (
      <div className="profile-container">
        <div className="profile-loading">Loading profile...</div>
      </div>
    );

  return (
    <div className="profile-page">
      <Navbar />
      <div className="profile-layout">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-header-content">
            <h1>My Profile</h1>
            <p>Manage your profile, skills, and career information</p>
          </div>
          <div className="profile-header-actions">
            {showProfileCard && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="profile-edit-btn"
              >
                {sidebarOpen ? "✕ Close Editor" : "✏️ Edit Profile"}
              </button>
            )}
            <button
              onClick={() => navigate("/dashboard")}
              className="profile-back-btn"
            >
              ← Dashboard
            </button>
          </div>
        </div>

        {error && <div className="profile-alert error">{error}</div>}
        {success && <div className="profile-alert success">{success}</div>}

        {/* Main Content Area */}
        <div className={`profile-main-content ${showProfileCard ? 'with-card' : ''}`}>
          
          {/* Profile Card Display */}
          {showProfileCard ? (
            <ProfileCard profile={profile} interestsForm={interestsForm} />
          ) : (
            /* Initial Setup View */
            <div className="profile-content">
              <div className="profile-tabs">
                <button
                  className={`tab-btn ${activeTab === "basic" ? "active" : ""}`}
                  onClick={() => setActiveTab("basic")}
                >
                  Basic Info
                </button>
                <button
                  className={`tab-btn ${activeTab === "skills" ? "active" : ""}`}
                  onClick={() => setActiveTab("skills")}
                >
                  Skills ({profile?.skills?.length || 0})
                </button>
                <button
                  className={`tab-btn ${activeTab === "interests" ? "active" : ""}`}
                  onClick={() => setActiveTab("interests")}
                >
                  Career Interests
                </button>
                <button
                  className={`tab-btn ${activeTab === "experience" ? "active" : ""}`}
                  onClick={() => setActiveTab("experience")}
                >
                  Experience
                </button>
                <button
                  className={`tab-btn ${activeTab === "cv" ? "active" : ""}`}
                  onClick={() => setActiveTab("cv")}
                >
                  CV/Resume
                </button>
              </div>

              {/* Basic Info Tab */}
              {activeTab === "basic" && (
                <div className="tab-panel">
                  <h2>Basic Information</h2>
                  <form onSubmit={handleBasicUpdate} className="profile-form">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={basicForm.full_name || ""}
                        onChange={(e) =>
                          setBasicForm({ ...basicForm, full_name: e.target.value })
                        }
                        placeholder="Your full name"
                      />
                    </div>

                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        value={basicForm.phone_number || ""}
                        onChange={(e) =>
                          setBasicForm({
                            ...basicForm,
                            phone_number: e.target.value,
                          })
                        }
                        placeholder="01XXXXXXXXXX (11 digits starting with 01)"
                      />
                    </div>

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

                    <button type="submit" className="home-btn home-btn-primary">
                      Save Changes
                    </button>
                  </form>
                </div>
              )}

              {/* Skills Tab */}
              {activeTab === "skills" && (
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
                          onClick={handleAddSkill}
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
                                onClick={() => handleRemoveSkill(skill.id)}
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
              )}

              {/* Career Interests Tab */}
              {activeTab === "interests" && (
                <div className="tab-panel">
                  <h2>Career Interests</h2>
                  <p className="tab-description">
                    Add roles or career paths you're interested in
                  </p>
                  <form
                    onSubmit={(e) => e.preventDefault()}
                    className="profile-form"
                  >
                    <div className="form-group">
                      <label>Add a Career Interest</label>
                      <div className="interest-input-group">
                        <input
                          type="text"
                          id="interestInput"
                          placeholder="e.g., Data Science, Frontend Development, Product Management"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById("interestInput");
                            handleAddInterest(input.value);
                            input.value = "";
                          }}
                          className="home-btn home-btn-primary"
                        >
                          Add Interest
                        </button>
                      </div>
                    </div>

                    <div className="interests-list">
                      <h3>Your Career Interests</h3>
                      {interestsForm.length > 0 ? (
                        <div className="interests-tags">
                          {interestsForm.map((interest, idx) => (
                            <div key={idx} className="interest-tag">
                              <span>{interest}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveInterest(idx)}
                                className="interest-remove"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="empty-message">
                          No career interests added yet
                        </p>
                      )}
                    </div>

                    {interestsForm.length > 0 && (
                      <button
                        type="button"
                        onClick={handleSaveInterests}
                        className="home-btn home-btn-primary"
                      >
                        Save Career Interests
                      </button>
                    )}
                  </form>
                </div>
              )}

              {/* Experience Tab */}
              {activeTab === "experience" && (
                <div className="tab-panel">
                  <h2>Work Experience</h2>
                  <p className="tab-description">
                    Describe your relevant work experience and projects
                  </p>
                  <form onSubmit={handleExperienceUpdate} className="profile-form">
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
              )}

              {/* CV Tab */}
              {activeTab === "cv" && (
                <div className="tab-panel">
                  <h2>CV/Resume</h2>
                  <p className="tab-description">
                    Paste your CV/resume content here (stored for future AI
                    analysis)
                  </p>
                  <form onSubmit={handleCVUpdate} className="profile-form">
                    <div className="form-group">
                      <label>CV/Resume Text</label>
                      <textarea
                        value={cvForm}
                        onChange={(e) => setCvForm(e.target.value)}
                        placeholder="Paste your CV/resume content here..."
                        rows="12"
                      />
                    </div>
                    <button type="submit" className="home-btn home-btn-primary">
                      Save CV
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Edit Sidebar - Only show when profile card is visible */}
        {showProfileCard && (
          <div className={`profile-sidebar ${sidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-content">
              <div className="sidebar-header">
                <h2>Edit Profile</h2>
                <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
              </div>

              <div className="sidebar-tabs">
                <button
                  className={`sidebar-tab-btn ${activeTab === "basic" ? "active" : ""}`}
                  onClick={() => setActiveTab("basic")}
                >
                  Basic Info
                </button>
                <button
                  className={`sidebar-tab-btn ${activeTab === "skills" ? "active" : ""}`}
                  onClick={() => setActiveTab("skills")}
                >
                  Skills ({profile?.skills?.length || 0})
                </button>
                <button
                  className={`sidebar-tab-btn ${activeTab === "interests" ? "active" : ""}`}
                  onClick={() => setActiveTab("interests")}
                >
                  Career Interests
                </button>
                <button
                  className={`sidebar-tab-btn ${activeTab === "experience" ? "active" : ""}`}
                  onClick={() => setActiveTab("experience")}
                >
                  Experience
                </button>
                <button
                  className={`sidebar-tab-btn ${activeTab === "cv" ? "active" : ""}`}
                  onClick={() => setActiveTab("cv")}
                >
                  CV/Resume
                </button>
              </div>

              <div className="sidebar-tab-content">
                {/* Sidebar tabs content same as main tabs */}
                {activeTab === "basic" && (
                  <div className="tab-panel">
                    <h3>Basic Information</h3>
                    <form onSubmit={handleBasicUpdate} className="profile-form">
                      <div className="form-group">
                        <label>Full Name</label>
                        <input
                          type="text"
                          value={basicForm.full_name || ""}
                          onChange={(e) =>
                            setBasicForm({ ...basicForm, full_name: e.target.value })
                          }
                          placeholder="Your full name"
                        />
                      </div>

                      <div className="form-group">
                        <label>Phone Number</label>
                        <input
                          type="tel"
                          value={basicForm.phone_number || ""}
                          onChange={(e) =>
                            setBasicForm({
                              ...basicForm,
                              phone_number: e.target.value,
                            })
                          }
                          placeholder="01XXXXXXXXXX"
                        />
                      </div>

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

                      <button type="submit" className="home-btn home-btn-primary">
                        Save Changes
                      </button>
                    </form>
                  </div>
                )}

                {activeTab === "skills" && (
                  <div className="tab-panel">
                    <h3>Skills</h3>
                    <div className="skills-section">
                      <div className="add-skill">
                        <h4>Add a Skill</h4>
                        <div className="skill-input-group">
                          <select
                            value={selectedSkillId}
                            onChange={(e) => setSelectedSkillId(e.target.value)}
                          >
                            <option value="">Select skill...</option>
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
                            onClick={handleAddSkill}
                            className="home-btn home-btn-primary"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      <div className="my-skills">
                        <h4>Your Skills</h4>
                        {profile?.skills && profile.skills.length > 0 ? (
                          <div className="skills-grid">
                            {profile.skills.map((skill) => (
                              <div key={skill.id} className="skill-tag">
                                <span>{skill.name}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSkill(skill.id)}
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
                )}

                {activeTab === "interests" && (
                  <div className="tab-panel">
                    <h3>Career Interests</h3>
                    <form
                      onSubmit={(e) => e.preventDefault()}
                      className="profile-form"
                    >
                      <div className="form-group">
                        <label>Add Interest</label>
                        <div className="interest-input-group">
                          <input
                            type="text"
                            id="sidebarInterestInput"
                            placeholder="e.g., Data Science"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.getElementById("sidebarInterestInput");
                              handleAddInterest(input.value);
                              input.value = "";
                            }}
                            className="home-btn home-btn-primary"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      <div className="interests-list">
                        {interestsForm.length > 0 ? (
                          <div className="interests-tags">
                            {interestsForm.map((interest, idx) => (
                              <div key={idx} className="interest-tag">
                                <span>{interest}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveInterest(idx)}
                                  className="interest-remove"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="empty-message">No interests added</p>
                        )}
                      </div>

                      {interestsForm.length > 0 && (
                        <button
                          type="button"
                          onClick={handleSaveInterests}
                          className="home-btn home-btn-primary"
                        >
                          Save Career Interests
                        </button>
                      )}
                    </form>
                  </div>
                )}

                {activeTab === "experience" && (
                  <div className="tab-panel">
                    <h3>Work Experience</h3>
                    <form onSubmit={handleExperienceUpdate} className="profile-form">
                      <div className="form-group">
                        <label>Experience Description</label>
                        <textarea
                          value={experienceForm}
                          onChange={(e) => setExperienceForm(e.target.value)}
                          placeholder="Your work experience..."
                          rows="8"
                        />
                      </div>
                      <button type="submit" className="home-btn home-btn-primary">
                        Save Experience
                      </button>
                    </form>
                  </div>
                )}

                {activeTab === "cv" && (
                  <div className="tab-panel">
                    <h3>CV/Resume</h3>
                    <form onSubmit={handleCVUpdate} className="profile-form">
                      <div className="form-group">
                        <label>CV/Resume Text</label>
                        <textarea
                          value={cvForm}
                          onChange={(e) => setCvForm(e.target.value)}
                          placeholder="Paste your CV/resume content..."
                          rows="12"
                        />
                      </div>
                      <button type="submit" className="home-btn home-btn-primary">
                        Save CV
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
        )}
      </div>
    </div>
  );
};

export default Profile;
