import apiClient from "./apiClient";

const designationService = {
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get("/designations", { params });
      return response.data?.data || [];
    } catch (error) {
      console.error("Error fetching designations:", error);
      return [];
    }
  },

  getOne: async (id) => {
    try {
      const response = await apiClient.get(`/designations/${id}`);
      return response.data?.data || null;
    } catch (error) {
      console.error(`Error fetching designation ${id}:`, error);
      return null;
    }
  },
  create: async (payload) => {
    try {
      const response = await apiClient.post("/designations", payload);
      return response.data?.data || null;
    } catch (error) {
      console.error("Error creating designation:", error);
      throw error;
    }
  },

  update: async (id, payload) => {
    try {
      const response = await apiClient.put(`/designations/${id}`, payload);
      return response.data?.data || null;
    } catch (error) {
      console.error(`Error updating designation ${id}:`, error);
      throw error;
    }
  },

  remove: async (id) => {
    try {
      const response = await apiClient.delete(`/designations/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting designation ${id}:`, error);
      throw error;
    }
  },
  getByDepartment: async (departmentId) => {
    try {
      const response = await apiClient.get(`/designations/department/${departmentId}`);
      return response.data?.data || [];
    } catch (error) {
      console.error(`Error fetching designations for department ${departmentId}:`, error);
      return [];
    }
  }
};

export default designationService;
