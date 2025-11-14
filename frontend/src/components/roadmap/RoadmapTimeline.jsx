import React from "react";
import "./RoadmapTimeline.css";

const RoadmapTimeline = ({ visual }) => {
  // Parse the visual roadmap to extract phases
  const parsePhases = (text) => {
    const phases = [];
    const lines = text.split("\n");
    let currentPhase = null;
    let currentTasks = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detect phase headers like [PHASE 1: FOUNDATIONS] (Weeks 1–2)
      const phaseMatch = line.match(
        /\[PHASE\s+(\d+):\s*([^\]]+)\]\s*\(([^)]+)\)/i
      );
      if (phaseMatch) {
        // Save previous phase
        if (currentPhase) {
          phases.push({
            ...currentPhase,
            tasks: currentTasks,
          });
        }
        // Start new phase
        currentPhase = {
          number: parseInt(phaseMatch[1]),
          title: phaseMatch[2].trim(),
          timeframe: phaseMatch[3].trim(),
        };
        currentTasks = [];
        continue;
      }

      // Detect tasks (lines starting with ▢ or ✓)
      if (
        currentPhase &&
        (line.startsWith("▢") || line.startsWith("✓") || line.startsWith("→"))
      ) {
        const taskText = line.replace(/^[▢✓→\s]+/, "").trim();
        if (taskText) {
          const isCompleted = line.startsWith("✓");
          currentTasks.push({
            text: taskText,
            completed: isCompleted,
          });
        }
      }
    }

    // Add last phase
    if (currentPhase) {
      phases.push({
        ...currentPhase,
        tasks: currentTasks,
      });
    }

    return phases.length > 0 ? phases : null;
  };

  const phases = parsePhases(visual);

  if (!phases || phases.length === 0) {
    // Fallback to text display if parsing fails
    return (
      <div className="roadmap-timeline-fallback">
        <pre className="roadmap-visual-text">{visual}</pre>
      </div>
    );
  }

  return (
    <div className="roadmap-timeline-container">
      <div className="roadmap-timeline">
        {phases.map((phase, index) => (
          <div
            key={index}
            className={`roadmap-timeline-phase ${
              index === phases.length - 1 ? "last" : ""
            }`}
          >
            <div className="roadmap-timeline-phase-header">
              <div className="roadmap-timeline-phase-number">
                {phase.number}
              </div>
              <div className="roadmap-timeline-phase-content">
                <h4 className="roadmap-timeline-phase-title">{phase.title}</h4>
                <span className="roadmap-timeline-phase-timeframe">
                  {phase.timeframe}
                </span>
              </div>
            </div>
            <div className="roadmap-timeline-phase-tasks">
              {phase.tasks.map((task, taskIndex) => (
                <div
                  key={taskIndex}
                  className={`roadmap-timeline-task ${
                    task.completed ? "completed" : ""
                  }`}
                >
                  <span className="roadmap-timeline-task-icon">
                    {task.completed ? "✓" : "▢"}
                  </span>
                  <span className="roadmap-timeline-task-text">
                    {task.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoadmapTimeline;
