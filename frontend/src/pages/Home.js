/**
 * Home Page
 * Landing page for NutriMap - AI-Powered Learning Platform
 * Showcases features, benefits, and provides login options
 */

import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import SkillSyncLogo from "../components/SkillSyncLogo";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [scrollY, setScrollY] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Parallax scrolling effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="home-container">
      {/* Animated Background */}
      <div
        className="home-bg-grid"
        style={{ transform: `translateY(${scrollY * 0.5}px)` }}
      />
      <div className="home-bg-orbs">
        <div className="home-orb home-orb-1" />
        <div className="home-orb home-orb-2" />
        <div className="home-orb home-orb-3" />
      </div>

      {/* Navigation Bar */}
      <nav className="home-nav">
        <div className="home-nav-container">
          <div className="home-nav-logo">
            <SkillSyncLogo />
          </div>
          <div className="home-nav-links">
            <a href="#features" className="home-nav-link">
              Features
            </a>
            <a href="#benefits" className="home-nav-link">
              Benefits
            </a>
            <a href="#platforms" className="home-nav-link">
              Platforms
            </a>
            <a href="#auth" className="home-nav-link home-nav-auth">
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero-content">
          <h1 className="home-hero-title">
            NutriMap
            <span className="home-hero-subtitle-inline">
              AI-Powered Learning Platform
            </span>
          </h1>
          <p className="home-hero-description">
            Master new skills, track your progress, and unlock your potential
            with intelligent learning recommendations
          </p>
          <div className="home-hero-buttons">
            <Link to="/login" className="home-btn home-btn-primary">
              Sign In as Student
            </Link>
            <Link to="/admin" className="home-btn home-btn-secondary">
              Admin Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="home-features">
        <div className="home-section-container">
          <h2 className="home-section-title">Powerful Features</h2>
          <p className="home-section-subtitle">
            Everything you need to succeed in your learning journey
          </p>

          <div className="home-features-grid">
            {/* Feature 1 */}
            <div className="home-feature-card">
              <div className="home-feature-icon">🎯</div>
              <h3>Smart Goal Setting</h3>
              <p>
                Set meaningful learning goals and track progress with
                intelligent milestones
              </p>
            </div>

            {/* Feature 2 */}
            <div className="home-feature-card">
              <div className="home-feature-icon">🤖</div>
              <h3>AI Recommendations</h3>
              <p>
                Get personalized skill recommendations based on your profile and
                goals
              </p>
            </div>

            {/* Feature 3 */}
            <div className="home-feature-card">
              <div className="home-feature-icon">📊</div>
              <h3>Progress Analytics</h3>
              <p>
                Visualize your learning journey with detailed progress charts
                and insights
              </p>
            </div>

            {/* Feature 4 */}
            <div className="home-feature-card">
              <div className="home-feature-icon">🎓</div>
              <h3>Skill Tracking</h3>
              <p>
                Maintain a comprehensive skill portfolio and showcase your
                expertise
              </p>
            </div>

            {/* Feature 5 */}
            <div className="home-feature-card">
              <div className="home-feature-icon">💼</div>
              <h3>Career Roadmap</h3>
              <p>Explore career paths aligned with your skills and interests</p>
            </div>

            {/* Feature 6 */}
            <div className="home-feature-card">
              <div className="home-feature-icon">📚</div>
              <h3>Learning Resources</h3>
              <p>
                Access curated resources, courses, and tutorials for every skill
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="home-benefits">
        <div className="home-section-container">
          <h2 className="home-section-title">Why Choose NutriMap?</h2>

          <div className="home-benefits-grid">
            {/* Benefit 1 */}
            <div className="home-benefit-item">
              <div className="home-benefit-number">1</div>
              <h3>Personalized Learning</h3>
              <p>
                Every student gets a customized learning path based on their
                unique abilities and goals
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="home-benefit-item">
              <div className="home-benefit-number">2</div>
              <h3>Industry-Aligned Skills</h3>
              <p>
                Learn skills that are in demand in today's job market with
                real-world applications
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="home-benefit-item">
              <div className="home-benefit-number">3</div>
              <h3>Expert Guidance</h3>
              <p>
                Get recommendations from AI trained on successful learning
                patterns
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="home-benefit-item">
              <div className="home-benefit-number">4</div>
              <h3>Community Support</h3>
              <p>
                Join a vibrant community of learners and share your progress
              </p>
            </div>

            {/* Benefit 5 */}
            <div className="home-benefit-item">
              <div className="home-benefit-number">5</div>
              <h3>Career Growth</h3>
              <p>
                Transform your skills into career opportunities with our job
                matching
              </p>
            </div>

            {/* Benefit 6 */}
            <div className="home-benefit-item">
              <div className="home-benefit-number">6</div>
              <h3>Lifetime Access</h3>
              <p>Get lifetime access to all resources and continuous updates</p>
            </div>
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section id="platforms" className="home-platforms">
        <div className="home-section-container">
          <h2 className="home-section-title">For Everyone</h2>
          <p className="home-section-subtitle">
            NutriMap serves different user roles with tailored experiences
          </p>

          <div className="home-platforms-grid">
            {/* Students Platform */}
            <div className="home-platform-card">
              <div className="home-platform-icon">👨‍🎓</div>
              <h3>For Students</h3>
              <ul className="home-platform-features">
                <li>✓ Track your skills development</li>
                <li>✓ Get personalized recommendations</li>
                <li>✓ Build your portfolio</li>
                <li>✓ Access learning resources</li>
                <li>✓ Explore career paths</li>
              </ul>
              <Link to="/login" className="home-platform-btn">
                Student Login
              </Link>
            </div>

            {/* Admin Platform */}
            <div className="home-platform-card home-platform-admin">
              <div className="home-platform-icon">🛡️</div>
              <h3>For Administrators</h3>
              <ul className="home-platform-features">
                <li>✓ Manage users and courses</li>
                <li>✓ Track platform analytics</li>
                <li>✓ Configure skill categories</li>
                <li>✓ Monitor student progress</li>
                <li>✓ Generate reports</li>
              </ul>
              <Link
                to="/admin"
                className="home-platform-btn home-platform-btn-admin"
              >
                Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="auth" className="home-cta">
        <div className="home-section-container">
          <div className="home-cta-content">
            <h2>Ready to Start Learning?</h2>
            <p>
              Join thousands of students already transforming their careers with
              NutriMap
            </p>
            <div className="home-cta-buttons">
              <Link to="/register" className="home-btn home-btn-large">
                Create Free Account
              </Link>
              <Link
                to="/admin"
                className="home-btn home-btn-large home-btn-alt"
              >
                Admin Access
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-section-container">
          <div className="home-footer-content">
            <div className="home-footer-section">
              <h4>About NutriMap</h4>
              <p>
                An AI-powered learning platform designed to help students master
                skills and achieve their career goals.
              </p>
            </div>

            <div className="home-footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li>
                  <a href="#features">Features</a>
                </li>
                <li>
                  <a href="#benefits">Benefits</a>
                </li>
                <li>
                  <a href="#platforms">Platforms</a>
                </li>
                <li>
                  <Link to="/login">Student Login</Link>
                </li>
              </ul>
            </div>

            <div className="home-footer-section">
              <h4>Resources</h4>
              <ul>
                <li>
                  <a href="#contact">Contact Us</a>
                </li>
                <li>
                  <a href="#privacy">Privacy Policy</a>
                </li>
                <li>
                  <a href="#terms">Terms of Service</a>
                </li>
                <li>
                  <a href="#faq">FAQ</a>
                </li>
              </ul>
            </div>

            <div className="home-footer-section">
              <h4>Connect</h4>
              <ul>
                <li>
                  <a href="#twitter">Twitter</a>
                </li>
                <li>
                  <a href="#linkedin">LinkedIn</a>
                </li>
                <li>
                  <a href="#github">GitHub</a>
                </li>
                <li>
                  <a href="#email">Email</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="home-footer-bottom">
            <p>&copy; 2025 NutriMap. All rights reserved.</p>
            <p>An AI-Powered Learning Platform for Career Growth</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
