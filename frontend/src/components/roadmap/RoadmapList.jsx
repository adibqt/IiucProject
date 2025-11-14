import React from "react";
import RoadmapItem from "./RoadmapItem";
import "./RoadmapList.css";

const RoadmapList = ({ roadmaps, onView, onDelete, isLoading }) => {
  if (isLoading) {
    return (
      <div className="roadmap-list-container">
        <div className="roadmap-list-loading">
          <div className="roadmap-list-spinner"></div>
          <p>Loading roadmaps...</p>
        </div>
      </div>
    );
  }

  if (!roadmaps || roadmaps.length === 0) {
    return (
      <div className="roadmap-list-container">
        <div className="roadmap-list-empty">
          <div className="roadmap-list-empty-icon">📋</div>
          <h3>No saved roadmaps yet</h3>
          <p>Generate your first career roadmap to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="roadmap-list-container">
      <div className="roadmap-list-header">
        <h2 className="roadmap-list-title">Saved Roadmaps</h2>
        <span className="roadmap-list-count">
          {roadmaps.length} roadmap{roadmaps.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="roadmap-list-items">
        {roadmaps.map((roadmap) => (
          <RoadmapItem
            key={roadmap.id}
            roadmap={roadmap}
            onView={onView}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default RoadmapList;
