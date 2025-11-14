import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import RoadmapForm from "../components/roadmap/RoadmapForm";
import RoadmapDisplay from "../components/roadmap/RoadmapDisplay";
import RoadmapList from "../components/roadmap/RoadmapList";
import roadmapAPI from "../services/roadmapService";
import "./Roadmap.css";

// Helper function to extract error message from API errors
const extractErrorMessage = (err) => {
  if (!err) return null;

  // Check if it's an axios error with response data
  if (err.response?.data) {
    const detail = err.response.data.detail;

    // If detail is a string, return it
    if (typeof detail === "string") {
      return detail;
    }

    // If detail is an array (validation errors), format them
    if (Array.isArray(detail)) {
      return detail
        .map((error) => {
          if (typeof error === "string") return error;
          if (error.msg) {
            const loc = error.loc ? error.loc.join(".") : "";
            return `${loc ? `${loc}: ` : ""}${error.msg}`;
          }
          return JSON.stringify(error);
        })
        .join(", ");
    }

    // If detail is an object, try to extract message
    if (typeof detail === "object") {
      return detail.message || detail.msg || JSON.stringify(detail);
    }
  }

  // Fallback to error message
  if (err.message) {
    return err.message;
  }

  return null;
};

const Roadmap = () => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [currentRoadmap, setCurrentRoadmap] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load all roadmaps on mount
  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await roadmapAPI.getAllRoadmaps();
      console.log("Fetched roadmaps data:", data);
      // Ensure data is an array
      const roadmapsArray = Array.isArray(data) ? data : [];
      setRoadmaps(roadmapsArray);
      console.log("Set roadmaps:", roadmapsArray);
    } catch (err) {
      console.error("Failed to fetch roadmaps:", err);
      const errorMessage = extractErrorMessage(err);
      const finalMessage =
        errorMessage || "Failed to load roadmaps. Please try again.";
      setError(finalMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async (payload) => {
    setIsGenerating(true);
    setError(null);
    setSuccess(null);
    setCurrentRoadmap(null);

    try {
      const response = await roadmapAPI.generateRoadmap(payload);

      // Set the generated roadmap as current
      const newRoadmap = {
        id: response.roadmap_id,
        target_role: payload.targetRole,
        timeframe: payload.timeframe,
        weekly_hours: payload.weeklyHours || null,
        roadmap_visual: response.visual,
        roadmap_description: response.description,
        created_at: new Date().toISOString(),
      };

      setCurrentRoadmap(newRoadmap);
      setSuccess("Roadmap generated successfully!");

      // Refresh the list to include the new roadmap
      await fetchRoadmaps();
    } catch (err) {
      console.error("Failed to generate roadmap:", err);
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage || "Failed to generate roadmap. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewRoadmap = async (roadmapId) => {
    setError(null);
    setSuccess(null);

    try {
      const roadmap = await roadmapAPI.getRoadmapById(roadmapId);
      setCurrentRoadmap(roadmap);

      // Scroll to the roadmap display
      setTimeout(() => {
        const displayElement = document.querySelector(
          ".roadmap-display-container"
        );
        if (displayElement) {
          displayElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } catch (err) {
      console.error("Failed to load roadmap:", err);
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage || "Failed to load roadmap. Please try again.");
    }
  };

  const handleDeleteRoadmap = async (roadmapId) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      "Are you sure you want to delete this roadmap? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      await roadmapAPI.deleteRoadmap(roadmapId);

      // Remove from list
      setRoadmaps((prev) => prev.filter((r) => r.id !== roadmapId));

      // Clear current roadmap if it was the deleted one
      if (currentRoadmap && currentRoadmap.id === roadmapId) {
        setCurrentRoadmap(null);
      }

      setSuccess("Roadmap deleted successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Failed to delete roadmap:", err);
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage || "Failed to delete roadmap. Please try again.");
    }
  };

  return (
    <div className="roadmap-page">
      <Navbar />

      <div className="roadmap-container">
        <div className="roadmap-header">
          <div className="roadmap-header-content">
            <h1>Career Roadmap</h1>
            <p>
              AI-powered personalized learning paths to reach your career goals
            </p>
          </div>
        </div>

        {/* Alerts */}
        {error && typeof error === "string" && (
          <div className="roadmap-alert roadmap-alert-error">{error}</div>
        )}
        {success && typeof success === "string" && (
          <div className="roadmap-alert roadmap-alert-success">{success}</div>
        )}

        {/* Roadmap Generator Form */}
        <RoadmapForm onSubmit={handleGenerate} isLoading={isGenerating} />

        {/* Generated Roadmap Display */}
        {currentRoadmap && (
          <RoadmapDisplay
            visual={currentRoadmap.roadmap_visual}
            description={currentRoadmap.roadmap_description}
            targetRole={currentRoadmap.target_role}
            timeframe={currentRoadmap.timeframe}
          />
        )}

        {/* Saved Roadmaps List */}
        <RoadmapList
          roadmaps={roadmaps}
          onView={handleViewRoadmap}
          onDelete={handleDeleteRoadmap}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Roadmap;
