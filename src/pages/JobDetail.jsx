import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getJob, tailorResume, getTailoredVersions, updateTailoredResume, downloadTailoredPDF } from "../services/api";
import { toast } from "react-toastify";
import "./JobDetail.css";

const getScoreColor = (score) => {
  if (score >= 75) return "#0F6B5C";
  if (score >= 50) return "#D97706";
  return "#DC2626";
};

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [tailoring, setTailoring] = useState(false);
  const [versions, setVersions] = useState([]);

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchJob();
    fetchVersions();
  }, [id]);

  const fetchJob = async () => {
    try {
      const res = await getJob(id);
      setJob(res.data);
    } catch (err) {
      toast.error("Failed to load job");
    }
  };

  const fetchVersions = async () => {
    try {
      const res = await getTailoredVersions(id);
      setVersions(res.data);
      if (res.data.length > 0) {
        setFormData(res.data[0].tailored_content);
      }
    } catch (err) {
      console.log("No versions yet");
    }
  };

  const handleTailor = async () => {
    setTailoring(true);
    try {
      await tailorResume(id);
      toast.success("Resume tailored successfully!");
      fetchVersions();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Tailoring failed.");
    } finally {
      setTailoring(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNestedChange = (section, index, field, value) => {
    const updatedSection = [...(formData[section] || [])];
    updatedSection[index] = { ...updatedSection[index], [field]: value };
    setFormData({ ...formData, [section]: updatedSection });
  };

  const saveEditedResume = async () => {
    setSaving(true);
    try {
      await updateTailoredResume(versions[0].id, { tailored_content: formData });
      toast.success("Resume updated!");
      setEditMode(false);
      fetchVersions();
    } catch (err) {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await downloadTailoredPDF(versions[0].id);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Tailored_Resume_${job.company_name.replace(/\s+/g, "_")}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("PDF Downloaded!");
    } catch (err) {
      toast.error("Failed to download PDF");
    }
  };

  if (!job) return null;
  const latestVersion = versions[0];

  return (
    <div className="jobdetail-container">
      <Navbar />
      <div className="jobdetail-content">
        <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>

        <div className="job-header-card">
          <h2>{job.job_title}</h2>
          <p className="company">{job.company_name}</p>
          <div className="jd-text">{job.job_description}</div>
        </div>

        <div className="tailor-section">
          <div className="section-header">
            <h3>AI Resume Tailoring</h3>
            {latestVersion && !editMode && (
              <button className="btn-secondary" onClick={() => setEditMode(true)}>✏️ Edit Resume</button>
            )}
          </div>

          {!editMode && (
             <button className="btn-tailor" onClick={handleTailor} disabled={tailoring}>
               {tailoring ? "🤖 Agent is analyzing..." : "✨ Tailor My Resume for This Job"}
             </button>
          )}

          {tailoring && (
            <div className="loading-box">
              <div className="spinner"></div>
              <p>Parsing job description → Searching your resume → Generating Data...</p>
            </div>
          )}

          {!tailoring && latestVersion && formData && (
            <>
              {!editMode ? (
                <div className="resume-preview-card" key="view">
                   <div className="score-banner">
                    <div className="score-circle-wrap">
                      <div className="score-ring" style={{ "--score-color": getScoreColor(latestVersion.match_score) }}></div>
                      <div className="score-circle" style={{ backgroundColor: getScoreColor(latestVersion.match_score) }}>
                        {latestVersion.match_score}%
                      </div>
                    </div>
                    <div className="score-info">
                      <h4>Match Score</h4>
                      <p>How well your resume matches this job's requirements</p>
                    </div>
                  </div>

                  <div className="preview-content">
                     <h2 className="preview-name">{formData.name}</h2>
                     <p className="preview-contact">{formData.contact}</p>

                     <h4 className="section-title">Summary</h4>
                     <p className="preview-text">{formData.summary}</p>

                     <h4 className="section-title">Skills</h4>
                     <p className="preview-text">{formData.skills?.join(", ")}</p>

                     {formData.experience && formData.experience.length > 0 && (
                        <>
                          <h4 className="section-title">Experience</h4>
                          {formData.experience.map((exp, i) => (
                            <div key={i} className="entry-block" style={{ "--delay": `${i * 60}ms` }}>
                              <div className="entry-title">{exp.role} | {exp.company}</div>
                              <div className="entry-sub">{exp.duration}</div>
                              <ul className="entry-bullets">
                                {exp.bullets?.map((b, j) => <li key={j}>{b}</li>)}
                              </ul>
                            </div>
                          ))}
                        </>
                     )}

                     {formData.projects && formData.projects.length > 0 && (
                        <>
                          <h4 className="section-title">Projects</h4>
                          {formData.projects.map((proj, i) => (
                            <div key={i} className="entry-block" style={{ "--delay": `${i * 60}ms` }}>
                              <div className="entry-title">{proj.title}</div>
                              <div className="entry-sub">Tech Stack: {proj.tech_stack}</div>
                              <ul className="entry-bullets">
                                {proj.bullets?.map((b, j) => <li key={j}>{b}</li>)}
                              </ul>
                            </div>
                          ))}
                        </>
                     )}

                     {formData.education && formData.education.length > 0 && (
                        <>
                          <h4 className="section-title">Education</h4>
                          {formData.education.map((edu, i) => (
                            <div key={i} className="entry-block entry-block-tight" style={{ "--delay": `${i * 60}ms` }}>
                              <div className="entry-title">{edu.degree}</div>
                              <div className="entry-sub-dark">{edu.institution} - {edu.year}</div>
                            </div>
                          ))}
                        </>
                     )}
                  </div>

                  <button className="btn-download" onClick={handleDownloadPDF}>
                    📄 Download PDF
                  </button>
                </div>
              ) : (
                <div className="editor-card" key="edit">
                  <h4>Edit Your Resume Information</h4>

                  <div className="form-group">
                    <label>Full Name</label>
                    <input value={formData.name || ''} onChange={(e) => handleInputChange("name", e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label>Contact Info</label>
                    <input value={formData.contact || ''} onChange={(e) => handleInputChange("contact", e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label>Professional Summary</label>
                    <textarea rows="4" value={formData.summary || ''} onChange={(e) => handleInputChange("summary", e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label>Skills (Comma Separated)</label>
                    <textarea rows="2" value={formData.skills?.join(", ") || ''}
                      onChange={(e) => handleInputChange("skills", e.target.value.split(",").map(s=>s.trimStart()))} />
                  </div>

                  <h4 className="section-title editor-section-title">Experience</h4>
                  {formData.experience?.map((exp, index) => (
                    <div key={index} className="nested-box" style={{ "--delay": `${index * 50}ms` }}>
                      <input type="text" placeholder="Role (e.g. Software Engineer)" value={exp.role || ''} onChange={(e) => handleNestedChange("experience", index, "role", e.target.value)} />
                      <input type="text" placeholder="Company Name" value={exp.company || ''} onChange={(e) => handleNestedChange("experience", index, "company", e.target.value)} />
                      <input type="text" placeholder="Duration (e.g. Jan 2023 - Present)" value={exp.duration || ''} onChange={(e) => handleNestedChange("experience", index, "duration", e.target.value)} />
                      <label className="nested-label">Bullets (Enter each point on a new line)</label>
                      <textarea rows="4" value={exp.bullets?.join("\n") || ''} onChange={(e) => handleNestedChange("experience", index, "bullets", e.target.value.split("\n"))} />
                    </div>
                  ))}

                  <h4 className="section-title editor-section-title">Projects</h4>
                  {formData.projects?.map((proj, index) => (
                    <div key={index} className="nested-box" style={{ "--delay": `${index * 50}ms` }}>
                      <input type="text" placeholder="Project Title" value={proj.title || ''} onChange={(e) => handleNestedChange("projects", index, "title", e.target.value)} />
                      <input type="text" placeholder="Tech Stack" value={proj.tech_stack || ''} onChange={(e) => handleNestedChange("projects", index, "tech_stack", e.target.value)} />
                      <label className="nested-label">Bullets (Enter each point on a new line)</label>
                      <textarea rows="4" value={proj.bullets?.join("\n") || ''} onChange={(e) => handleNestedChange("projects", index, "bullets", e.target.value.split("\n"))} />
                    </div>
                  ))}

                  <div className="editor-actions">
                    <button className="btn-secondary" onClick={() => setEditMode(false)}>Cancel</button>
                    <button className="btn-save" onClick={saveEditedResume} disabled={saving}>
                      {saving ? "Saving..." : "💾 Save Changes"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetail;