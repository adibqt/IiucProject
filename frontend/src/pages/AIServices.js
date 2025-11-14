/**
 * SkillCoach AI - AI Services Hub
 * Centralized page for all AI-powered features
 */
import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./AIServices.css";

const AIServices = () => {
  const navigate = useNavigate();

  const services = [
    {
      id: 1,
      title: "Job Recommendation",
      description:
        "Get personalized job recommendations based on your skills, experience, and career interests using AI-powered matching.",
      icon: "💼",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      features: [
        "Smart job matching",
        "Skill gap analysis",
        "Match score ranking",
      ],
      status: "Active",
      route: "/ai/job-recommendation",
    },
    {
      id: 2,
      title: "Career Roadmap",
      description:
        "Receive a personalized career development roadmap with learning paths, skill requirements, and milestones to achieve your goals.",
      icon: "🗺️",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      features: [
        "Personalized learning paths",
        "Skill progression tracking",
        "Industry insights",
      ],
      status: "Coming Soon",
      route: "/ai/career-roadmap",
    },
    {
      id: 3,
      title: "CareerBot",
      description:
        "Chat with our AI career assistant for instant advice on career planning, skill development, interview prep, and more.",
      icon: "🤖",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      features: [
        "24/7 career guidance",
        "Interview preparation",
        "Resume tips & feedback",
      ],
      status: "Coming Soon",
      route: "/ai/careerbot",
    },
    {
      id: 4,
      title: "CV/Profile Assistant",
      description:
        "AI-powered CV analysis and optimization suggestions to make your profile stand out to recruiters and employers.",
      icon: "📄",
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      features: [
        "CV optimization tips",
        "Profile strength analysis",
        "Keyword suggestions",
      ],
      status: "Coming Soon",
      route: "/ai/cv-assistant",
    },
  ];

  const handleServiceClick = (service) => {
    if (service.status === "Active") {
      navigate(service.route);
    } else if (service.status === "Coming Soon") {
      alert(`${service.title} is coming soon! Stay tuned.`);
    } else {
      navigate(service.route);
    }
  };

  return (
    <div className="ai-services-page">
      <Navbar />
      
      <div className="ai-services-container">
        {/* Hero Section */}
        <div className="ai-services-hero">
          <div className="ai-hero-icon">✨</div>
          <h1 className="ai-services-title">SkillCoach AI</h1>
          <p className="ai-services-subtitle">
            Unlock your career potential with AI-powered tools and personalized guidance
          </p>
          <div className="ai-hero-badge">
            <span className="badge-dot"></span>
            Powered by Advanced AI
          </div>
        </div>

        {/* Services Grid */}
        <div className="ai-services-grid">
          {services.map((service) => (
            <div
              key={service.id}
              className="ai-service-card"
              onClick={() => handleServiceClick(service)}
            >
              {/* Card Header with Icon */}
              <div
                className="ai-card-header"
                style={{ background: service.gradient }}
              >
                <div className="ai-card-icon">{service.icon}</div>
                {service.status && (
                  <span className="ai-card-status">{service.status}</span>
                )}
              </div>

              {/* Card Content */}
              <div className="ai-card-content">
                <h3 className="ai-card-title">{service.title}</h3>
                <p className="ai-card-description">{service.description}</p>

                {/* Features List */}
                <ul className="ai-card-features">
                  {service.features.map((feature, index) => (
                    <li key={index} className="ai-feature-item">
                      <span className="feature-check">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Card Action */}
                <button className="ai-card-button">
                  {service.status === "Coming Soon" 
                    ? "Notify Me" 
                    : service.status === "Active"
                    ? "Get Started"
                    : "Learn More"}
                  <span className="button-arrow">→</span>
                </button>
              </div>

              {/* Hover Effect Overlay */}
              <div className="ai-card-overlay"></div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="ai-services-footer">
          <p>
            🚀 More AI-powered features coming soon! We're constantly improving
            to help you achieve your career goals.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIServices;
