import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import JobCard from "../components/JobCard";
import { getJobs, createJob, updateJobStatus, uploadResume, getMyResume } from "../services/api";
import { toast } from "react-toastify";
import "./Dashboard.css";

const STATUSES = [
  { key: "applied", label: "Applied", color: "#64748B" },
  { key: "oa", label: "OA / Test", color: "#D97706" },
  { key: "interview", label: "Interview", color: "#2563EB" },
  { key: "offer", label: "Offer", color: "#0F6B5C" },
  { key: "rejected", label: "Rejected", color: "#DC2626" },
];

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [hasResume, setHasResume] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ company_name: "", job_title: "", job_description: "", job_link: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchJobs();
    checkResume();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await getJobs();
      setJobs(res.data);
    } catch (err) {
      toast.error("Failed to load jobs");
    }
  };

  const checkResume = async () => {
    try {
      await getMyResume();
      setHasResume(true);
    } catch (err) {
      setHasResume(false);
    }
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddJob = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createJob(form);
      toast.success("Job added!");
      setForm({ company_name: "", job_title: "", job_description: "", job_link: "" });
      setShowJobModal(false);
      fetchJobs();
    } catch (err) {
      toast.error("Failed to add job");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await updateJobStatus(jobId, newStatus);
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteJob = (id) => {
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) return;
    setUploading(true);
    try {
      await uploadResume(resumeFile);
      toast.success("Resume uploaded successfully!");
      setHasResume(true);
      setShowResumeModal(false);
      setResumeFile(null);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2>Job Application Tracker</h2>
          <div className="header-actions">
            <button className="btn-upload" onClick={() => setShowResumeModal(true)}>
              {hasResume ? "Update Resume" : "Upload Resume"}
            </button>
            <button className="btn-add" onClick={() => setShowJobModal(true)}>+ Add Job</button>
          </div>
        </div>

        <div className={`resume-status ${hasResume ? "" : "missing"}`}>
          {hasResume ? "✓ Resume uploaded — ready to tailor for jobs" : "⚠ No resume uploaded yet — upload to enable AI tailoring"}
        </div>

        <div className="kanban-board">
          {STATUSES.map(status => {
            const statusJobs = jobs.filter(j => j.status === status.key);
            return (
              <div className="kanban-column" key={status.key} style={{ "--status-color": status.color }}>
                <h3>
                  <span className="status-dot" style={{ backgroundColor: status.color }}></span>
                  {status.label}
                  <span className="column-count">{statusJobs.length}</span>
                </h3>
                {statusJobs.length === 0 ? (
                  <div className="empty-column">No jobs</div>
                ) : (
                  statusJobs.map(job => (
                    <div key={job.id}>
                      <JobCard job={job} onDelete={handleDeleteJob} />
                      <select
                        className="status-select"
                        value={job.status}
                        onChange={(e) => handleStatusChange(job.id, e.target.value)}
                      >
                        {STATUSES.map(s => (
                          <option key={s.key} value={s.key}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showJobModal && (
        <div className="modal-overlay" onClick={() => setShowJobModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Job</h3>
            <form onSubmit={handleAddJob}>
              <div className="form-group">
                <label>Company Name</label>
                <input type="text" name="company_name" value={form.company_name} onChange={handleFormChange} required />
              </div>
              <div className="form-group">
                <label>Job Title</label>
                <input type="text" name="job_title" value={form.job_title} onChange={handleFormChange} required />
              </div>
              <div className="form-group">
                <label>Job Description</label>
                <textarea name="job_description" value={form.job_description} onChange={handleFormChange} required placeholder="Paste the full job description here..." />
              </div>
              <div className="form-group">
                <label>Job Link (optional)</label>
                <input type="url" name="job_link" value={form.job_link} onChange={handleFormChange} placeholder="https://..." />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowJobModal(false)}>Cancel</button>
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? "Adding..." : "Add Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showResumeModal && (
        <div className="modal-overlay" onClick={() => setShowResumeModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Upload Resume</h3>
            <div className="file-input-wrapper">
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={(e) => setResumeFile(e.target.files[0])}
              />
              <p className="file-hint">PDF or DOCX only</p>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowResumeModal(false)}>Cancel</button>
              <button type="button" className="btn-submit" onClick={handleResumeUpload} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;