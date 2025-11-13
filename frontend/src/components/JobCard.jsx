import React from "react";
import { Link } from "react-router-dom";

const JobCard = ({ job, matchedSkills = [] }) => {
  return (
    <div className="job-card">
      <div className="job-card-head">
        <div>
          <h3 className="job-title">{job.title}</h3>
          <div className="job-company">{job.company_name}</div>
        </div>
        <div className="job-meta">
          <div className="job-location">{job.location}</div>
          <div className="job-type">{job.job_type}</div>
        </div>
      </div>
      <div className="job-body">
        <div className="job-experience">{job.experience_level}</div>
        <div className="job-skills">
          {(matchedSkills || []).map((s) => (
            <span key={s} className="job-skill-badge matched">
              {s}
            </span>
          ))}
        </div>
        <p className="job-short">
          {job.description?.slice(0, 180)}
          {job.description && job.description.length > 180 ? "…" : ""}
        </p>
      </div>
      <div className="job-footer">
        <Link to={`/jobs/${job.id}`} className="job-details-link">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
