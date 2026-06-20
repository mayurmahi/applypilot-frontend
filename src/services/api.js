import axios from "axios";

const API = axios.create({
  baseURL: "https://applypilot-backend-5f25.onrender.com",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);

export const getJobs = () => API.get("/jobs/");
export const createJob = (data) => API.post("/jobs/", data);
export const updateJobStatus = (id, status) => API.patch(`/jobs/${id}/status`, { status });
export const deleteJob = (id) => API.delete(`/jobs/${id}`);
export const getJob = (id) => API.get(`/jobs/${id}`);

export const uploadResume = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return API.post("/resume/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getMyResume = () => API.get("/resume/me");
export const tailorResume = (jobId) => API.post(`/resume/tailor/${jobId}`);
export const getTailoredVersions = (jobId) => API.get(`/resume/tailored/${jobId}`);

// NAYE ENDPOINTS: Edit save aur PDF download ke liye
export const updateTailoredResume = (id, data) => API.put(`/resume/tailored/${id}`, data);
export const downloadTailoredPDF = (id) => API.get(`/resume/tailored/${id}/download`, { responseType: 'blob' });

export default API;