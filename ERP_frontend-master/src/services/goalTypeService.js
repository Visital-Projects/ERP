import apiClient from "./apiClient";

const ENDPOINT = "/goal-types";

const goalTypeService = {
  // Fetch all goal types
  getAll: async () => {
    try {
      const res = await apiClient.get(ENDPOINT);
      // Return only data array for easier use in frontend
      return Array.isArray(res.data?.data) ? res.data.data : [];
    } catch (err) {
      console.error("Error fetching goal types:", err);
      return [];
    }
  },

  // Create new goal type
  create: async (payload) => {
    try {
      const res = await apiClient.post(ENDPOINT, payload);
      return res.data?.data || null;
    } catch (err) {
      console.error("Error creating goal type:", err);
      return null;
    }
  },

  // Update goal type
  update: async (id, payload) => {
    try {
      const res = await apiClient.put(`${ENDPOINT}/${id}`, payload);
      return res.data?.data || null;
    } catch (err) {
      console.error("Error updating goal type:", err);
      return null;
    }
  },

  // Delete goal type
  remove: async (id) => {
    try {
      const res = await apiClient.delete(`${ENDPOINT}/${id}`);
      return res.data || { success: false };
    } catch (err) {
      console.error("Error deleting goal type:", err);
      return { success: false };
    }
  },
};

export default goalTypeService;
