import React, { useState } from "react";
import "./RecommendationPanel.css";

const RecommendationPanel = ({
  onGetRecommendations,
  recommendations,
  loading,
  error,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="recommendation-panel">
      <div className="recommendation-panel-header">
        <div className="recommendation-panel-title-section">
          <h2 className="recommendation-panel-title">
            <span className="recommendation-icon">🎯</span>
            Personalized Recommendations
          </h2>
          <p className="recommendation-panel-subtitle">
            Get AI-powered recommendations based on your profile, skills, and
            career interests
          </p>
        </div>
        {!recommendations && (
          <button
            className="recommendation-btn-get"
            onClick={onGetRecommendations}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Generating...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Get Recommendations
              </>
            )}
          </button>
        )}
      </div>

      {loading && !recommendations && (
        <div className="recommendation-loading">
          <div className="spinner-large"></div>
          <p>
            Analyzing your profile and generating personalized
            recommendations...
          </p>
        </div>
      )}

      {error && (
        <div className="recommendation-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {recommendations && (
        <div className="recommendation-content">
          <div className="recommendation-content-header">
            <button
              className="recommendation-toggle-btn"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Collapse" : "Expand"} Recommendations
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                style={{
                  transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.3s",
                }}
              >
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button
              className="recommendation-btn-refresh"
              onClick={onGetRecommendations}
              disabled={loading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M1 4v6h6M23 20v-6h-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Refresh
            </button>
          </div>

          {isExpanded && (
            <div className="recommendation-explanation">
              <div className="recommendation-text">
                {(() => {
                  const lines = recommendations.explanation.split("\n");
                  const elements = [];
                  let currentList = [];

                  lines.forEach((line, idx) => {
                    // Handle headers
                    if (line.startsWith("## ")) {
                      // Close any open list
                      if (currentList.length > 0) {
                        elements.push(<ul key={`ul-${idx}`}>{currentList}</ul>);
                        currentList = [];
                      }
                      elements.push(
                        <h2 key={idx}>{line.replace(/^## /, "")}</h2>
                      );
                      return;
                    }
                    if (line.startsWith("### ")) {
                      // Close any open list
                      if (currentList.length > 0) {
                        elements.push(<ul key={`ul-${idx}`}>{currentList}</ul>);
                        currentList = [];
                      }
                      elements.push(
                        <h3 key={idx}>{line.replace(/^### /, "")}</h3>
                      );
                      return;
                    }
                    // Handle horizontal rules
                    if (line.trim() === "---") {
                      // Close any open list
                      if (currentList.length > 0) {
                        elements.push(<ul key={`ul-${idx}`}>{currentList}</ul>);
                        currentList = [];
                      }
                      elements.push(<hr key={idx} />);
                      return;
                    }
                    // Handle bullet points
                    if (line.trim().match(/^[-•*]\s/)) {
                      const content = line.replace(/^[-•*]\s/, "");
                      const listItem = (
                        <li key={idx}>
                          {content
                            .split(/\*\*(.*?)\*\*/g)
                            .map((part, i) =>
                              i % 2 === 1 ? (
                                <strong key={i}>{part}</strong>
                              ) : (
                                part
                              )
                            )}
                        </li>
                      );
                      currentList.push(listItem);
                      return;
                    }
                    // Close list if we hit a non-list item
                    if (currentList.length > 0) {
                      elements.push(<ul key={`ul-${idx}`}>{currentList}</ul>);
                      currentList = [];
                    }
                    // Handle bold text in paragraphs
                    if (line.includes("**")) {
                      const parts = line.split(/\*\*(.*?)\*\*/g);
                      elements.push(
                        <p key={idx}>
                          {parts.map((part, i) =>
                            i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                          )}
                        </p>
                      );
                      return;
                    }
                    // Regular paragraph
                    if (line.trim()) {
                      elements.push(<p key={idx}>{line}</p>);
                      return;
                    }
                    // Empty line
                    elements.push(<br key={idx} />);
                  });

                  // Close any remaining list
                  if (currentList.length > 0) {
                    elements.push(<ul key="ul-final">{currentList}</ul>);
                  }

                  return elements;
                })()}
              </div>
            </div>
          )}

          {recommendations.opportunities &&
            recommendations.opportunities.length > 0 && (
              <div className="recommendation-opportunities-summary">
                <p className="recommendation-summary-text">
                  <strong>{recommendations.total_matched}</strong> opportunity
                  {recommendations.total_matched !== 1 ? "ies" : ""} matched
                  your profile
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default RecommendationPanel;
