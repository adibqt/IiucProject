import React, { useState } from "react";
import { copyToClipboard } from "../../utils/copyToClipboard";
import RoadmapCharts from "./RoadmapCharts";
import "./RoadmapDisplay.css";

const RoadmapDisplay = ({ visual, description, targetRole, timeframe }) => {
  const [copySuccess, setCopySuccess] = useState(null);

  const handleCopyVisual = async () => {
    const success = await copyToClipboard(visual);
    if (success) {
      setCopySuccess("visual");
      setTimeout(() => setCopySuccess(null), 2000);
    }
  };

  const handleCopyFull = async () => {
    const fullText = `${visual}\n\n${"=".repeat(60)}\n\n${description}`;
    const success = await copyToClipboard(fullText);
    if (success) {
      setCopySuccess("full");
      setTimeout(() => setCopySuccess(null), 2000);
    }
  };

  return (
    <div className="roadmap-display-container">
      <div className="roadmap-display-header">
        <div className="roadmap-display-title-section">
          <h2 className="roadmap-display-title">
            {targetRole} Roadmap ({timeframe})
          </h2>
        </div>
        <div className="roadmap-display-actions">
          <button
            className="roadmap-copy-btn"
            onClick={handleCopyVisual}
            title="Copy visual roadmap"
          >
            {copySuccess === "visual" ? (
              <>
                <span className="roadmap-copy-icon">✓</span>
                Copied!
              </>
            ) : (
              <>
                <span className="roadmap-copy-icon">📋</span>
                Copy Visual
              </>
            )}
          </button>
          <button
            className="roadmap-copy-btn"
            onClick={handleCopyFull}
            title="Copy full roadmap"
          >
            {copySuccess === "full" ? (
              <>
                <span className="roadmap-copy-icon">✓</span>
                Copied!
              </>
            ) : (
              <>
                <span className="roadmap-copy-icon">📋</span>
                Copy Full
              </>
            )}
          </button>
          <button className="roadmap-download-btn" disabled title="Coming soon">
            <span className="roadmap-download-icon">📄</span>
            Download PDF
          </button>
        </div>
      </div>

      <div className="roadmap-display-content">
        {/* Visual Roadmap Section */}
        <div className="roadmap-visual-section">
          <h3 className="roadmap-section-title">Roadmap Visualization</h3>
          <div className="roadmap-visual-wrapper">
            <RoadmapCharts visual={visual} timeframe={timeframe} />
          </div>
        </div>

        {/* Description Section */}
        <div className="roadmap-description-section">
          <h3 className="roadmap-section-title">Detailed Explanation</h3>
          <div className="roadmap-description-wrapper">
            <div className="roadmap-description-text">
              {description.split("\n").map((line, index) => {
                // Handle headings (lines starting with # or ===)
                if (line.trim().startsWith("=") && line.trim().length > 10) {
                  return (
                    <div key={index} className="roadmap-description-separator">
                      {line}
                    </div>
                  );
                }
                // Handle empty lines
                if (line.trim() === "") {
                  return <br key={index} />;
                }
                // Regular text
                return (
                  <p key={index} className="roadmap-description-paragraph">
                    {line}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapDisplay;
