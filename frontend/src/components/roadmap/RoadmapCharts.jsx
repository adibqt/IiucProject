import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import "./RoadmapCharts.css";

const RoadmapCharts = ({ visual, timeframe }) => {
  // Parse the roadmap to extract structured data
  const parsedPhases = useMemo(() => {
    const phases = [];
    const lines = visual.split("\n");
    let currentPhase = null;
    let currentTasks = [];
    let phaseCounter = 1;

    // Stop parsing when we hit the description section
    let stopParsing = false;
    const descriptionMarkers = [
      "CONCISE EXPLANATION",
      "DETAILED EXPLANATION",
      "SECTION 2",
      "EXPLANATION",
      "Overview:",
      "Phase Summary:",
      "Key Milestones:",
      "Next Steps:",
    ];

    for (let i = 0; i < lines.length; i++) {
      const originalLine = lines[i];
      const line = originalLine.trim();

      // Stop parsing if we hit description section
      if (!stopParsing) {
        for (const marker of descriptionMarkers) {
          if (line.toUpperCase().includes(marker.toUpperCase())) {
            stopParsing = true;
            break;
          }
        }
      }

      if (stopParsing) {
        break; // Stop parsing once we hit description
      }

      // Skip empty lines and separators
      if (!line || line.match(/^[=_-]+$/)) continue;

      // Skip header lines like "ROADMAP: Frontend Developer (6 Months)"
      if (line.match(/^ROADMAP:/i) || line.match(/^===+/)) continue;

      // Multiple patterns to detect phase headers
      // Pattern 1: [PHASE 1: FOUNDATIONS] (Weeks 1-6) - with hyphen or en-dash
      // Pattern 2: PHASE 1: FOUNDATIONS (Weeks 1-6)
      // Pattern 3: [PHASE 1] FOUNDATIONS (Weeks 1-6)
      // Pattern 4: Phase 1: FOUNDATIONS

      // Try the most common pattern first: [PHASE 1: TITLE] (Weeks X-Y)
      // Be more precise with the bracket matching
      let phaseMatch = line.match(
        /\[PHASE\s+(\d+):\s*([^\]]+?)\]\s*\(([^)]+)\)/i
      );

      // If not found, try without brackets
      if (!phaseMatch) {
        phaseMatch = line.match(/PHASE\s+(\d+):\s*([^(]+?)\s*\(([^)]+)\)/i);
      }

      // Try with brackets but no colon
      if (!phaseMatch) {
        phaseMatch = line.match(/\[PHASE\s+(\d+)\]\s*([^(]+?)\s*\(([^)]+)\)/i);
      }

      // Try lowercase phase
      if (!phaseMatch) {
        phaseMatch = line.match(/Phase\s+(\d+):\s*([^(]+?)\s*\(([^)]+)\)/i);
      }

      // More flexible pattern - just look for PHASE number and parentheses
      if (!phaseMatch) {
        const flexibleMatch = line.match(
          /PHASE\s+(\d+)[:\s]+([^(]+?)\s*\(([^)]+)\)/i
        );
        if (flexibleMatch) {
          phaseMatch = flexibleMatch;
        }
      }

      // Last resort: detect any line with PHASE and a number
      if (!phaseMatch) {
        if (line.match(/PHASE\s+\d+/i)) {
          const numMatch = line.match(/PHASE\s+(\d+)/i);
          const titleMatch = line.match(
            /PHASE\s+\d+[:\s]+([^(]+?)(?:\s*\(|$)/i
          );
          const timeMatch = line.match(/\(([^)]+)\)/);
          if (numMatch) {
            phaseMatch = [
              line,
              numMatch[1],
              titleMatch ? titleMatch[1].trim() : `Phase ${numMatch[1]}`,
              timeMatch ? timeMatch[1] : "TBD",
            ];
          }
        }
      }

      if (phaseMatch) {
        // Save previous phase
        if (currentPhase) {
          phases.push({
            ...currentPhase,
            tasks: currentTasks,
            taskCount: currentTasks.length,
          });
        }

        // Debug logging (remove in production)
        console.log("Phase detected:", {
          line,
          match: phaseMatch,
          number: phaseMatch[1],
          title: phaseMatch[2],
          timeframe: phaseMatch[3],
        });

        // Start new phase
        const phaseNum = parseInt(phaseMatch[1]) || phaseCounter++;
        const phaseTitle = (phaseMatch[2] || "").trim() || `Phase ${phaseNum}`;
        const phaseTimeframe = (phaseMatch[3] || "").trim() || "TBD";

        // Extract week numbers from timeframe - handle both hyphen and en-dash
        // Support formats: "Weeks 1-6", "Weeks 1–6", "1-6", "Week 1-6"
        let timeframeMatch = phaseTimeframe.match(/(\d+)\s*[-–]\s*(\d+)/);
        if (!timeframeMatch) {
          // Try "Weeks X-Y" format
          timeframeMatch = phaseTimeframe.match(
            /Weeks?\s+(\d+)\s*[-–]\s*(\d+)/i
          );
        }
        if (!timeframeMatch) {
          // Try "Week X to Y" format
          timeframeMatch = phaseTimeframe.match(/(\d+)\s+to\s+(\d+)/i);
        }

        const weekStart = timeframeMatch ? parseInt(timeframeMatch[1]) : null;
        const weekEnd = timeframeMatch ? parseInt(timeframeMatch[2]) : null;

        // Try alternative patterns for weeks
        if (!timeframeMatch) {
          const altMatch = phaseTimeframe.match(/(\d+)\s*weeks?/i);
          if (altMatch && currentPhase) {
            // Calculate based on previous phase
            const prevEnd =
              phases.length > 0 ? phases[phases.length - 1].weekEnd : 0;
            if (prevEnd) {
              const weeks = parseInt(altMatch[1]);
              const start = prevEnd + 1;
              currentPhase = {
                number: phaseNum,
                title: phaseTitle,
                timeframe: phaseTimeframe,
                weekStart: start,
                weekEnd: start + weeks - 1,
                duration: weeks,
              };
              currentTasks = [];
              continue;
            }
          }
        }

        // Only create phase if it has valid timeframe (not "TBD" or empty)
        // This prevents parsing phases from description text
        if (
          phaseTimeframe &&
          phaseTimeframe !== "TBD" &&
          phaseTimeframe.trim().length > 0
        ) {
          currentPhase = {
            number: phaseNum,
            title: phaseTitle,
            timeframe: phaseTimeframe,
            weekStart,
            weekEnd,
            duration: weekEnd && weekStart ? weekEnd - weekStart + 1 : null,
          };
          currentTasks = [];
        } else {
          // Invalid phase format, skip it
          console.log("Skipping invalid phase:", { line, phaseTimeframe });
        }
        continue;
      }

      // Detect tasks - more flexible patterns
      if (currentPhase) {
        // Skip if this looks like a phase header (avoid false positives)
        if (line.match(/PHASE\s+\d+/i)) {
          continue;
        }

        // Handle indented tasks (common format: "   ▢ Task name")
        // Check original line for indentation, but use trimmed for matching
        const isIndented = originalLine.match(/^\s{2,}/); // 2+ spaces of indentation
        const trimmedLine = line;

        // Pattern 1: Lines starting with ▢, ✓, →, -, •, or numbered lists
        const taskPatterns = [
          /^[▢✓→•\-\*]\s*(.+)/, // Unicode boxes, checkmarks, arrows, bullets
          /^\d+[\.\)]\s*(.+)/, // Numbered lists
        ];

        let taskFound = false;
        for (const pattern of taskPatterns) {
          const taskMatch = trimmedLine.match(pattern);
          if (taskMatch) {
            const taskText = taskMatch[1].trim();
            if (taskText && taskText.length > 2) {
              const isCompleted =
                trimmedLine.startsWith("✓") ||
                trimmedLine.toLowerCase().includes("complete");
              currentTasks.push({
                text: taskText,
                completed: isCompleted,
              });
              taskFound = true;
              break;
            }
          }
        }

        // Pattern 2: Indented lines that look like tasks (even without ▢ marker)
        if (
          !taskFound &&
          isIndented &&
          trimmedLine.length > 3 &&
          !trimmedLine.match(/^\[/)
        ) {
          // Remove common prefixes and clean up
          const cleanText = trimmedLine
            .replace(/^[▢✓→•\-\*\d\.\)\s]+/, "")
            .trim();
          if (cleanText && cleanText.length > 2) {
            // Check if we haven't already added this
            const exists = currentTasks.some((t) => t.text === cleanText);
            if (!exists) {
              currentTasks.push({
                text: cleanText,
                completed: trimmedLine.startsWith("✓"),
              });
            }
          }
        }
      }
    }

    // Add last phase
    if (currentPhase) {
      phases.push({
        ...currentPhase,
        tasks: currentTasks,
        taskCount: currentTasks.length,
      });
    }

    // Filter out invalid phases (no tasks, TBD timeframe, or duplicate numbers)
    // Keep the first occurrence of each phase number (the one with tasks)
    const validPhases = [];
    const seenNumbers = new Set();

    // Sort phases by number to ensure we process them in order
    const sortedPhases = [...phases].sort((a, b) => a.number - b.number);

    for (const phase of sortedPhases) {
      // Skip if duplicate phase number (keep first one)
      if (seenNumbers.has(phase.number)) {
        console.log("Skipping duplicate phase number:", phase);
        continue;
      }

      // Skip if no tasks and TBD timeframe (likely from description or invalid)
      if (
        phase.taskCount === 0 &&
        (phase.timeframe === "TBD" ||
          !phase.timeframe ||
          phase.timeframe.trim() === "")
      ) {
        console.log("Skipping invalid phase (no tasks, TBD):", phase);
        continue;
      }

      // Skip if timeframe doesn't contain week information (likely from description)
      if (phase.timeframe && !phase.timeframe.match(/\d+/)) {
        console.log("Skipping phase with invalid timeframe:", phase);
        continue;
      }

      seenNumbers.add(phase.number);
      validPhases.push(phase);
    }

    // Sort by phase number to ensure correct order
    validPhases.sort((a, b) => a.number - b.number);

    // Debug logging
    console.log("Parsed phases:", validPhases);
    console.log("Total phases found:", validPhases.length);

    // If no valid phases found, create a default phase with all content
    if (validPhases.length === 0) {
      const allTasks = visual
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.match(/^[=_-]+$/) && line.length > 3)
        .slice(0, 10) // Limit to first 10 lines
        .map((line, idx) => ({
          text: line.replace(/^[▢✓→•\-\*\d\.\)\s]+/, "").trim() || line,
          completed: false,
        }))
        .filter((task) => task.text);

      if (allTasks.length > 0) {
        return [
          {
            number: 1,
            title: "Roadmap Tasks",
            timeframe: timeframe || "TBD",
            weekStart: 1,
            weekEnd: allTasks.length,
            duration: allTasks.length,
            tasks: allTasks,
            taskCount: allTasks.length,
          },
        ];
      }
    }

    return validPhases;
  }, [visual, timeframe]);

  const roadmapData = parsedPhases;

  if (!roadmapData || roadmapData.length === 0) {
    return (
      <div className="roadmap-charts-error">
        <p>Unable to parse roadmap data for visualization.</p>
        <details
          style={{ marginTop: "1rem", color: "rgba(255, 255, 255, 0.7)" }}
        >
          <summary style={{ cursor: "pointer", marginBottom: "0.5rem" }}>
            Show raw roadmap text (for debugging)
          </summary>
          <pre
            style={{
              background: "rgba(0, 0, 0, 0.3)",
              padding: "1rem",
              borderRadius: "8px",
              fontSize: "0.85rem",
              maxHeight: "300px",
              overflow: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {visual}
          </pre>
        </details>
      </div>
    );
  }

  // Prepare data for charts
  const barChartData = roadmapData.map((phase) => ({
    name: `Phase ${phase.number}`,
    title: phase.title,
    tasks: phase.taskCount,
    duration: phase.duration || 1,
  }));

  const colors = ["#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"];

  // Calculate total progress (assuming 0% for now, can be enhanced with user progress)
  const totalTasks = roadmapData.reduce(
    (sum, phase) => sum + phase.taskCount,
    0
  );

  return (
    <div className="roadmap-charts-container">
      {/* Progress Overview */}
      <div className="roadmap-chart-section">
        <h4 className="roadmap-chart-title">Phase Progress</h4>
        <div className="roadmap-progress-bars">
          {roadmapData.map((phase, index) => {
            const progress = 0; // Can be enhanced with actual user progress
            return (
              <div key={index} className="roadmap-progress-item">
                <div className="roadmap-progress-header">
                  <span className="roadmap-progress-phase">
                    Phase {phase.number}: {phase.title}
                  </span>
                  <span className="roadmap-progress-stats">
                    {phase.taskCount} tasks • {phase.timeframe}
                  </span>
                </div>
                <div className="roadmap-progress-bar-container">
                  <div className="roadmap-progress-bar">
                    <div
                      className="roadmap-progress-bar-fill"
                      style={{
                        width: `${progress}%`,
                        background: `linear-gradient(90deg, ${
                          colors[index % colors.length]
                        }, ${colors[(index + 1) % colors.length]})`,
                      }}
                    />
                  </div>
                  <span className="roadmap-progress-percentage">
                    {progress}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tasks per Phase Bar Chart */}
      <div className="roadmap-chart-section">
        <h4 className="roadmap-chart-title">Tasks Distribution by Phase</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={barChartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255, 255, 255, 0.1)"
            />
            <XAxis
              dataKey="name"
              stroke="rgba(255, 255, 255, 0.7)"
              tick={{ fill: "rgba(255, 255, 255, 0.7)", fontSize: 12 }}
            />
            <YAxis
              stroke="rgba(255, 255, 255, 0.7)"
              tick={{ fill: "rgba(255, 255, 255, 0.7)", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "8px",
                color: "#fff",
              }}
              itemStyle={{
                color: "#fff",
              }}
              labelStyle={{
                color: "#fff",
              }}
              formatter={(value, name) => {
                if (name === "tasks") return [`${value} tasks`, "Tasks"];
                if (name === "duration") return [`${value} weeks`, "Duration"];
                return [value, name];
              }}
            />
            <Legend
              wrapperStyle={{ color: "rgba(255, 255, 255, 0.7)" }}
              iconType="circle"
            />
            <Bar dataKey="tasks" name="Tasks" radius={[8, 8, 0, 0]}>
              {barChartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Duration Comparison */}
      <div className="roadmap-chart-section">
        <h4 className="roadmap-chart-title">Phase Duration (Weeks)</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={barChartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255, 255, 255, 0.1)"
            />
            <XAxis
              dataKey="name"
              stroke="rgba(255, 255, 255, 0.7)"
              tick={{ fill: "rgba(255, 255, 255, 0.7)", fontSize: 12 }}
            />
            <YAxis
              stroke="rgba(255, 255, 255, 0.7)"
              tick={{ fill: "rgba(255, 255, 255, 0.7)", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "8px",
                color: "#fff",
              }}
              itemStyle={{
                color: "#fff",
              }}
              labelStyle={{
                color: "#fff",
              }}
              formatter={(value) => [`${value} weeks`, "Duration"]}
            />
            <Bar
              dataKey="duration"
              name="Duration (weeks)"
              radius={[8, 8, 0, 0]}
            >
              {barChartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="roadmap-chart-section">
        <h4 className="roadmap-chart-title">Roadmap Summary</h4>
        <div className="roadmap-summary-stats">
          <div className="roadmap-stat-card">
            <div className="roadmap-stat-value">{roadmapData.length}</div>
            <div className="roadmap-stat-label">Phases</div>
          </div>
          <div className="roadmap-stat-card">
            <div className="roadmap-stat-value">{totalTasks}</div>
            <div className="roadmap-stat-label">Total Tasks</div>
          </div>
          <div className="roadmap-stat-card">
            <div className="roadmap-stat-value">{timeframe}</div>
            <div className="roadmap-stat-label">Timeframe</div>
          </div>
          <div className="roadmap-stat-card">
            <div className="roadmap-stat-value">
              {roadmapData.reduce((sum, p) => sum + (p.duration || 0), 0)}
            </div>
            <div className="roadmap-stat-label">Total Weeks</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapCharts;
