import React, { useState } from "react";
import "./RoadmapForm.css";

const RoadmapForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    targetRole: "",
    timeframe: "3 months",
    weeklyHours: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.targetRole.trim()) {
      newErrors.targetRole = "Target role is required";
    }

    if (!formData.timeframe) {
      newErrors.timeframe = "Timeframe is required";
    }

    if (
      formData.weeklyHours &&
      (formData.weeklyHours < 1 || formData.weeklyHours > 168)
    ) {
      newErrors.weeklyHours = "Weekly hours must be between 1 and 168";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const payload = {
      targetRole: formData.targetRole.trim(),
      timeframe: formData.timeframe,
      ...(formData.weeklyHours && {
        weeklyHours: parseInt(formData.weeklyHours),
      }),
    };

    onSubmit(payload);
  };

  return (
    <div className="roadmap-form-container">
      <div className="roadmap-form-card">
        <h2 className="roadmap-form-title">Generate Career Roadmap</h2>
        <p className="roadmap-form-subtitle">
          Create a personalized learning path to reach your career goals
        </p>

        <form onSubmit={handleSubmit} className="roadmap-form">
          <div className="roadmap-form-group">
            <label htmlFor="targetRole" className="roadmap-form-label">
              Target Role <span className="required">*</span>
            </label>
            <input
              type="text"
              id="targetRole"
              name="targetRole"
              value={formData.targetRole}
              onChange={handleChange}
              placeholder="e.g., Frontend Developer, Data Scientist"
              className={`roadmap-form-input ${
                errors.targetRole ? "error" : ""
              }`}
              disabled={isLoading}
            />
            {errors.targetRole && (
              <span className="roadmap-form-error">{errors.targetRole}</span>
            )}
          </div>

          <div className="roadmap-form-group">
            <label htmlFor="timeframe" className="roadmap-form-label">
              Timeframe <span className="required">*</span>
            </label>
            <select
              id="timeframe"
              name="timeframe"
              value={formData.timeframe}
              onChange={handleChange}
              className={`roadmap-form-select ${
                errors.timeframe ? "error" : ""
              }`}
              disabled={isLoading}
            >
              <option value="3 months">3 months</option>
              <option value="6 months">6 months</option>
              <option value="1 year">1 year</option>
            </select>
            {errors.timeframe && (
              <span className="roadmap-form-error">{errors.timeframe}</span>
            )}
          </div>

          <div className="roadmap-form-group">
            <label htmlFor="weeklyHours" className="roadmap-form-label">
              Weekly Learning Hours (Optional)
            </label>
            <input
              type="number"
              id="weeklyHours"
              name="weeklyHours"
              value={formData.weeklyHours}
              onChange={handleChange}
              placeholder="e.g., 10"
              min="1"
              max="168"
              className={`roadmap-form-input ${
                errors.weeklyHours ? "error" : ""
              }`}
              disabled={isLoading}
            />
            <span className="roadmap-form-hint">
              How many hours per week can you dedicate to learning?
            </span>
            {errors.weeklyHours && (
              <span className="roadmap-form-error">{errors.weeklyHours}</span>
            )}
          </div>

          <button
            type="submit"
            className="roadmap-form-submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="roadmap-form-spinner"></span>
                Generating...
              </>
            ) : (
              "Generate Roadmap"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RoadmapForm;
