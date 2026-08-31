// frontend/src/services/performanceTypeService.js
import apiClient from "./apiClient"; // Make sure apiClient includes Authorization headers

const ENDPOINT = "/performance-types";

// ✅ Get all performance types
export const getPerformanceTypes = async () => {
  try {
    const res = await apiClient.get(ENDPOINT);
    return res.data?.data || []; // returns array of types
  } catch (error) {
    console.error("Failed to fetch performance types:", error);
    return [];
  }
};

// ✅ Create a performance type
export const createPerformanceType = async (data) => {
  try {
    const res = await apiClient.post(ENDPOINT, data);
    return res.data?.data || null; // returns the created type
  } catch (error) {
    console.error("Failed to create performance type:", error);
    throw error;
  }
};

// ✅ Update a performance type
export const updatePerformanceType = async (id, data) => {
  try {
    const res = await apiClient.put(`${ENDPOINT}/${id}`, data);
    return res.data?.data || null; // returns updated type
  } catch (error) {
    console.error("Failed to update performance type:", error);
    throw error;
  }
};

// ✅ Delete a performance type
export const deletePerformanceType = async (id) => {
  try {
    const res = await apiClient.delete(`${ENDPOINT}/${id}`);
    return res.data?.message || "Deleted successfully";
  } catch (error) {
    console.error("Failed to delete performance type:", error);
    throw error;
  }
};

// ✅ Get single performance type by ID (optional)
export const getPerformanceTypeById = async (id) => {
  try {
    const res = await apiClient.get(`${ENDPOINT}/${id}`);
    return res.data?.data || null;
  } catch (error) {
    console.error("Failed to fetch performance type:", error);
    return null;
  }
};
