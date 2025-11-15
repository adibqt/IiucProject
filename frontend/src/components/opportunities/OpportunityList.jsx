import React from "react";
import OpportunityItem from "./OpportunityItem";
import "./OpportunityList.css";

const OpportunityList = ({
  opportunities,
  onViewDetails,
  onDelete,
  isAdmin = false,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="opportunity-list-loading">
        <div className="spinner-large"></div>
        <p>Loading opportunities...</p>
      </div>
    );
  }

  if (!opportunities || opportunities.length === 0) {
    return (
      <div className="opportunity-list-empty">
        <div className="empty-icon-large">🔍</div>
        <h3>No opportunities found</h3>
        <p>Check back later for new opportunities</p>
      </div>
    );
  }

  return (
    <div className="opportunity-list">
      {opportunities.map((opportunity) => (
        <OpportunityItem
          key={opportunity.id}
          opportunity={opportunity}
          onViewDetails={onViewDetails}
          onDelete={onDelete}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
};

export default OpportunityList;
