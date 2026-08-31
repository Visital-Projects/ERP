// // src/services/manpowerSalaryService.js
// import apiClient from "./apiClient";

// // Get all manpower salaries
// const getAllManpowerSalaries = async () => {
//   const res = await apiClient.get("/manpower-salaries");
//   return res.data.data;
// };

// // Get manpower salary by ID
// const getManpowerSalaryById = async (id) => {
//   const res = await apiClient.get(`/manpower-salaries/${id}`);
//   return res.data.data;
// };

// // Create manpower salary
// const createManpowerSalary = async (salaryData) => {
//   const res = await apiClient.post("/manpower-salaries", salaryData);
//   return res.data.data;
// };

// // Update manpower salary
// const updateManpowerSalary = async (salaryId, salaryData) => {
//   const res = await apiClient.put(`/manpower-salaries/${salaryId}`, salaryData);
//   return res.data.data;
// };

// // Delete manpower salary
// const deleteManpowerSalary = async (salaryId) => {
//   const res = await apiClient.delete(`/manpower-salaries/${salaryId}`);
//   return res.data;
// };

// const manpowerSalaryService = {
//   getAllManpowerSalaries,
//   getManpowerSalaryById,
//   createManpowerSalary,
//   updateManpowerSalary,
//   deleteManpowerSalary,
// };

// export default manpowerSalaryService;



// src/services/manpowerSalaryService.js
import apiClient from "./apiClient";

// Get all manpower salaries
const getAllManpowerSalaries = async () => {
  const res = await apiClient.get("/reports/job-mode-wise-report");
  return res.data.data;
};

// Get manpower salary by ID
const getManpowerSalaryById = async (id) => {
  const res = await apiClient.get(`/manpower-salaries/${id}`);
  return res.data.data;
};

// Create manpower salary
const createManpowerSalary = async (salaryData) => {
  const res = await apiClient.post("/manpower-salaries", salaryData);
  return res.data.data;
};

// Update manpower salary
const updateManpowerSalary = async (salaryId, salaryData) => {
  const res = await apiClient.put(`/manpower-salaries/${salaryId}`, salaryData);
  return res.data.data;
};

// Delete manpower salary
const deleteManpowerSalary = async (salaryId) => {
  const res = await apiClient.delete(`/manpower-salaries/${salaryId}`);
  return res.data;
};

const manpowerSalaryService = {
  getAllManpowerSalaries,
  getManpowerSalaryById,
  createManpowerSalary,
  updateManpowerSalary,
  deleteManpowerSalary,
};

export default manpowerSalaryService;