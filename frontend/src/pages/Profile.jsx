/**
 * Profile Page - User profile, skills, experience, career interests, CV management
 * Modularized with separate tab components for better maintainability
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import profileAPI from "../services/profileService";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import "./Profile.css";
import Navbar from "../components/Navbar";

// Import tab components
import BasicInfoTab from "../components/profile/BasicInfoTab";
import SkillsTab from "../components/profile/SkillsTab";
import CareerInterestsTab from "../components/profile/CareerInterestsTab";
import ExperienceTab from "../components/profile/ExperienceTab";
import CVTab from "../components/profile/CVTab";

const Profile = () => {
  const { getCurrentUser } = useAuth();
  const navigate = useNavigate();

  // State
  const [profile, setProfile] = useState(null);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form state
  const [basicForm, setBasicForm] = useState({});
  const [experienceForm, setExperienceForm] = useState("");
  const [interestsForm, setInterestsForm] = useState([]);
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
      // Only initialize editable fields
      setBasicForm({
        bio: profileData.bio || "",
        avatar_url: profileData.avatar_url || "",
      });
      setExperienceForm(profileData.experience_description || "");

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
  const handleBasicUpdate = async (e) => {
    e.preventDefault();
    try {
      setError(null);

      // Only send editable fields (avatar_url and bio)
      const updateData = {
        avatar_url: basicForm.avatar_url || null,
        bio: basicForm.bio || null,
      };

      const updated = await profileAPI.updateProfile(updateData);
      setProfile(updated);
      // Update basicForm with the response to keep it in sync
      setBasicForm({
        ...basicForm,
        avatar_url: updated.avatar_url || "",
        bio: updated.bio || "",
      });
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
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
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-header-content">
            <h1>My Profile</h1>
            <p>Manage your profile, skills, and career information</p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="profile-back-btn"
          >
            ← Back to Dashboard
          </button>
        </div>

        {error && <div className="profile-alert error">{error}</div>}
        {success && <div className="profile-alert success">{success}</div>}

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

        <div className="profile-content">
          {activeTab === "basic" && (
            <BasicInfoTab
              basicForm={basicForm}
              setBasicForm={setBasicForm}
              onSubmit={handleBasicUpdate}
              profile={profile}
            />
          )}

          {activeTab === "skills" && (
            <SkillsTab
              profile={profile}
              availableSkills={availableSkills}
              selectedSkillId={selectedSkillId}
              setSelectedSkillId={setSelectedSkillId}
              proficiencyLevel={proficiencyLevel}
              setProficiencyLevel={setProficiencyLevel}
              onAddSkill={handleAddSkill}
              onRemoveSkill={handleRemoveSkill}
            />
          )}

          {activeTab === "interests" && (
            <CareerInterestsTab
              interestsForm={interestsForm}
              onAddInterest={handleAddInterest}
              onRemoveInterest={handleRemoveInterest}
              onSave={handleSaveInterests}
            />
          )}

          {activeTab === "experience" && (
            <ExperienceTab
              experienceForm={experienceForm}
              setExperienceForm={setExperienceForm}
              onSubmit={handleExperienceUpdate}
            />
          )}

          {activeTab === "cv" && (
            <CVTab
              profile={profile}
              onUpdate={handleProfileUpdate}
              onError={setError}
              onSuccess={(msg) => {
                setSuccess(msg);
                setTimeout(() => setSuccess(null), 3000);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
