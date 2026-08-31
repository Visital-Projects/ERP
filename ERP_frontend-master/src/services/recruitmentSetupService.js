// src/services/recruitmentService.js
import apiClient from "./apiClient";

// ... other recruitment services

export const getCustomQuestions = () => apiClient.get("/custom-questions");
export const createCustomQuestion = (data) => apiClient.post("/custom-questions", data);
export const updateCustomQuestion = (id, data) => apiClient.put(`/custom-questions/${id}`, data);
export const deleteCustomQuestion = (id) => apiClient.delete(`/custom-questions/${id}`);


export const createJob = (data) => {
  return apiClient.post("/jobs", data);
};
export const getJobs = () => apiClient.get("/jobs");
export const getJobById = (id) => apiClient.get(`/jobs/${id}`);
export const updateJob = (id, data) => apiClient.put(`/jobs/${id}`, data);
 