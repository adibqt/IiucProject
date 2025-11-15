import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import RecommendationPanel from "../components/opportunities/RecommendationPanel";
import OpportunityList from "../components/opportunities/OpportunityList";
import OpportunityDetailsModal from "../components/opportunities/OpportunityDetailsModal";
import opportunityAPI from "../services/opportunityService";
import "./Opportunities.css";

const Opportunities = () => {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [error, setError] = useState(null);
  const [recommendationError, setRecommendationError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/login", {
        state: {
          from: "/opportunities",
          message: "Please login to view opportunities",
        },
      });
      return;
    }

    // Check if user is admin
    const adminToken = localStorage.getItem("adminToken");
    setIsAdmin(!!adminToken);

    loadOpportunities();
  }, [navigate]);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get all opportunities (admin endpoint)
      // If user is not admin, this will fail gracefully
      try {
        const data = await opportunityAPI.getAllOpportunities();
        setOpportunities(Array.isArray(data) ? data : []);
      } catch (err) {
        // If not admin or endpoint not accessible, that's okay
        // User can still get recommendations which will populate the list
        console.log(
          "All opportunities endpoint not accessible (normal for non-admin users)"
        );
        setOpportunities([]);
      }
    } catch (err) {
      console.error("Error loading opportunities:", err);
      // Don't show error for non-admin users - they can use recommendations
      if (isAdmin) {
        setError("Failed to load opportunities. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGetRecommendations = async () => {
    try {
      setLoadingRecommendations(true);
      setRecommendationError(null);
      const data = await opportunityAPI.getRecommendations();
      setRecommendations(data);

      // Also update opportunities list with recommended ones
      if (data.opportunities && data.opportunities.length > 0) {
        setOpportunities(data.opportunities);
      }
    } catch (err) {
      console.error("Error getting recommendations:", err);
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        "Failed to get recommendations. Please try again.";
      setRecommendationError(errorMessage);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleViewDetails = (opportunity) => {
    setSelectedOpportunity(opportunity);
  };

  const handleCloseModal = () => {
    setSelectedOpportunity(null);
  };

  const handleDeleteOpportunity = async (id) => {
    if (!isAdmin) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this opportunity? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      await opportunityAPI.deleteOpportunity(id);
      setOpportunities((prev) => prev.filter((opp) => opp.id !== id));

      // Also remove from recommendations if present
      if (recommendations && recommendations.opportunities) {
        setRecommendations({
          ...recommendations,
          opportunities: recommendations.opportunities.filter(
            (opp) => opp.id !== id
          ),
          total_matched: recommendations.total_matched - 1,
        });
      }
    } catch (err) {
      console.error("Error deleting opportunity:", err);
      alert("Failed to delete opportunity. Please try again.");
    }
  };

  return (
    <div className="opportunities-page">
      {/* Animated Background */}
      <div className="opportunities-bg-grid" />
      <div className="opportunities-bg-orbs">
        <div className="opportunities-orb opportunities-orb-1" />
        <div className="opportunities-orb opportunities-orb-2" />
        <div className="opportunities-orb opportunities-orb-3" />
      </div>

      <Navbar />

      {/* Hero Section */}
      <div className="opportunities-hero">
        <div className="opportunities-hero-content">
          <h1>Local Opportunities</h1>
          <p>
            Discover curated jobs, internships, training programs, and youth
            development opportunities tailored for you
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="opportunities-content">
        <div className="opportunities-container">
          {/* Error Alert */}
          {error && (
            <div className="opportunities-alert opportunities-alert-error">
              <span className="alert-icon">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {/* Recommendation Panel */}
          <RecommendationPanel
            onGetRecommendations={handleGetRecommendations}
            recommendations={recommendations}
            loading={loadingRecommendations}
            error={recommendationError}
          />

          {/* All Opportunities Section */}
          <div className="opportunities-section">
            <div className="opportunities-section-header">
              <h2>
                {recommendations
                  ? "Recommended Opportunities"
                  : "All Local Opportunities"}
              </h2>
              <p className="opportunities-section-subtitle">
                {recommendations
                  ? `${recommendations.total_matched} opportunities matched your profile`
                  : "Browse all available opportunities in our database"}
              </p>
            </div>

            <OpportunityList
              opportunities={opportunities}
              onViewDetails={handleViewDetails}
              onDelete={handleDeleteOpportunity}
              isAdmin={isAdmin}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Opportunity Details Modal */}
      {selectedOpportunity && (
        <OpportunityDetailsModal
          opportunity={selectedOpportunity}
          onClose={handleCloseModal}
          isAdmin={isAdmin}
          onDelete={handleDeleteOpportunity}
        />
      )}
    </div>
  );
};

export default Opportunities;
