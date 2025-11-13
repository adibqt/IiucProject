import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import jobAPI from "../services/jobService";
import { userAPI } from "../services/api";
import "./Jobs.css";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [skills, setSkills] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [jobRes, skillsRes, userSkillsRes] = await Promise.all([
          jobAPI.get(id),
          jobAPI.listSkillsPublic(),
          userAPI.getSkills().catch(() => ({ skills: [] })),
        ]);
        setJob(jobRes);
        setSkills(skillsRes || []);
        setUserSkills(userSkillsRes.skills || []);
      } catch (err) {
        console.error("Failed to load job details:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="page-container">Loading...</div>;
  if (!job) return <div className="page-container">Job not found.</div>;

  // Map skill ids to names
  let reqIds = [];
  try {
    reqIds = job.required_skills ? JSON.parse(job.required_skills) : [];
  } catch (e) {
    reqIds = [];
  }

  const skillsMap = skills.reduce((acc, s) => {
    acc[s.id] = s.name;
    return acc;
  }, {});

  const reqNames = reqIds.map((id) => skillsMap[id] || id);

  // Determine matched skills by id intersection (if user skills include ids)
  const userSkillIds = (userSkills || []).map((s) => s.id).filter(Boolean);
  const matchedIds = reqIds.filter((r) => userSkillIds.includes(r));
  const matchedNames = matchedIds.map((id) => skillsMap[id] || id);

  return (
    <div className="jobs-page">
      <div className="jobs-header">
        <div className="jobs-header-content">
          <h1>{job.title}</h1>
          <p>
            {job.company_name} — {job.location}
          </p>
        </div>
        <div style={{ marginRight: "2rem" }}>
          <button
            className="view-details-btn"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <div className="jobs-wrapper" style={{ gridTemplateColumns: "1fr" }}>
        <main className="jobs-main">
          <div className="job-card" style={{ padding: "2rem" }}>
            <div className="job-card-header">
              <div className="job-title-section">
                <h2 className="job-title">{job.title}</h2>
                <p className="job-company">{job.company_name}</p>
              </div>
              <div className="job-match-badge">
                <div className="match-label">{job.experience_level}</div>
              </div>
            </div>

            <div className="job-description">{job.description}</div>

            <h3 style={{ marginTop: "1rem" }}>Required Skills</h3>
            <div className="job-skills-list">
              {reqNames.length > 0 ? (
                reqNames.map((name, idx) => (
                  <span key={idx} className="job-skill-badge">
                    {name}
                  </span>
                ))
              ) : (
                <em>No skills listed</em>
              )}
            </div>

            <h3>Matched Skills</h3>
            <div className="job-skills-list">
              {matchedNames.length > 0 ? (
                matchedNames.map((name, idx) => (
                  <span key={idx} className="job-skill-badge matched">
                    {name}
                  </span>
                ))
              ) : (
                <em>No matches found</em>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default JobDetails;
