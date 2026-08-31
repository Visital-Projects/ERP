// src/services/jobModeService.js
import apiClient from "./apiClient"; // your axios instance

// ✅ Get all job modes
const getAllJobModes = async () => {
  const res = await apiClient.get("/job-modes");
  return res.data.data; // returns array of job modes
};

// ✅ Get job modes by plant ID (if your backend supports this)
const getJobModesByPlant = async (plantId) => {
  const res = await apiClient.get(`/job-modes/plant/${plantId}`);
  return res.data.data; // returns job modes linked to a plant
};

// ✅ Create job mode
const createJobMode = async (jobModeData) => {
  const res = await apiClient.post("/job-modes", jobModeData);
  return res.data.data; // returns created job mode object
};

// ✅ Update job mode
const updateJobMode = async (jobModeId, jobModeData) => {
  const res = await apiClient.put(`/job-modes/${jobModeId}`, jobModeData);
  return res.data.data; // returns updated job mode object
};

// ✅ Delete job mode
const deleteJobMode = async (jobModeId) => {
  const res = await apiClient.delete(`/job-modes/${jobModeId}`);
  return res.data; // returns { success: true, message: "Job Mode deleted" }
};

const jobModeService = {
  getAllJobModes,
  getJobModesByPlant,
  createJobMode,
  updateJobMode,
  deleteJobMode,
};

export default jobModeService;