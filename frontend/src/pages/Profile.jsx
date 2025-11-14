/**
 * Profile Page - User profile, skills, experience, career interests, CV management
 * Implements Feature #2: User Profile & Skill Input
 * Implements Feature #2: User Profile & Skill Input
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import profileAPI from "../services/profileService";
import cvAPI from "../services/cvService";
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
  
  // CV/Resume state
  const [cvData, setCvData] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUploaded, setPdfUploaded] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

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
      
      // Try to fetch CV data
      try {
        const cvResponse = await cvAPI.getCV();
        setCvData(cvResponse);
        setPdfUploaded(!!(cvResponse.cv_pdf_filename));
      } catch (cvError) {
        // CV not found is okay - user hasn't created one yet
        setCvData(null);
        setPdfUploaded(false);
      }
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

  const handleSuggestSkill = async (skillData) => {
    try {
      setError(null);
      await profileAPI.suggestSkill(skillData);
      const updated = await profileAPI.getProfile();
      setProfile(updated);
      
      // Refresh available skills list
      const skills = await profileAPI.getAvailableSkills();
      setAvailableSkills(skills);
      
      setSuccess("✨ New skill added successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Suggest skill error:", err);
      console.error("Response data:", err.response?.data);
      
      // Handle validation errors
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          // Validation errors from FastAPI
          const errors = detail.map(e => `${e.loc.join('.')}: ${e.msg}`).join(', ');
          setError(errors);
        } else if (typeof detail === 'string') {
          setError(detail);
        } else {
          setError("Failed to add skill");
        }
      } else {
        setError("Failed to add skill");
      }
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

  // PDF Upload Handler
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf')) {
      setError("Only PDF files are allowed");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const response = await cvAPI.uploadPDF(file);
      setPdfFile(file);
      setPdfUploaded(true);
      setSuccess(`PDF uploaded successfully: ${file.name}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to upload PDF: " + (err.response?.data?.detail || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Parse PDF with Gemini AI
  const handleParsePdf = async () => {
    if (!pdfUploaded) {
      setError("Please upload a PDF first");
      return;
    }

    try {
      setError(null);
      setIsParsing(true);
      setSuccess("Parsing CV with AI... This may take a moment.");
      
      const parsedData = await cvAPI.parseCvPdf();
      setCvData(parsedData);
      
      // Auto-populate profile with CV data
      await autoPopulateFromCV(parsedData);
      
      setSuccess("✅ CV parsed successfully! Profile card updated with extracted information.");
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError("Failed to parse PDF: " + (err.response?.data?.detail || err.message));
      console.error(err);
    } finally {
      setIsParsing(false);
    }
  };

  // Auto-populate profile from parsed CV data
  const autoPopulateFromCV = async (parsedData) => {
    try {
      // Update bio/summary if not already set
      if (parsedData.personal_summary && !profile.bio) {
        const updatedBasicForm = {
          ...basicForm,
          bio: parsedData.personal_summary
        };
        setBasicForm(updatedBasicForm);
        await profileAPI.updateProfile(updatedBasicForm);
      }

      // Add extracted skills to profile
      if (parsedData.skills && parsedData.skills.length > 0) {
        // Get current profile skill IDs
        const currentSkillIds = profile.skills?.map(s => s.id) || [];
        
        // Find new skills not already in profile
        const newSkillIds = parsedData.skills.filter(
          skillId => !currentSkillIds.includes(skillId)
        );
        
        // Add new skills with default proficiency
        for (const skillId of newSkillIds) {
          try {
            await profileAPI.addSkill(skillId, 'intermediate');
          } catch (err) {
            console.log(`Skill ${skillId} already exists or invalid`);
          }
        }
      }

      // Update experience if not already set
      if (parsedData.experiences && parsedData.experiences.length > 0 && !profile.experience_description) {
        // Create a summary from experiences
        const experienceSummary = parsedData.experiences
          .map(exp => `${exp.title} at ${exp.company} (${exp.start_date} - ${exp.end_date || 'Present'})`)
          .join('\n');
        
        setExperienceForm(experienceSummary);
        await profileAPI.setExperience(experienceSummary);
      }

      // Refresh profile data
      const updatedProfile = await profileAPI.getProfile();
      setProfile(updatedProfile);
      
      // Show profile card if basic info is now complete
      if (updatedProfile.full_name && (updatedProfile.bio || parsedData.personal_summary)) {
        setShowProfileCard(true);
      }
      
    } catch (err) {
      console.error('Error auto-populating profile:', err);
      // Don't throw - parsing was successful, just auto-populate failed
    }
  };

  // ==================== CRUD Handlers for CV Data ====================
  
  const handleUpdateBio = async (newBio) => {
    try {
      // Update CV data with new summary
      const updatedCvData = {
        ...cvData,
        personal_summary: newBio,
        experiences: cvData.experiences || [],
        education: cvData.education || [],
        skills: cvData.skills || [],
        tools: cvData.tools || [],
        projects: cvData.projects || []
      };
      
      await cvAPI.saveCV(updatedCvData);
      setCvData({ ...cvData, personal_summary: newBio });
      setSuccess('Bio updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      throw new Error(err.response?.data?.detail || 'Failed to update bio');
    }
  };

  const handleUpdateExperience = async (index, updatedExp) => {
    try {
      const experiences = [...cvData.experiences];
      experiences[index] = updatedExp;
      
      const updatedCvData = {
        ...cvData,
        experiences,
        education: cvData.education || [],
        skills: cvData.skills || [],
        tools: cvData.tools || [],
        projects: cvData.projects || []
      };
      
      await cvAPI.saveCV(updatedCvData);
      setCvData({ ...cvData, experiences });
      setSuccess('Experience updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      throw new Error(err.response?.data?.detail || 'Failed to update experience');
    }
  };

  const handleDeleteExperience = async (index) => {
    try {
      const experiences = cvData.experiences.filter((_, i) => i !== index);
      
      const updatedCvData = {
        ...cvData,
        experiences,
        education: cvData.education || [],
        skills: cvData.skills || [],
        tools: cvData.tools || [],
        projects: cvData.projects || []
      };
      
      await cvAPI.saveCV(updatedCvData);
      setCvData({ ...cvData, experiences });
      setSuccess('Experience deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      throw new Error(err.response?.data?.detail || 'Failed to delete experience');
    }
  };

  const handleAddExperience = async (newExp) => {
    try {
      const experiences = [...(cvData.experiences || []), newExp];
      
      const updatedCvData = {
        ...cvData,
        experiences,
        education: cvData.education || [],
        skills: cvData.skills || [],
        tools: cvData.tools || [],
        projects: cvData.projects || []
      };
      
      await cvAPI.saveCV(updatedCvData);
      setCvData({ ...cvData, experiences });
      setSuccess('Experience added successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      throw new Error(err.response?.data?.detail || 'Failed to add experience');
    }
  };

  const handleUpdateEducation = async (index, updatedEdu) => {
    try {
      const education = [...cvData.education];
      education[index] = updatedEdu;
      
      const updatedCvData = {
        ...cvData,
        education,
        experiences: cvData.experiences || [],
        skills: cvData.skills || [],
        tools: cvData.tools || [],
        projects: cvData.projects || []
      };
      
      await cvAPI.saveCV(updatedCvData);
      setCvData({ ...cvData, education });
      setSuccess('Education updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      throw new Error(err.response?.data?.detail || 'Failed to update education');
    }
  };

  const handleDeleteEducation = async (index) => {
    try {
      const education = cvData.education.filter((_, i) => i !== index);
      
      const updatedCvData = {
        ...cvData,
        education,
        experiences: cvData.experiences || [],
        skills: cvData.skills || [],
        tools: cvData.tools || [],
        projects: cvData.projects || []
      };
      
      await cvAPI.saveCV(updatedCvData);
      setCvData({ ...cvData, education });
      setSuccess('Education deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      throw new Error(err.response?.data?.detail || 'Failed to delete education');
    }
  };

  const handleAddEducation = async (newEdu) => {
    try {
      const education = [...(cvData.education || []), newEdu];
      
      const updatedCvData = {
        ...cvData,
        education,
        experiences: cvData.experiences || [],
        skills: cvData.skills || [],
        tools: cvData.tools || [],
        projects: cvData.projects || []
      };
      
      await cvAPI.saveCV(updatedCvData);
      setCvData({ ...cvData, education });
      setSuccess('Education added successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      throw new Error(err.response?.data?.detail || 'Failed to add education');
    }
  };

  const handleUpdateProject = async (index, updatedProj) => {
    try {
      const projects = [...cvData.projects];
      projects[index] = updatedProj;
      
      const updatedCvData = {
        ...cvData,
        projects,
        experiences: cvData.experiences || [],
        education: cvData.education || [],
        skills: cvData.skills || [],
        tools: cvData.tools || []
      };
      
      await cvAPI.saveCV(updatedCvData);
      setCvData({ ...cvData, projects });
      setSuccess('Project updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      throw new Error(err.response?.data?.detail || 'Failed to update project');
    }
  };

  const handleDeleteProject = async (index) => {
    try {
      const projects = cvData.projects.filter((_, i) => i !== index);
      
      const updatedCvData = {
        ...cvData,
        projects,
        experiences: cvData.experiences || [],
        education: cvData.education || [],
        skills: cvData.skills || [],
        tools: cvData.tools || []
      };
      
      await cvAPI.saveCV(updatedCvData);
      setCvData({ ...cvData, projects });
      setSuccess('Project deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      throw new Error(err.response?.data?.detail || 'Failed to delete project');
    }
  };

  const handleAddProject = async (newProj) => {
    try {
      const projects = [...(cvData.projects || []), newProj];
      
      const updatedCvData = {
        ...cvData,
        projects,
        experiences: cvData.experiences || [],
        education: cvData.education || [],
        skills: cvData.skills || [],
        tools: cvData.tools || []
      };
      
      await cvAPI.saveCV(updatedCvData);
      setCvData({ ...cvData, projects });
      setSuccess('Project added successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      throw new Error(err.response?.data?.detail || 'Failed to add project');
    }
  };

  const handleUpdateTool = async (index, updatedTool) => {
    try {
      const tools = [...cvData.tools];
      tools[index] = updatedTool;
      
      const updatedCvData = {
        ...cvData,
        tools,
        experiences: cvData.experiences || [],
        education: cvData.education || [],
        skills: cvData.skills || [],
        projects: cvData.projects || []
      };
      
      await cvAPI.saveCV(updatedCvData);
      setCvData({ ...cvData, tools });
      setSuccess('Tool updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      throw new Error(err.response?.data?.detail || 'Failed to update tool');
    }
  };

  const handleDeleteTool = async (index) => {
    try {
      const tools = cvData.tools.filter((_, i) => i !== index);
      
      const updatedCvData = {
        ...cvData,
        tools,
        experiences: cvData.experiences || [],
        education: cvData.education || [],
        skills: cvData.skills || [],
        projects: cvData.projects || []
      };
      
      await cvAPI.saveCV(updatedCvData);
      setCvData({ ...cvData, tools });
      setSuccess('Tool deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      throw new Error(err.response?.data?.detail || 'Failed to delete tool');
    }
  };

  const handleAddTool = async (newTool) => {
    try {
      if (!newTool || !newTool.trim()) {
        throw new Error('Tool name cannot be empty');
      }
      
      const tools = [...(cvData.tools || []), newTool.trim()];
      
      const updatedCvData = {
        ...cvData,
        tools,
        experiences: cvData.experiences || [],
        education: cvData.education || [],
        skills: cvData.skills || [],
        projects: cvData.projects || []
      };
      
      await cvAPI.saveCV(updatedCvData);
      setCvData({ ...cvData, tools });
      setSuccess('Tool added successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      throw new Error(err.response?.data?.detail || err.message || 'Failed to add tool');
    }
  };

  // Download PDF
  const handleDownloadPdf = async () => {
    try {
      setError(null);
      const blob = await cvAPI.downloadPDF();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = cvData?.cv_pdf_filename || 'cv.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError("Failed to download PDF: " + (err.response?.data?.detail || err.message));
      console.error(err);
    }
  };

  // Delete PDF
  const handleDeletePdf = async () => {
    if (!window.confirm("Are you sure you want to delete your CV PDF?")) {
      return;
    }

    try {
      setError(null);
      await cvAPI.deletePDF();
      setPdfFile(null);
      setPdfUploaded(false);
      setSuccess("PDF deleted successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to delete PDF: " + (err.response?.data?.detail || err.message));
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
            <ProfileCard 
              profile={profile} 
              interestsForm={interestsForm} 
              cvData={cvData}
              availableSkills={availableSkills}
              onUpdateBio={handleUpdateBio}
              onUpdateExperience={handleUpdateExperience}
              onUpdateEducation={handleUpdateEducation}
              onUpdateProject={handleUpdateProject}
              onDeleteExperience={handleDeleteExperience}
              onDeleteEducation={handleDeleteEducation}
              onDeleteProject={handleDeleteProject}
              onAddExperience={handleAddExperience}
              onAddEducation={handleAddEducation}
              onAddProject={handleAddProject}
              onUpdateTool={handleUpdateTool}
              onDeleteTool={handleDeleteTool}
              onAddTool={handleAddTool}
            />
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
                  
                  {/* PDF Upload Section */}
                  <div className="cv-section">
                    <h3>📄 Upload CV PDF</h3>
                    <p className="tab-description">
                      Upload your CV as a PDF and let AI extract the information automatically
                    </p>
                    
                    <div className="pdf-upload-area">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handlePdfUpload}
                        id="pdf-upload"
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="pdf-upload" className="home-btn home-btn-secondary">
                        {pdfUploaded ? '✓ Change PDF' : '📤 Choose PDF File'}
                      </label>
                      
                      {pdfUploaded && (
                        <div className="pdf-actions">
                          <button
                            type="button"
                            onClick={handleParsePdf}
                            disabled={isParsing}
                            className="home-btn home-btn-primary"
                          >
                            {isParsing ? '🤖 Parsing...' : '🤖 Parse with AI'}
                          </button>
                          <button
                            type="button"
                            onClick={handleDownloadPdf}
                            className="home-btn home-btn-secondary"
                          >
                            ⬇️ Download
                          </button>
                          <button
                            type="button"
                            onClick={handleDeletePdf}
                            className="home-btn home-btn-danger"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                      
                      {pdfUploaded && cvData?.cv_pdf_filename && (
                        <p className="pdf-info">📎 {cvData.cv_pdf_filename}</p>
                      )}
                    </div>
                  </div>

                  {/* Parsed CV Data Display */}
                  {cvData && (
                    <div className="cv-section">
                      <h3>📋 Extracted Information</h3>
                      
                      {/* Personal Summary */}
                      {cvData.personal_summary && (
                        <div className="cv-data-section">
                          <h4>Professional Summary</h4>
                          <p className="cv-summary">{cvData.personal_summary}</p>
                        </div>
                      )}

                      {/* Skills */}
                      {cvData.skills && cvData.skills.length > 0 && (
                        <div className="cv-data-section">
                          <h4>Skills ({cvData.skills.length})</h4>
                          <div className="cv-skills-list">
                            {cvData.skills.map((skillId) => {
                              const skill = availableSkills.find(s => s.id === skillId);
                              return skill ? (
                                <span key={skillId} className="cv-skill-tag">{skill.name}</span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}

                      {/* Tools */}
                      {cvData.tools && cvData.tools.length > 0 && (
                        <div className="cv-data-section">
                          <h4>Tools & Technologies</h4>
                          <div className="cv-tools-list">
                            {cvData.tools.map((tool, idx) => (
                              <span key={idx} className="cv-tool-tag">{tool}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Experience */}
                      {cvData.experiences && cvData.experiences.length > 0 && (
                        <div className="cv-data-section">
                          <h4>Work Experience</h4>
                          {cvData.experiences.map((exp, idx) => (
                            <div key={idx} className="cv-experience-item">
                              <div className="cv-exp-header">
                                <strong>{exp.title}</strong> at <em>{exp.company}</em>
                              </div>
                              {exp.location && <div className="cv-exp-location">📍 {exp.location}</div>}
                              <div className="cv-exp-dates">
                                {exp.start_date} - {exp.current ? 'Present' : exp.end_date}
                              </div>
                              {exp.description && <p className="cv-exp-desc">{exp.description}</p>}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Education */}
                      {cvData.education && cvData.education.length > 0 && (
                        <div className="cv-data-section">
                          <h4>Education</h4>
                          {cvData.education.map((edu, idx) => (
                            <div key={idx} className="cv-education-item">
                              <div className="cv-edu-header">
                                <strong>{edu.degree}</strong>
                                {edu.field && ` in ${edu.field}`}
                              </div>
                              <div className="cv-edu-institution">{edu.institution}</div>
                              {edu.graduation_year && <div className="cv-edu-year">🎓 {edu.graduation_year}</div>}
                              {edu.gpa && <div className="cv-edu-gpa">GPA: {edu.gpa}</div>}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Projects */}
                      {cvData.projects && cvData.projects.length > 0 && (
                        <div className="cv-data-section">
                          <h4>Projects</h4>
                          {cvData.projects.map((proj, idx) => (
                            <div key={idx} className="cv-project-item">
                              <div className="cv-proj-header">
                                <strong>{proj.name}</strong>
                                {proj.link && (
                                  <a href={proj.link} target="_blank" rel="noopener noreferrer" className="cv-proj-link">
                                    🔗 View
                                  </a>
                                )}
                              </div>
                              {proj.description && <p className="cv-proj-desc">{proj.description}</p>}
                              {proj.technologies && (
                                <div className="cv-proj-tech">
                                  <strong>Technologies:</strong> {proj.technologies}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Legacy Text Input */}
                  <div className="cv-section">
                    <h3>📝 Manual Text Entry (Legacy)</h3>
                    <p className="tab-description">
                      You can still paste your CV text directly (not required if using PDF)
                    </p>
                    <form onSubmit={handleCVUpdate} className="profile-form">
                      <div className="form-group">
                        <label>CV/Resume Text</label>
                        <textarea
                          value={cvForm}
                          onChange={(e) => setCvForm(e.target.value)}
                          placeholder="Paste your CV/resume content here..."
                          rows="8"
                        />
                      </div>
                      <button type="submit" className="home-btn home-btn-primary">
                        Save CV Text
                      </button>
                    </form>
                  </div>
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
                    
                    {/* PDF Upload Section */}
                    <div className="cv-section">
                      <h4>📄 Upload CV PDF</h4>
                      
                      <div className="pdf-upload-area">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handlePdfUpload}
                          id="sidebar-pdf-upload"
                          style={{ display: 'none' }}
                        />
                        <label htmlFor="sidebar-pdf-upload" className="home-btn home-btn-secondary" style={{ width: '100%', textAlign: 'center' }}>
                          {pdfUploaded ? '✓ Change PDF' : '📤 Choose PDF'}
                        </label>
                        
                        {pdfUploaded && (
                          <>
                            <button
                              type="button"
                              onClick={handleParsePdf}
                              disabled={isParsing}
                              className="home-btn home-btn-primary"
                              style={{ width: '100%', marginTop: '0.5rem' }}
                            >
                              {isParsing ? '🤖 Parsing...' : '🤖 Parse with AI'}
                            </button>
                            
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                              <button
                                type="button"
                                onClick={handleDownloadPdf}
                                className="home-btn home-btn-secondary"
                                style={{ flex: 1 }}
                              >
                                ⬇️
                              </button>
                              <button
                                type="button"
                                onClick={handleDeletePdf}
                                className="home-btn home-btn-danger"
                                style={{ flex: 1 }}
                              >
                                🗑️
                              </button>
                            </div>
                          </>
                        )}
                        
                        {pdfUploaded && cvData?.cv_pdf_filename && (
                          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#94a3b8' }}>
                            📎 {cvData.cv_pdf_filename}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quick CV Stats */}
                    {cvData && (
                      <div className="cv-stats" style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '0.5rem' }}>
                        <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Extracted Data:</h4>
                        <ul style={{ fontSize: '0.85rem', lineHeight: '1.8' }}>
                          {cvData.personal_summary && <li>✓ Professional Summary</li>}
                          {cvData.skills?.length > 0 && <li>✓ {cvData.skills.length} Skills</li>}
                          {cvData.tools?.length > 0 && <li>✓ {cvData.tools.length} Tools</li>}
                          {cvData.experiences?.length > 0 && <li>✓ {cvData.experiences.length} Experiences</li>}
                          {cvData.education?.length > 0 && <li>✓ {cvData.education.length} Education</li>}
                          {cvData.projects?.length > 0 && <li>✓ {cvData.projects.length} Projects</li>}
                        </ul>
                      </div>
                    )}

                    {/* Manual Text Entry */}
                    <div style={{ marginTop: '1.5rem' }}>
                      <h4>Manual Entry</h4>
                      <form onSubmit={handleCVUpdate} className="profile-form">
                        <div className="form-group">
                          <textarea
                            value={cvForm}
                            onChange={(e) => setCvForm(e.target.value)}
                            placeholder="Paste CV text..."
                            rows="6"
                          />
                        </div>
                        <button type="submit" className="home-btn home-btn-primary" style={{ width: '100%' }}>
                          Save Text
                        </button>
                      </form>
                    </div>
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
