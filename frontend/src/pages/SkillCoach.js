/**
 * SkillCoach AI Page - Hub for AI-powered career guidance tools
 */
import React from "react";
import { useNavigate } from "react-router-dom";
import "./SkillCoach.css";
import Navbar from "../components/Navbar";

const SkillCoach = () => {
  const navigate = useNavigate();

  const features = [
    {
      id: 1,
      title: "CareerBot",
      description: "AI-powered chatbot that provides personalized career guidance, answers your questions, and helps you navigate your professional journey.",
      icon: "🤖",
      color: "cyan",
      path: "/skillcoach/careerbot",
    },
    {
      id: 2,
      title: "Career Roadmap",
      description: "Get a customized step-by-step roadmap to achieve your career goals based on your skills, interests, and target positions.",
      icon: "🗺️",
      color: "purple",
      path: "/skillcoach/roadmap",
    },
    {
      id: 3,
      title: "Job Recommendation",
      description: "Discover job opportunities perfectly matched to your skills and preferences using advanced AI recommendation algorithms.",
      icon: "💼",
      color: "blue",
      path: "/skillcoach/recommendations",
    },
  ];

  return (
    <div className="skillcoach-page">
      <Navbar />
      <div className="skillcoach-container">
        <div className="skillcoach-header">
          <div className="skillcoach-header-content">
            <h1 className="skillcoach-title">
              <span className="title-icon">🎯</span>
              SkillCoach AI
            </h1>
            <p className="skillcoach-subtitle">
              Your intelligent career companion powered by artificial intelligence
            </p>
          </div>
        </div>

        <div className="skillcoach-content">
          <div className="features-grid">
            {features.map((feature) => (
              <div
                key={feature.id}
                className={`feature-card feature-card-${feature.color}`}
                onClick={() => navigate(feature.path)}
              >
                <div className="feature-card-inner">
                  <div className="feature-icon-wrapper">
                    <span className="feature-icon">{feature.icon}</span>
                  </div>
                  <h2 className="feature-title">{feature.title}</h2>
                  <p className="feature-description">{feature.description}</p>
                  <div className="feature-arrow">→</div>
                </div>
              </div>
            ))}
          </div>

          <div className="skillcoach-info">
            <div className="info-card">
              <h3>✨ Powered by Advanced AI</h3>
              <p>
                Our AI tools analyze your profile, skills, and career interests to
                provide personalized recommendations and guidance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillCoach;
