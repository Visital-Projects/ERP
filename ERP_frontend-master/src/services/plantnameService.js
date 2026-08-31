// src/services/plantNameService.js
import apiClient from "./apiClient";

// ✅ Get all plants - CORRECTED ENDPOINT
const getAllPlants = async () => {
  const res = await apiClient.get("/plants"); // Changed from "/plant-name" to "/plants"
  return res.data.data;
};

// ✅ Get plant by ID - CORRECTED ENDPOINT
const getPlantById = async (id) => {
  const res = await apiClient.get(`/plants/${id}`); // Changed from "/plant-name" to "/plants"
  return res.data.data;
};

// ✅ Get plants by job mode ID - CORRECTED ENDPOINT
const getPlantsByJobModeId = async (jobModeId) => {
  const res = await apiClient.get(`/plants/jobmode/${jobModeId}`); // Changed from "/plant-name" to "/plants"
  return res.data.data;
};

// ✅ Create plant - CORRECTED ENDPOINT
const createPlant = async (plantData) => {
  const res = await apiClient.post("/plants", plantData); // Changed from "/plant-name" to "/plants"
  return res.data.data;
};

// ✅ Update plant - CORRECTED ENDPOINT
const updatePlant = async (plantId, plantData) => {
  const res = await apiClient.put(`/plants/${plantId}`, plantData); // Changed from "/plant-name" to "/plants"
  return res.data.data;
};

// ✅ Delete plant - CORRECTED ENDPOINT
const deletePlant = async (plantId) => {
  const res = await apiClient.delete(`/plants/${plantId}`); // Changed from "/plant-name" to "/plants"
  return res.data;
};

const plantNameService = {
  getAllPlants,
  getPlantById,
  getPlantsByJobModeId,
  createPlant,
  updatePlant,
  deletePlant,
};

export default plantNameService;