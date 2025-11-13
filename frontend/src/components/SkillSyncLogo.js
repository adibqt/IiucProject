// SkillSync Logo Component
// Professional, modern logo with skill/learning symbolism

import React from "react";

const SkillSyncLogo = ({ size = 90, variant = "full", theme = "light" }) => {
  const colors = {
    light: {
      primary: "#3B82F6", // Blue
      secondary: "#8B5CF6", // Purple
      accent: "#10B981", // Green
      text: "#1F2937",
    },
    dark: {
      primary: "#60A5FA",
      secondary: "#A78BFA",
      accent: "#34D399",
      text: "#F9FAFB",
    },
  };

  const palette = colors[theme];

  if (variant === "icon") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Circular base */}
        <circle cx="50" cy="50" r="48" fill={palette.primary} opacity="0.1" />

        {/* Abstract skill nodes connected */}
        <g>
          {/* Center node */}
          <circle cx="50" cy="50" r="8" fill={palette.primary} />

          {/* Skill nodes around */}
          <circle cx="50" cy="25" r="6" fill={palette.secondary} />
          <circle cx="75" cy="50" r="6" fill={palette.accent} />
          <circle cx="50" cy="75" r="6" fill={palette.secondary} />
          <circle cx="25" cy="50" r="6" fill={palette.accent} />

          {/* Connecting lines */}
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="25"
            stroke={palette.primary}
            strokeWidth="2"
            opacity="0.6"
          />
          <line
            x1="50"
            y1="50"
            x2="75"
            y2="50"
            stroke={palette.primary}
            strokeWidth="2"
            opacity="0.6"
          />
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="75"
            stroke={palette.primary}
            strokeWidth="2"
            opacity="0.6"
          />
          <line
            x1="50"
            y1="50"
            x2="25"
            y2="50"
            stroke={palette.primary}
            strokeWidth="2"
            opacity="0.6"
          />
        </g>

        {/* Sync arrows */}
        <path
          d="M 70 35 L 75 30 L 70 25"
          stroke={palette.accent}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 30 65 L 25 70 L 30 75"
          stroke={palette.accent}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg
      width={size * 3}
      height={size}
      viewBox="0 0 300 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Icon part */}
      <g transform="translate(10, 0)">
        <circle cx="50" cy="50" r="48" fill={palette.primary} opacity="0.1" />
        <circle cx="50" cy="50" r="8" fill={palette.primary} />
        <circle cx="50" cy="25" r="6" fill={palette.secondary} />
        <circle cx="75" cy="50" r="6" fill={palette.accent} />
        <circle cx="50" cy="75" r="6" fill={palette.secondary} />
        <circle cx="25" cy="50" r="6" fill={palette.accent} />
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="25"
          stroke={palette.primary}
          strokeWidth="2"
          opacity="0.6"
        />
        <line
          x1="50"
          y1="50"
          x2="75"
          y2="50"
          stroke={palette.primary}
          strokeWidth="2"
          opacity="0.6"
        />
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="75"
          stroke={palette.primary}
          strokeWidth="2"
          opacity="0.6"
        />
        <line
          x1="50"
          y1="50"
          x2="25"
          y2="50"
          stroke={palette.primary}
          strokeWidth="2"
          opacity="0.6"
        />
        <path
          d="M 70 35 L 75 30 L 70 25"
          stroke={palette.accent}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 30 65 L 25 70 L 30 75"
          stroke={palette.accent}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </g>

      {/* Text part */}
      <text
        x="120"
        y="55"
        fontFamily="'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        fontSize="36"
        fontWeight="700"
        fill="#FFFFFF"
      >
        Skill
        <tspan fill={palette.primary}>Sync</tspan>
      </text>
      <text
        x="120"
        y="75"
        fontFamily="'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        fontSize="12"
        fontWeight="400"
        fill="#FFFFFF"
      >
        AI-Powered Learning Platform
      </text>
    </svg>
  );
};

export default SkillSyncLogo;
