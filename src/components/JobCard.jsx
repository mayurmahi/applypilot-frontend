import React from "react";
import { useNavigate } from "react-router-dom";
import { deleteJob } from "../services/api";
import { toast } from "react-toastify";
import "./JobCard.css";

const JobCard = ({ job, onDelete }) => {
  const navigate = useNavigate();

  const handleDelete = async (e) => {
    e.stopPropagation();
    try {
      await deleteJob(job.id);
      toast.success("Job removed!");
      onDelete(job.id);
    } catch (err) {
      toast.error("Failed to delete!");
    }
  };

  return (
    <div className="job-card" onClick={() => navigate(`/jobs/${job.id}`)}>
      <h4>{job.job_title}</h4>
      <p className="company">{job.company_name}</p>
      <p className="desc-preview">{job.job_description}</p>
      <div className="job-card-footer">
        <span className="job-card-date">{new Date(job.created_at).toLocaleDateString()}</span>
        <button className="btn-delete-small" onClick={handleDelete}>Remove</button>
      </div>
    </div>
  );
};

export default JobCard;