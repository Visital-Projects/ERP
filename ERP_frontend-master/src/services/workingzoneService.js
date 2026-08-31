// // src/services/workingZoneService.js
// import apiClient from "./apiClient"; // your axios instance

// // ✅ Get all working zones
// const getAllWorkingZones = async () => {
//   const res = await apiClient.get("/working-zones");
//   return res.data.data; // returns array of working zones
// };

// // ✅ Get working zones by specific plant ID
// const getWorkingZonesByPlant = async (plantId) => {
//   const res = await apiClient.get(`/working-zones/plant/${plantId}`);
//   return res.data.data; // returns array of working zones for plant
// };

// // ✅ Create working zone
// const createWorkingZone = async (workingZoneData) => {
//   const res = await apiClient.post("/working-zones", workingZoneData);
//   return res.data.data; // returns created working zone object
// };

// // ✅ Update working zone
// const updateWorkingZone = async (workingZoneId, workingZoneData) => {
//   const res = await apiClient.put(`/working-zones/${workingZoneId}`, workingZoneData);
//   return res.data.data; // returns updated working zone object
// };

// // ✅ Delete working zone
// const deleteWorkingZone = async (workingZoneId) => {
//   const res = await apiClient.delete(`/working-zones/${workingZoneId}`);
//   return res.data; // returns { success: true, message: "Working Zone deleted" }
// };

// const workingZoneService = {
//   getAllWorkingZones,
//   getWorkingZonesByPlant,
//   createWorkingZone,
//   updateWorkingZone,
//   deleteWorkingZone,
// };

// export default workingZoneService;



// src/services/workingZoneService.js
import apiClient from "./apiClient"; // your axios instance

// ✅ Get all working zones (includes branch name because backend includes branch association)
const getAllWorkingZones = async () => {
  const res = await apiClient.get("/working-zones");
  return res.data.data; // returns array of working zones with branch info
};

// ✅ Get working zone by ID
const getWorkingZoneById = async (workingZoneId) => {
  const res = await apiClient.get(`/working-zones/${workingZoneId}`);
  return res.data.data;
};

// ✅ Create working zone
const createWorkingZone = async (workingZoneData) => {
  const res = await apiClient.post("/working-zones", workingZoneData);
  return res.data.data;
};

// ✅ Update working zone
const updateWorkingZone = async (workingZoneId, workingZoneData) => {
  const res = await apiClient.put(`/working-zones/${workingZoneId}`, workingZoneData);
  return res.data.data;
};

// ✅ Delete working zone
const deleteWorkingZone = async (workingZoneId) => {
  const res = await apiClient.delete(`/working-zones/${workingZoneId}`);
  return res.data;
};

const workingZoneService = {
  getAllWorkingZones,
  getWorkingZoneById,
  createWorkingZone,
  updateWorkingZone,
  deleteWorkingZone,
};

export default workingZoneService;
