// src/services/competanceService.js
import apiClient from "./apiClient";

const ENDPOINT = "/competencies";

// ✅ Get all competencies
export const getCompetencies = async () => {
  try {
    const res = await apiClient.get(ENDPOINT);
    return res.data?.data || []; // returns array of competencies
  } catch (error) {
    console.error("Failed to fetch competencies:", error);
    return [];
  }
};

// ✅ Get single competency by ID
export const getCompetencyById = async (id) => {
  try {
    const res = await apiClient.get(`${ENDPOINT}/${id}`);
    return res.data?.data || null; // returns single competency object
  } catch (error) {
    console.error("Failed to fetch competency:", error);
    return null;
  }
};

// ✅ Create a competency
export const createCompetency = async (data) => {
  try {
    const res = await apiClient.post(ENDPOINT, data);
    return res.data?.data || null; // returns created competency
  } catch (error) {
    console.error("Failed to create competency:", error);
    throw error;
  }
};

// ✅ Update a competency
export const updateCompetency = async (id, data) => {
  try {
    const res = await apiClient.put(`${ENDPOINT}/${id}`, data);
    return res.data?.data || null; // returns updated competency
  } catch (error) {
    console.error("Failed to update competency:", error);
    throw error;
  }
};

// ✅ Delete a competency
export const deleteCompetency = async (id) => {
  try {
    const res = await apiClient.delete(`${ENDPOINT}/${id}`);
    return res.data?.message || "Deleted successfully";
  } catch (error) {
    console.error("Failed to delete competency:", error);
    throw error;
  }
};

// Optional: get performance types for dropdowns
export const getPerformanceTypes = async () => {
  try {
    const res = await apiClient.get("/performance");
    return res.data?.data || []; // array of performance types
  } catch (error) {
    console.error("Failed to fetch performance types:", error);
    return [];
  }
};
