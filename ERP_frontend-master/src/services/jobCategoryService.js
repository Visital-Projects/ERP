import apiClient from "./apiClient";

const ENDPOINT = "/job-categories";

// Fetch all job categories
export const getJobCategories = async () => {
  try {
    const res = await apiClient.get(ENDPOINT);
    // assuming API returns: { success: true, data: [...] }
    return res.data?.data || [];
  } catch (error) {
    console.error("Failed to fetch job categories:", error);
    return [];
  }
};

// Fetch single job category by ID
export const getJobCategoryById = async (id) => {
  try {
    const res = await apiClient.get(`${ENDPOINT}/${id}`);
    return res.data?.data || null;
  } catch (error) {
    console.error("Failed to fetch job category:", error);
    return null;
  }
};

// Create job category
export const createJobCategory = async (data) => {
  try {
    const res = await apiClient.post(ENDPOINT, data);
    return res.data?.data || null;
  } catch (error) {
    console.error("Failed to create job category:", error);
    throw error;
  }
};

// Update job category
export const updateJobCategory = async (id, data) => {
  try {
    const res = await apiClient.put(`${ENDPOINT}/${id}`, data);
    return res.data?.data || null;
  } catch (error) {
    console.error("Failed to update job category:", error);
    throw error;
  }
};

// Delete job category
export const deleteJobCategory = async (id) => {
  try {
    const res = await apiClient.delete(`${ENDPOINT}/${id}`);
    return res.data?.message || "Deleted";
  } catch (error) {
    console.error("Failed to delete job category:", error);
    throw error;
  }
};
