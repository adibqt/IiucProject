/**
 * Career Interests Tab Component
 */
import React from "react";

const CareerInterestsTab = ({
  interestsForm,
  onAddInterest,
  onRemoveInterest,
  onSave,
}) => {
  return (
    <div className="tab-panel">
      <h2>Career Interests</h2>
      <p className="tab-description">
        Add roles or career paths you're interested in
      </p>
      <form onSubmit={(e) => e.preventDefault()} className="profile-form">
        <div className="form-group">
          <label>Add a Career Interest</label>
          <div className="interest-input-group">
            <input
              type="text"
              id="interestInput"
              placeholder="e.g., Data Science, Frontend Development, Product Management"
            />
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById("interestInput");
                onAddInterest(input.value);
                input.value = "";
              }}
              className="home-btn home-btn-primary"
            >
              Add Interest
            </button>
          </div>
        </div>

        <div className="interests-list">
          <h3>Your Career Interests</h3>
          {interestsForm.length > 0 ? (
            <div className="interests-tags">
              {interestsForm.map((interest, idx) => (
                <div key={idx} className="interest-tag">
                  <span>{interest}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveInterest(idx)}
                    className="interest-remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message">No career interests added yet</p>
          )}
        </div>

        {interestsForm.length > 0 && (
          <button
            type="button"
            onClick={onSave}
            className="home-btn home-btn-primary"
          >
            Save Career Interests
          </button>
        )}
      </form>
    </div>
  );
};

export default CareerInterestsTab;
