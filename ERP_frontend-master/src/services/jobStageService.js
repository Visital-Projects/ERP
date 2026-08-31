import apiClient from "./apiClient";

const ENDPOINT = "/job-stages";

// ✅ Get all job stages
export const getJobStages = async () => {
  try {
    const res = await apiClient.get(ENDPOINT);
    return res.data?.data || [];
  } catch (error) {
    console.error("Failed to fetch job stages:", error);
    return [];
  }
};

// ✅ Get job stage by ID
export const getJobStageById = async (id) => {
  try {
    const res = await apiClient.get(`${ENDPOINT}/${id}`);
    return res.data?.data || null;
  } catch (error) {
    console.error("Failed to fetch job stage:", error);
    return null;
  }
};

// ✅ Create job stage
export const createJobStage = async (data) => {
  try {
    const res = await apiClient.post(ENDPOINT, data);
    return res.data?.data || null;
  } catch (error) {
    console.error("Failed to create job stage:", error);
    throw error;
  }
};

// ✅ Update job stage
export const updateJobStage = async (id, data) => {
  try {
    const res = await apiClient.put(`${ENDPOINT}/${id}`, data);
    return res.data?.data || null;
  } catch (error) {
    console.error("Failed to update job stage:", error);
    throw error;
  }
};

// ✅ Delete job stage
export const deleteJobStage = async (id) => {
  try {
    const res = await apiClient.delete(`${ENDPOINT}/${id}`);
    return res.data?.message || "Deleted successfully";
  } catch (error) {
    console.error("Failed to delete job stage:", error);
    throw error;
  }
};

// ✅ Update job stage order
export const updateJobStageOrder = async (order) => {
  try {
    const res = await apiClient.put(`${ENDPOINT}/reorder`, { order });
    return res.data?.message || "Order updated successfully";
  } catch (error) {
    console.error("Failed to update job stage order:", error);
    throw error;
  }
};
