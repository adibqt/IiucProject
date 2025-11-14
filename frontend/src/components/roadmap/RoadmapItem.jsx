import React from "react";
import "./RoadmapItem.css";

const RoadmapItem = ({ roadmap, onView, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="roadmap-item">
      <div className="roadmap-item-content">
        <div className="roadmap-item-header">
          <h3 className="roadmap-item-title">{roadmap.target_role}</h3>
          <span className="roadmap-item-timeframe">{roadmap.timeframe}</span>
        </div>
        <div className="roadmap-item-meta">
          <span className="roadmap-item-date">
            Created: {formatDate(roadmap.created_at)}
          </span>
          {roadmap.weekly_hours && (
            <span className="roadmap-item-hours">
              {roadmap.weekly_hours} hrs/week
            </span>
          )}
        </div>
      </div>
      <div className="roadmap-item-actions">
        <button
          className="roadmap-item-btn roadmap-item-btn-view"
          onClick={() => onView(roadmap.id)}
        >
          View
        </button>
        <button
          className="roadmap-item-btn roadmap-item-btn-delete"
          onClick={() => onDelete(roadmap.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default RoadmapItem;
