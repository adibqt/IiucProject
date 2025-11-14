/**
 * CV Assistant Page - AI-powered CV generation and improvement
 * Features: Professional summary generation, bullet point improvement, 
 * LinkedIn/portfolio suggestions, PDF export
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import cvAPI from '../services/cvService';
import cvAssistantAPI from '../services/cvAssistantService';
import profileAPI from '../services/profileService';
import './CVAssistant.css';

const CVAssistant = () => {
  const navigate = useNavigate();
  
  // State
  const [loading, setLoading] = useState(true);
  const [cvData, setCvData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, generate, improve, linkedin, portfolio
  
  // Generation states
  const [generatedSummary, setGeneratedSummary] = useState(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [improvingBullets, setImprovingBullets] = useState(false);
  const [improvedBullets, setImprovedBullets] = useState({});
  const [linkedinSuggestions, setLinkedinSuggestions] = useState(null);
  const [portfolioSuggestions, setPortfolioSuggestions] = useState(null);
  const [keywords, setKeywords] = useState([]);
  
  // UI states
  const [alert, setAlert] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load CV, profile, and skills
      const [cvResponse, profileResponse, skillsResponse] = await Promise.all([
        cvAPI.getCV().catch(() => null),
        profileAPI.getProfile(),
        profileAPI.getAvailableSkills()
      ]);
      
      setCvData(cvResponse);
      setProfile(profileResponse);
      setAvailableSkills(skillsResponse);
      
      // Analyze CV if it exists
      if (cvResponse) {
        const analysisData = await cvAssistantAPI.analyzeCV();
        setAnalysis(analysisData);
      }
      
    } catch (error) {
      showAlert('error', 'Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleGenerateSummary = async () => {
    try {
      setGeneratingSummary(true);
      const result = await cvAssistantAPI.generateSummary();
      setGeneratedSummary(result.summary);
      
      // Check if it's a rate limit response
      if (result.summary.includes('⚠️')) {
        showAlert('error', 'AI service temporarily unavailable. Please try again shortly.');
      } else {
        showAlert('success', 'Professional summary generated!');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message;
      if (errorMsg.includes('429') || errorMsg.toLowerCase().includes('quota') || errorMsg.toLowerCase().includes('rate')) {
        showAlert('error', 'AI service rate limit reached. Please wait a moment and try again.');
      } else {
        showAlert('error', 'Failed to generate summary');
      }
      console.error(error);
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleApplySummary = async () => {
    try {
      await cvAssistantAPI.applySummary(generatedSummary);
      
      // Update CV data
      const updatedCV = await cvAPI.getCV();
      setCvData(updatedCV);
      
      showAlert('success', 'Summary applied to your CV!');
      setGeneratedSummary(null);
    } catch (error) {
      showAlert('error', 'Failed to apply summary');
      console.error(error);
    }
  };

  const handleApplyBullets = async (expIndex) => {
    try {
      const bullets = improvedBullets[expIndex];
      if (!bullets || bullets.length === 0) return;

      // Join bullets with proper line breaks for HTML display
      const updatedDescription = bullets.map(b => `• ${b}`).join('\n\n');
      
      // Create updated experiences array
      const updatedExperiences = [...cvData.experiences];
      updatedExperiences[expIndex] = {
        ...updatedExperiences[expIndex],
        description: updatedDescription
      };

      // Save updated CV
      await cvAPI.saveCV({
        ...cvData,
        experiences: updatedExperiences
      });

      // Reload CV data
      const updatedCV = await cvAPI.getCV();
      setCvData(updatedCV);

      // Clear improved bullets for this experience
      const newImprovedBullets = { ...improvedBullets };
      delete newImprovedBullets[expIndex];
      setImprovedBullets(newImprovedBullets);

      showAlert('success', 'Bullet points applied to your CV!');
    } catch (error) {
      showAlert('error', 'Failed to apply bullet points');
      console.error(error);
    }
  };

  const handleImproveBullets = async (expIndex) => {
    try {
      setImprovingBullets(true);
      const result = await cvAssistantAPI.improveBulletPoints(expIndex);
      
      setImprovedBullets({
        ...improvedBullets,
        [expIndex]: result.bullet_points
      });
      
      // Check if it's a rate limit response
      if (result.bullet_points.length > 0 && result.bullet_points[0].includes('⚠️')) {
        showAlert('error', 'AI service temporarily unavailable. Please try again shortly.');
      } else {
        showAlert('success', 'Bullet points improved!');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message;
      if (errorMsg.includes('429') || errorMsg.toLowerCase().includes('quota') || errorMsg.toLowerCase().includes('rate')) {
        showAlert('error', 'AI service rate limit reached. Please wait a moment and try again.');
      } else {
        showAlert('error', 'Failed to improve bullet points');
      }
      console.error(error);
    } finally {
      setImprovingBullets(false);
    }
  };

  const handleLoadLinkedInSuggestions = async () => {
    try {
      const suggestions = await cvAssistantAPI.getLinkedInSuggestions();
      setLinkedinSuggestions(suggestions);
      
      // Check if it's a rate limit response
      if (suggestions.headline.includes('⚠️')) {
        showAlert('error', 'AI service temporarily unavailable. Showing fallback suggestions.');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message;
      if (errorMsg.includes('429') || errorMsg.toLowerCase().includes('quota') || errorMsg.toLowerCase().includes('rate')) {
        showAlert('error', 'AI service rate limit reached. Please try again in a few moments.');
      } else {
        showAlert('error', 'Failed to load LinkedIn suggestions');
      }
      console.error(error);
    }
  };

  const handleLoadPortfolioSuggestions = async () => {
    try {
      const suggestions = await cvAssistantAPI.getPortfolioSuggestions();
      setPortfolioSuggestions(suggestions);
      
      // Check if it's a rate limit response
      if (suggestions.structure.includes('⚠️')) {
        showAlert('error', 'AI service temporarily unavailable. Showing fallback suggestions.');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message;
      if (errorMsg.includes('429') || errorMsg.toLowerCase().includes('quota') || errorMsg.toLowerCase().includes('rate')) {
        showAlert('error', 'AI service rate limit reached. Please try again in a few moments.');
      } else {
        showAlert('error', 'Failed to load portfolio suggestions');
      }
      console.error(error);
    }
  };

  const handleLoadKeywords = async () => {
    try {
      const result = await cvAssistantAPI.getKeywords();
      setKeywords(result.keywords);
      
      // Check if it's a rate limit response
      if (result.keywords.length > 0 && result.keywords[0].includes('⚠️')) {
        showAlert('error', 'AI service temporarily unavailable. Showing fallback keywords.');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message;
      if (errorMsg.includes('429') || errorMsg.toLowerCase().includes('quota') || errorMsg.toLowerCase().includes('rate')) {
        showAlert('error', 'AI service rate limit reached. Please try again in a few moments.');
      } else {
        showAlert('error', 'Failed to load keywords');
      }
      console.error(error);
    }
  };

  const handleExportPDF = () => {
    // Open print dialog with CV preview
    window.print();
  };

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Present';
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateString; // Return original string if invalid
      }
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    } catch (error) {
      return dateString; // Return original string on error
    }
  };

  const getSkillName = (skillId) => {
    const skill = availableSkills.find(s => s.id === skillId);
    return skill ? skill.name : '';
  };

  // Helper function to format markdown text (convert **text** to bold)
  const formatMarkdown = (text) => {
    if (!text) return text;
    // Replace **text** with <strong>text</strong>
    return text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  };

  if (loading) {
    return (
      <div className="cv-assistant-container">
        <Navbar />
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading CV Assistant...</p>
        </div>
      </div>
    );
  }

  if (!cvData) {
    return (
      <div className="cv-assistant-container">
        <Navbar />
        <div className="empty-state-cv">
          <div className="empty-icon">📄</div>
          <h2>No CV Found</h2>
          <p>Create your CV first to use the CV Assistant</p>
          <button 
            className="btn-primary-large"
            onClick={() => navigate('/profile')}
          >
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cv-assistant-container">
      <Navbar />
      
      {/* Alert */}
      {alert && (
        <div className={`alert alert-${alert.type}`}>
          {alert.message}
        </div>
      )}

      {/* Header */}
      <div className="cv-assistant-header">
        <div className="header-content">
          <div className="header-text">
            <h1> CV Assistant</h1>
            <p>AI-powered tools to create a professional, standout CV</p>
          </div>
          <button className="btn-export" onClick={handleExportPDF}>
            <span>📥</span> Export PDF
          </button>
        </div>

        {/* CV Completeness Score */}
        {analysis && (
          <div className="cv-score-card">
            <div className="score-circle">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8"/>
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="8"
                  strokeDasharray={`${analysis.percentage * 2.827}, 282.7`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="score-text">
                <span className="score-number">{analysis.percentage}%</span>
                <span className="score-label">Complete</span>
              </div>
            </div>
            <div className="score-details">
              <h3>CV Completeness</h3>
              <p className="assessment">{analysis.assessment}</p>
              {analysis.suggestions.length > 0 && (
                <div className="quick-suggestions">
                  <p className="suggestions-title">Quick Improvements:</p>
                  <ul>
                    {analysis.suggestions.slice(0, 3).map((sug, idx) => (
                      <li key={idx}>
                        <span className={`priority-badge ${sug.priority}`}>
                          {sug.priority}
                        </span>
                        {sug.suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="cv-assistant-content">
        {/* Sidebar Navigation */}
        <div className="sidebar-nav">
          <button 
            className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="nav-icon">📊</span>
            <span>Overview</span>
          </button>
          <button 
            className={`nav-btn ${activeTab === 'generate' ? 'active' : ''}`}
            onClick={() => setActiveTab('generate')}
          >
            <span className="nav-icon">✨</span>
            <span>Generate Summary</span>
          </button>
          <button 
            className={`nav-btn ${activeTab === 'improve' ? 'active' : ''}`}
            onClick={() => setActiveTab('improve')}
          >
            <span className="nav-icon">📝</span>
            <span>Improve Bullets</span>
          </button>
          <button 
            className={`nav-btn ${activeTab === 'linkedin' ? 'active' : ''}`}
            onClick={() => setActiveTab('linkedin')}
          >
            <span className="nav-icon">💼</span>
            <span>LinkedIn Tips</span>
          </button>
          <button 
            className={`nav-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveTab('portfolio')}
          >
            <span className="nav-icon">🌐</span>
            <span>Portfolio Tips</span>
          </button>
        </div>

        {/* Main Panel */}
        <div className="main-panel">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="tab-content">
              <h2>Your CV Overview</h2>
              
              <div className="cv-preview-card print-area">
                {/* Header */}
                <div className="cv-header-print">
                  <h1 className="cv-name">{profile.full_name || 'Your Name'}</h1>
                  <div className="cv-contact-info">
                    <span>{profile.email}</span>
                    {profile.phone_number && <span> | {profile.phone_number}</span>}
                    {profile.linkedin_url && <span> | LinkedIn</span>}
                    {profile.github_url && <span> | GitHub</span>}
                  </div>
                </div>

                {/* Professional Summary */}
                {cvData.personal_summary && (
                  <div className="cv-section">
                    <h3 className="cv-section-title">Professional Summary</h3>
                    <p className="cv-summary">{cvData.personal_summary}</p>
                  </div>
                )}

                {/* Skills */}
                {cvData.skills && cvData.skills.length > 0 && (
                  <div className="cv-section">
                    <h3 className="cv-section-title">Skills</h3>
                    <div className="cv-skills-grid">
                      {cvData.skills.map((skillId) => (
                        <span key={skillId} className="cv-skill-tag">
                          {getSkillName(skillId)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {cvData.experiences && cvData.experiences.length > 0 && (
                  <div className="cv-section">
                    <h3 className="cv-section-title">Work Experience</h3>
                    {cvData.experiences.map((exp, idx) => (
                      <div key={idx} className="cv-experience-item">
                        <div className="exp-header">
                          <div>
                            <h4 className="exp-title">{exp.title}</h4>
                            <p className="exp-company">{exp.company}</p>
                          </div>
                          <div className="exp-dates">
                            {formatDate(exp.start_date)} - {exp.current ? 'Present' : formatDate(exp.end_date)}
                          </div>
                        </div>
                        {exp.location && <p className="exp-location">📍 {exp.location}</p>}
                        {exp.description && <p className="exp-description">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Education */}
                {cvData.education && cvData.education.length > 0 && (
                  <div className="cv-section">
                    <h3 className="cv-section-title">Education</h3>
                    {cvData.education.map((edu, idx) => (
                      <div key={idx} className="cv-education-item">
                        <h4 className="edu-degree">{edu.degree}</h4>
                        <p className="edu-institution">{edu.institution}</p>
                        {edu.field && <p className="edu-field">{edu.field}</p>}
                        <div className="edu-meta">
                          {edu.graduation_year && <span>{edu.graduation_year}</span>}
                          {edu.gpa && <span> | GPA: {edu.gpa}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Projects */}
                {cvData.projects && cvData.projects.length > 0 && (
                  <div className="cv-section">
                    <h3 className="cv-section-title">Projects</h3>
                    {cvData.projects.map((proj, idx) => (
                      <div key={idx} className="cv-project-item">
                        <h4 className="proj-name">{proj.name}</h4>
                        {proj.description && <p className="proj-description">{proj.description}</p>}
                        {proj.technologies && <p className="proj-tech">Technologies: {proj.technologies}</p>}
                        {proj.link && <a href={proj.link} className="proj-link" target="_blank" rel="noopener noreferrer">View Project →</a>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ATS Keywords */}
              <div className="keywords-section">
                <h3>ATS Keywords</h3>
                <p className="section-description">
                  These keywords can help your CV pass Applicant Tracking Systems
                </p>
                {keywords.length === 0 ? (
                  <button className="btn-secondary" onClick={handleLoadKeywords}>
                    Generate Keywords
                  </button>
                ) : (
                  <div className="keywords-grid">
                    {keywords.map((keyword, idx) => (
                      <span key={idx} className="keyword-tag">{keyword}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Generate Summary Tab */}
          {activeTab === 'generate' && (
            <div className="tab-content">
              <h2>Generate Professional Summary</h2>
              <p className="section-description">
                Let AI create a compelling professional summary based on your profile and experience
              </p>

              <div className="generation-card">
                <div className="card-icon">✨</div>
                <h3>AI-Powered Summary Generation</h3>
                <p>
                  Our AI analyzes your experience, skills, and career goals to craft a 
                  professional summary that highlights your unique value proposition.
                </p>
                
                {!generatedSummary ? (
                  <button 
                    className="btn-primary-large"
                    onClick={handleGenerateSummary}
                    disabled={generatingSummary}
                  >
                    {generatingSummary ? (
                      <>
                        <span className="spinner-small"></span>
                        Generating...
                      </>
                    ) : (
                      <>
                        <span>🚀</span>
                        Generate Summary
                      </>
                    )}
                  </button>
                ) : (
                  <div className="generated-result">
                    <div className="result-header">
                      <h4>Generated Summary</h4>
                      <button 
                        className="btn-icon"
                        onClick={() => setGeneratedSummary(null)}
                        title="Clear"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="result-content">
                      <p>{generatedSummary}</p>
                    </div>
                    <div className="result-actions">
                      <button 
                        className="btn-secondary"
                        onClick={handleGenerateSummary}
                        disabled={generatingSummary}
                      >
                        Regenerate
                      </button>
                      <button 
                        className="btn-primary"
                        onClick={handleApplySummary}
                      >
                        Apply to CV
                      </button>
                    </div>
                  </div>
                )}

                {cvData.personal_summary && (
                  <div className="current-summary">
                    <h4>Current Summary</h4>
                    <p>{cvData.personal_summary}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Improve Bullets Tab */}
          {activeTab === 'improve' && (
            <div className="tab-content">
              <h2>Improve Bullet Points</h2>
              <p className="section-description">
                Transform your experience descriptions into strong, impactful bullet points
              </p>

              {cvData.experiences && cvData.experiences.length > 0 ? (
                <div className="experiences-list">
                  {cvData.experiences.map((exp, idx) => (
                    <div key={idx} className="experience-improvement-card">
                      <div className="exp-header">
                        <div>
                          <h3>{exp.title}</h3>
                          <p className="exp-company">{exp.company}</p>
                        </div>
                        <button 
                          className="btn-improve"
                          onClick={() => handleImproveBullets(idx)}
                          disabled={improvingBullets}
                        >
                          {improvingBullets ? 'Improving...' : '✨ Improve'}
                        </button>
                      </div>

                      {exp.description && (
                        <div className="current-description">
                          <h4>Current Description:</h4>
                          <p>{exp.description}</p>
                        </div>
                      )}

                      {improvedBullets[idx] && (
                        <div className="improved-bullets">
                          <h4>AI-Improved Bullet Points:</h4>
                          <ul>
                            {improvedBullets[idx].map((bullet, bidx) => (
                              <li key={bidx}>{bullet}</li>
                            ))}
                          </ul>
                          <div className="bullets-actions">
                            <button 
                              className="btn-text"
                              onClick={() => navigator.clipboard.writeText(improvedBullets[idx].join('\n'))}
                            >
                              📋 Copy All
                            </button>
                            <button 
                              className="btn-primary"
                              onClick={() => handleApplyBullets(idx)}
                            >
                              Apply to CV
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No work experiences found. Add experiences to your CV first.</p>
                  <button 
                    className="btn-secondary"
                    onClick={() => navigate('/profile')}
                  >
                    Add Experience
                  </button>
                </div>
              )}
            </div>
          )}

          {/* LinkedIn Tab */}
          {activeTab === 'linkedin' && (
            <div className="tab-content">
              <h2>LinkedIn Profile Optimization</h2>
              <p className="section-description">
                Get personalized recommendations to improve your LinkedIn presence
              </p>

              {!linkedinSuggestions ? (
                <div className="generation-card">
                  <div className="card-icon">💼</div>
                  <h3>LinkedIn Profile Analysis</h3>
                  <p>
                    Get AI-powered suggestions for your LinkedIn headline, about section, 
                    and general profile optimization tips.
                  </p>
                  <button 
                    className="btn-primary-large"
                    onClick={handleLoadLinkedInSuggestions}
                  >
                    <span>🚀</span>
                    Get Suggestions
                  </button>
                </div>
              ) : (
                <div className="suggestions-container">
                  {/* Headline */}
                  <div className="suggestion-card">
                    <h3>📌 Suggested Headline</h3>
                    <div className="suggestion-content">
                      <p className="headline-text">{linkedinSuggestions.headline}</p>
                      <button 
                        className="btn-copy"
                        onClick={() => {
                          navigator.clipboard.writeText(linkedinSuggestions.headline);
                          showAlert('success', 'Headline copied!');
                        }}
                      >
                        📋 Copy
                      </button>
                    </div>
                  </div>

                  {/* About Section */}
                  <div className="suggestion-card">
                    <h3>📝 Suggested About Section</h3>
                    <div className="suggestion-content">
                      <p className="about-text">{linkedinSuggestions.about}</p>
                      <button 
                        className="btn-copy"
                        onClick={() => {
                          navigator.clipboard.writeText(linkedinSuggestions.about);
                          showAlert('success', 'About section copied!');
                        }}
                      >
                        📋 Copy
                      </button>
                    </div>
                  </div>

                  {/* General Tips */}
                  <div className="suggestion-card">
                    <h3>💡 General Tips</h3>
                    <ul className="tips-list">
                      {linkedinSuggestions.general_tips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>

                  <button 
                    className="btn-secondary"
                    onClick={handleLoadLinkedInSuggestions}
                  >
                    Regenerate Suggestions
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <div className="tab-content">
              <h2>Portfolio Website Tips</h2>
              <p className="section-description">
                Learn how to create or improve your professional portfolio website
              </p>

              {!portfolioSuggestions ? (
                <div className="generation-card">
                  <div className="card-icon">🌐</div>
                  <h3>Portfolio Analysis</h3>
                  <p>
                    Get AI-powered recommendations for structuring your portfolio website, 
                    content ideas, and design tips.
                  </p>
                  <button 
                    className="btn-primary-large"
                    onClick={handleLoadPortfolioSuggestions}
                  >
                    <span>🚀</span>
                    Get Suggestions
                  </button>
                </div>
              ) : (
                <div className="suggestions-container accordion">
                  {/* Structure */}
                  <div className="accordion-item">
                    <button className="accordion-header" onClick={() => toggleSection('portfolio_structure')}>
                      <h3>🏗️ Recommended Structure</h3>
                      <span>{expandedSections['portfolio_structure'] ? '−' : '+'}</span>
                    </button>
                    {expandedSections['portfolio_structure'] && (
                      <div className="accordion-content">
                        <p className="structure-text" dangerouslySetInnerHTML={{ __html: formatMarkdown(portfolioSuggestions.structure) }}></p>
                      </div>
                    )}
                  </div>

                  {/* Content Suggestions */}
                  <div className="accordion-item">
                    <button className="accordion-header" onClick={() => toggleSection('portfolio_content')}>
                      <h3>📄 Content Ideas</h3>
                      <span>{expandedSections['portfolio_content'] ? '−' : '+'}</span>
                    </button>
                    {expandedSections['portfolio_content'] && (
                      <div className="accordion-content">
                        <ul className="tips-list-structured">
                          {portfolioSuggestions.content_suggestions.map((suggestion, idx) => (
                            <li key={idx}>
                              <span className="tip-icon">💡</span>
                              <p dangerouslySetInnerHTML={{ __html: formatMarkdown(suggestion) }}></p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Design Tips */}
                  <div className="accordion-item">
                    <button className="accordion-header" onClick={() => toggleSection('portfolio_design')}>
                      <h3>🎨 Design Tips</h3>
                      <span>{expandedSections['portfolio_design'] ? '−' : '+'}</span>
                    </button>
                    {expandedSections['portfolio_design'] && (
                      <div className="accordion-content">
                        <ul className="tips-list-structured">
                          {portfolioSuggestions.design_tips.map((tip, idx) => (
                            <li key={idx}>
                              <span className="tip-icon">🖌️</span>
                              <p dangerouslySetInnerHTML={{ __html: formatMarkdown(tip) }}></p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <button 
                    className="btn-secondary"
                    onClick={handleLoadPortfolioSuggestions}
                  >
                    Regenerate Suggestions
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CVAssistant;
